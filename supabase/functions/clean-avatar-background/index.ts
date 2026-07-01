// Clean an existing avatar's background — Gemini produces a PNG with a clean
// pure-white background, then we chroma-key the white pixels to alpha=0 so the
// imported background asset (avatar-backgrounds bucket) shows through behind
// the silhouette in the donor-facing UI. Idempotent — overwrites cleaned/{id}.png.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const CLEAN_PROMPT = `Replace the entire background behind the person with pure solid white #FFFFFF, edge-to-edge to all four corners. Do NOT modify the person in any way — keep face, hair, skin, clothing, pose, expression, framing strictly identical. Crisp opaque edges around hair and shoulders. No gradient, no shadow, no halo, no texture, no vignette. Output a clean cutout on perfectly uniform pure white background.`;

async function fetchImageAsBase64(url: string): Promise<{ b64: string; mime: string }> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Source image fetch failed: ${resp.status}`);
  const mime = resp.headers.get("content-type") ?? "image/png";
  const buf = new Uint8Array(await resp.arrayBuffer());
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) {
    bin += String.fromCharCode(...buf.subarray(i, i + chunk));
  }
  return { b64: btoa(bin), mime };
}

async function geminiWhiteBackground(sourceUrl: string): Promise<Uint8Array> {
  const { b64, mime } = await fetchImageAsBase64(sourceUrl);
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image-preview",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: CLEAN_PROMPT },
          { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
        ],
      }],
      modalities: ["image", "text"],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    const err: any = new Error(`AI gateway ${resp.status}: ${t}`);
    err.gatewayStatus = resp.status;
    if (resp.status === 402) err.code = "no_credits";
    else if (resp.status === 429) err.code = "rate_limited";
    throw err;
  }
  const data = await resp.json();
  const dataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl) throw new Error("No image returned from gateway");
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * Chroma-key: convert near-white pixels to alpha=0, fade mid-white for
 * anti-aliased edges around hair/shoulders, keep subject opaque.
 * Returns the transparent PNG bytes plus the transparent pixel ratio.
 */
async function whiteToAlpha(pngBytes: Uint8Array): Promise<{ bytes: Uint8Array; transparentRatio: number }> {
  const img = await Image.decode(pngBytes);
  const { width, height } = img;
  let transparent = 0;
  const total = width * height;

  // imagescript stores pixels as 0xRRGGBBAA uint32
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = img.getPixelAt(x + 1, y + 1); // imagescript is 1-indexed
      const r = (px >>> 24) & 0xff;
      const g = (px >>> 16) & 0xff;
      const b = (px >>> 8) & 0xff;
      const minC = Math.min(r, g, b);
      const maxC = Math.max(r, g, b);
      const chroma = maxC - minC;

      let alpha = 255;
      if (minC >= 248 && chroma <= 6) {
        alpha = 0;
        transparent++;
      } else if (minC >= 225 && chroma <= 14) {
        // soft anti-alias ramp 225..248 → 255..0
        const t = (minC - 225) / (248 - 225);
        alpha = Math.round(255 * (1 - t));
      }

      img.setPixelAt(x + 1, y + 1, ((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (alpha & 0xff));
    }
  }

  const encoded = await img.encode(); // PNG with alpha
  return { bytes: encoded, transparentRatio: transparent / total };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const beneficiary_id: string | undefined = body.beneficiary_id;
    // Optional: clean an arbitrary version rather than the beneficiary's active/preview avatar.
    const explicitSourceUrl: string | undefined = body.source_url;
    const versionId: string | undefined = body.version_id;
    // "final" → clean avatar_url (default). "preview" → clean avatar_preview_url.
    // Ignored when source_url is provided (beneficiary row is NOT mutated in that mode).
    const targetMode: "final" | "preview" = body.target === "preview" ? "preview" : "final";
    if (!beneficiary_id) throw new Error("beneficiary_id required");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    let rawUrl: string | null = null;
    if (explicitSourceUrl) {
      rawUrl = explicitSourceUrl;
    } else {
      const { data: b, error: bErr } = await supabase
        .from("beneficiaries")
        .select("id, avatar_url, avatar_preview_url")
        .eq("id", beneficiary_id)
        .single();
      if (bErr || !b) throw new Error("Beneficiary not found");
      rawUrl = targetMode === "preview" ? b.avatar_preview_url : b.avatar_url;
      if (!rawUrl) throw new Error(`Beneficiary has no ${targetMode} avatar to clean`);
    }

    // Strip cache-busting query string before fetch
    const sourceUrl = rawUrl.split("?")[0];

    // 1) Ask Gemini for a clean pure-white background
    const whitePng = await geminiWhiteBackground(sourceUrl);

    // 2) Server-side chroma-key: white → transparent
    const { bytes: transparentPng, transparentRatio } = await whiteToAlpha(whitePng);

    const mode = explicitSourceUrl ? "version" : targetMode;
    console.log(`[clean-avatar-background] ${beneficiary_id} (${mode}) transparent_ratio=${transparentRatio.toFixed(3)}`);

    if (transparentRatio < 0.05) {
      throw new Error(
        `Détourage raté (seulement ${(transparentRatio * 100).toFixed(1)}% transparent). Réessayez — Gemini n'a pas produit un fond blanc propre.`,
      );
    }

    // 3) Upload. Distinct path per mode to avoid collisions.
    const ts = Date.now();
    let fileName: string;
    if (explicitSourceUrl) {
      const suffix = versionId ?? crypto.randomUUID();
      fileName = `cleaned/version-${beneficiary_id}-${suffix}.png`;
    } else if (targetMode === "preview") {
      fileName = `cleaned/preview-${beneficiary_id}.png`;
    } else {
      fileName = `cleaned/${beneficiary_id}.png`;
    }
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(fileName, transparentPng, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const newUrl = `${u.publicUrl}?t=${ts}`;

    // In "version" mode, do NOT mutate the beneficiary row — just archive the cleaned version.
    if (!explicitSourceUrl) {
      const updatePatch = targetMode === "preview"
        ? { avatar_preview_url: newUrl }
        : { avatar_url: newUrl };
      await supabase
        .from("beneficiaries")
        .update(updatePatch)
        .eq("id", beneficiary_id);
    }

    await supabase.from("avatar_versions").insert({
      beneficiary_id,
      image_url: u.publicUrl,
      model_used: `clean-bg/${mode}/google/gemini-3.1-flash-image-preview+chroma-key`,
      prompt: CLEAN_PROMPT,
    });

    return new Response(JSON.stringify({ success: true, newUrl, transparentRatio, target: mode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("clean-avatar-background error:", e);
    const status =
      e.gatewayStatus === 429 ? 429 :
      e.gatewayStatus === 402 ? 402 :
      500;
    const message =
      e.code === "no_credits"
        ? "Crédits Lovable AI épuisés. Ajoutez des crédits dans Workspace > Usage."
        : e.code === "rate_limited"
        ? "Trop de requêtes — patientez quelques secondes puis réessayez."
        : e.message ?? "Erreur inconnue";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
