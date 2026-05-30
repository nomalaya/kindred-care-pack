// Clean an existing avatar's background — produces a PNG with a fully
// TRANSPARENT background (alpha channel) so the imported background asset
// from the `avatar-backgrounds` bucket shows through behind the silhouette
// in the donor-facing UI. Idempotent: re-running overwrites cleaned/{id}.png.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const CLEAN_PROMPT = `Remove the entire background behind the person. Output a PNG with a FULLY TRANSPARENT background (alpha channel = 0 on every non-subject pixel, edge-to-edge to all four corners). Do NOT modify the person in any way — keep face, hair, skin, clothing, pose, expression, framing strictly identical. Crisp anti-aliased edges around hair and shoulders. No white halo, no color fringing, no shadow, no gradient, no vignette, no checkerboard. The only visible pixels must be the subject; everything else must be transparent.`;

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

async function editImageBackground(sourceUrl: string): Promise<Uint8Array> {
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { beneficiary_id } = await req.json();
    if (!beneficiary_id) throw new Error("beneficiary_id required");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: b, error: bErr } = await supabase
      .from("beneficiaries")
      .select("id, avatar_url")
      .eq("id", beneficiary_id)
      .single();
    if (bErr || !b) throw new Error("Beneficiary not found");
    if (!b.avatar_url) throw new Error("Beneficiary has no avatar to clean");

    // Strip any cache-busting query string before fetch
    const sourceUrl = b.avatar_url.split("?")[0];

    const cleanedBytes = await editImageBackground(sourceUrl);

    // Idempotent path — overwrite on re-run
    const ts = Date.now();
    const fileName = `cleaned/${beneficiary_id}.png`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(fileName, cleanedBytes, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const newUrl = `${u.publicUrl}?t=${ts}`;

    await supabase
      .from("beneficiaries")
      .update({ avatar_url: newUrl })
      .eq("id", beneficiary_id);

    // Archive previous version was already in avatar_versions; insert new cleaned snapshot
    await supabase.from("avatar_versions").insert({
      beneficiary_id,
      image_url: u.publicUrl,
      model_used: "clean-bg/google/gemini-3.1-flash-image-preview",
      prompt: CLEAN_PROMPT,
    });

    return new Response(JSON.stringify({ success: true, newUrl }), {
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
