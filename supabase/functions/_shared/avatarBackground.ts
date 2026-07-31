// Background cleanup for a freshly generated avatar — used IN-PROCESS by
// `generate-avatar` (the standalone `clean-avatar-background` edge function and
// its Avatar Studio button have been removed).
//
// The generator produces a PNG on a plain white background; here we chroma-key
// the white pixels to alpha=0 so the imported background asset shows through
// behind the silhouette in the donor-facing UI. Idempotent.
//
// COST: when the source already HAS a plain white background (the normal case),
// no AI call is made at all — pure chroma-key, zero credits. The AI
// white-background pass is a fallback only, routed through `imageProvider`
// (Google direct route when configured, never Lovable credits).
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";
import { trimToStudioBox } from "./avatarNormalize.ts";
import { generateAvatarImage } from "./imageProvider.ts";

const CLEAN_MODEL = "google/gemini-3.1-flash-image-preview";

const CLEAN_PROMPT =
  `Replace the entire background behind the person with pure solid white #FFFFFF, edge-to-edge to all four corners. Do NOT modify the person in any way — keep face, hair, skin, clothing, pose, expression, framing strictly identical. Crisp opaque edges around hair and shoulders. No gradient, no shadow, no halo, no texture, no vignette. Output a clean cutout on perfectly uniform pure white background.`;

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

/** Border test: is the background ALREADY plain white / already transparent? */
function backgroundAlreadyClean(img: Image): boolean {
  const { width, height } = img;
  const step = Math.max(1, Math.round(Math.min(width, height) / 128));
  let clean = 0;
  let total = 0;
  const test = (x: number, y: number) => {
    const px = img.getPixelAt(x, y);
    const r = (px >>> 24) & 0xff;
    const g = (px >>> 16) & 0xff;
    const b = (px >>> 8) & 0xff;
    const a = px & 0xff;
    total++;
    const minC = Math.min(r, g, b);
    const chroma = Math.max(r, g, b) - minC;
    if (a < 16 || (minC >= 244 && chroma <= 8)) clean++;
  };
  for (let x = 1; x <= width; x += step) {
    test(x, 1);
    test(x, height);
  }
  for (let y = 1; y <= height; y += step) {
    test(1, y);
    test(width, y);
  }
  return total > 0 && clean / total >= 0.97;
}

/** Fallback only: ask the image model for a pure-white background. */
async function aiWhiteBackground(sourceUrl: string): Promise<Uint8Array> {
  const { b64, mime } = await fetchImageAsBase64(sourceUrl);
  return await generateAvatarImage(CLEAN_PROMPT, CLEAN_MODEL, `data:${mime};base64,${b64}`);
}

/** Share of fully transparent pixels — tells whether the PNG is already cut out. */
async function transparentPixelRatio(pngBytes: Uint8Array): Promise<number> {
  try {
    const img = await Image.decode(pngBytes);
    const { width, height } = img;
    const step = Math.max(1, Math.round(Math.min(width, height) / 256));
    let transparent = 0;
    let total = 0;
    for (let y = 1; y <= height; y += step) {
      for (let x = 1; x <= width; x += step) {
        total++;
        if ((img.getPixelAt(x, y) & 0xff) < 16) transparent++;
      }
    }
    return total > 0 ? transparent / total : 0;
  } catch (_e) {
    return 0;
  }
}

async function whiteToAlpha(
  pngBytes: Uint8Array,
): Promise<{ bytes: Uint8Array; transparentRatio: number }> {
  const img = await Image.decode(pngBytes);
  const { width, height } = img;
  let transparent = 0;
  const total = width * height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = img.getPixelAt(x + 1, y + 1); // imagescript is 1-indexed
      const r = (px >>> 24) & 0xff;
      const g = (px >>> 16) & 0xff;
      const b = (px >>> 8) & 0xff;
      const minC = Math.min(r, g, b);
      const chroma = Math.max(r, g, b) - minC;

      let alpha = 255;
      if (minC >= 248 && chroma <= 6) {
        alpha = 0;
        transparent++;
      } else if (minC >= 225 && chroma <= 14) {
        const t = (minC - 225) / (248 - 225);
        alpha = Math.round(255 * (1 - t));
      }

      img.setPixelAt(
        x + 1,
        y + 1,
        ((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (alpha & 0xff),
      );
    }
  }

  const encoded = await img.encode(); // PNG with alpha
  return { bytes: encoded, transparentRatio: transparent / total };
}

/**
 * Cleans the beneficiary's active (`final`) or preview avatar background and
 * rewrites the corresponding column with the transparent PNG URL.
 */
export async function cleanAvatarBackground(
  supabase: any,
  opts: { beneficiary_id: string; target?: "preview" | "final" },
): Promise<{ newUrl: string; transparentRatio: number }> {
  const { beneficiary_id } = opts;
  const targetMode: "preview" | "final" = opts.target === "preview" ? "preview" : "final";

  const { data: b, error: bErr } = await supabase
    .from("beneficiaries")
    .select("id, avatar_url, avatar_preview_url")
    .eq("id", beneficiary_id)
    .single();
  if (bErr || !b) throw new Error("Beneficiary not found");
  const rawUrl: string | null = targetMode === "preview" ? b.avatar_preview_url : b.avatar_url;
  if (!rawUrl) throw new Error(`Beneficiary has no ${targetMode} avatar to clean`);

  const sourceUrl = rawUrl.split("?")[0];

  // 1) Background pass. Free path first.
  const srcResp = await fetch(sourceUrl);
  if (!srcResp.ok) throw new Error(`Source image fetch failed: ${srcResp.status}`);
  const srcBytes = new Uint8Array(await srcResp.arrayBuffer());
  let whitePng: Uint8Array<ArrayBufferLike> = srcBytes;
  let aiPass = false;
  try {
    const probe = await Image.decode(srcBytes);
    if (!backgroundAlreadyClean(probe)) {
      whitePng = await aiWhiteBackground(sourceUrl);
      aiPass = true;
    }
  } catch (_e) {
    whitePng = await aiWhiteBackground(sourceUrl);
    aiPass = true;
  }
  console.log(`[clean-bg] ${beneficiary_id} ai_pass=${aiPass}`);

  // 2) Chroma-key white → transparent (skipped when already cut out).
  let keyedPng: Uint8Array<ArrayBufferLike> = whitePng;
  let transparentRatio = 1;
  const preAlpha = await transparentPixelRatio(whitePng);
  if (preAlpha >= 0.05) {
    transparentRatio = preAlpha;
  } else {
    const keyed = await whiteToAlpha(whitePng);
    keyedPng = keyed.bytes;
    transparentRatio = keyed.transparentRatio;
  }

  // 2b) Trombinoscope box (zero AI credit): common top headroom, bust flush with
  // the bottom edge so the donor circle never shows an empty band.
  let transparentPng = keyedPng;
  try {
    const { bytes: trimmed, report } = await trimToStudioBox(keyedPng);
    transparentPng = trimmed;
    console.log(
      `[clean-bg] studio-box changed=${report.changed} scale=${report.scale} ` +
      `bottom_margin=${report.bottomMarginPct}%`,
    );
  } catch (e) {
    console.error("[clean-bg] studio-box failed — keeping keyed bytes", e);
  }

  console.log(`[clean-bg] ${beneficiary_id} (${targetMode}) transparent_ratio=${transparentRatio.toFixed(3)}`);
  if (transparentRatio < 0.05) {
    throw new Error(
      `Détourage raté (seulement ${(transparentRatio * 100).toFixed(1)}% transparent).`,
    );
  }

  // 3) Upload
  const ts = Date.now();
  const fileName = targetMode === "preview"
    ? `cleaned/preview-${beneficiary_id}.png`
    : `cleaned/${beneficiary_id}.png`;
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(fileName, transparentPng, { contentType: "image/png", upsert: true });
  if (upErr) throw upErr;

  const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
  const newUrl = `${u.publicUrl}?t=${ts}`;

  const updatePatch = targetMode === "preview"
    ? { avatar_preview_url: newUrl }
    : { avatar_url: newUrl };
  await supabase.from("beneficiaries").update(updatePatch).eq("id", beneficiary_id);

  await supabase.from("avatar_versions").insert({
    beneficiary_id,
    image_url: u.publicUrl,
    model_used: `clean-bg/${targetMode}/${CLEAN_MODEL}+chroma-key`,
    prompt: CLEAN_PROMPT,
  });

  return { newUrl, transparentRatio };
}
