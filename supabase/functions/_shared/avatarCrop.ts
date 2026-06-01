// Deterministic avatar crop: zoom-in + face-centered, fills the full 1:1 square.
// No white padding — the cropped window is rescaled to the original canvas size,
// so the face stays visually centered around `faceY` and the image always
// reaches every edge.
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

export const CROP_ZOOM_DEFAULT = 1.35;
export const CROP_FACE_Y_DEFAULT = 0.38;

export interface CropOptions {
  zoom?: number;
  faceY?: number;
}

export async function cropAvatarBytes(
  pngBytes: Uint8Array,
  opts: CropOptions = {},
): Promise<Uint8Array> {
  const zoom = Math.min(2.5, Math.max(1.0, opts.zoom ?? CROP_ZOOM_DEFAULT));
  const faceY = Math.min(0.6, Math.max(0.2, opts.faceY ?? CROP_FACE_Y_DEFAULT));

  const img = await Image.decode(pngBytes);
  const w = img.width;
  const h = img.height;

  // Square window that occupies 1/zoom of the source width, centered horizontally
  // and vertically around faceY*h. Clamped to stay inside the image.
  const side = Math.max(1, Math.round(w / zoom));
  const cx = Math.round(w / 2);
  const cy = Math.round(h * faceY);
  let x1 = cx - Math.round(side / 2);
  let y1 = cy - Math.round(side / 2);
  x1 = Math.max(0, Math.min(x1, w - side));
  y1 = Math.max(0, Math.min(y1, h - side));

  // imagescript crop is 1-indexed (x, y, width, height).
  const cropped = img.crop(x1 + 1, y1 + 1, side, side);
  // Rescale back to the original canvas so the avatar always fills the 1:1 frame.
  cropped.resize(w, w);

  return await cropped.encode();
}
