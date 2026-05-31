// Deterministic avatar crop applied to every generated/imported avatar.
// Keeps the top `CROP_TOP_KEEP_RATIO` of the source image (head + neck + collarbone),
// then re-pads the bottom with pure white to preserve a 1:1 square canvas so the
// existing white-background → chroma-key pipeline keeps working unchanged.
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

export const CROP_TOP_KEEP_RATIO_DEFAULT = 0.72;

export async function cropAvatarBytes(
  pngBytes: Uint8Array,
  ratio: number = CROP_TOP_KEEP_RATIO_DEFAULT,
): Promise<Uint8Array> {
  const safe = Math.min(0.95, Math.max(0.4, ratio));
  const img = await Image.decode(pngBytes);
  const w = img.width;
  const h = img.height;
  const keep = Math.max(1, Math.round(h * safe));

  // Crop to the top portion (head/neck/collarbone) — imagescript is 1-indexed.
  const cropped = img.crop(1, 1, w, keep);

  // Re-pad bottom with pure white so the canvas stays 1:1 (matches the
  // white-background contract used by clean-avatar-background's chroma-key).
  const canvas = new Image(w, w);
  // 0xRRGGBBAA — pure white, fully opaque.
  canvas.fill(0xffffffff);
  canvas.composite(cropped, 0, 0);

  return await canvas.encode();
}
