// sync
/**
 * Deterministic avatar framing normalization — ZERO AI credits.
 *
 * Image models never place the subject at a consistent size inside the square
 * canvas (measured spread on the published catalog: 9%..24% of empty margin per
 * side). In the donor-facing UI the square is cropped to a circle, so any empty
 * margin makes the portrait look tiny and "floating", with a white gap under the
 * bust.
 *
 * This module recomposes any avatar PNG into a single canonical framing:
 *   - top of the head at TOP_MARGIN of the canvas height
 *   - bust bleeding out through the BOTTOM edge (no empty band under the bust)
 *   - shoulders filling the width (bleeding out on the sides when needed)
 *
 * It is purely geometric: no pixel of the drawing is altered, only translated
 * and scaled. Transparent-background avatars stay transparent; white-background
 * avatars stay white.
 */
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

export const NORMALIZE_CANVAS = 1024;
/** White space kept above the top of the head, in % of the canvas height. */
export const TOP_MARGIN = 0.06;
/** Subject height target = canvas height - top margin (bottom bleeds out). */
const HEIGHT_FILL = 1 - TOP_MARGIN;
/** Minimum share of the canvas width the subject must occupy. */
const MIN_WIDTH_FILL = 0.92;

type Box = { x: number; y: number; w: number; h: number };

function isBackground(r: number, g: number, b: number, a: number): boolean {
  if (a < 16) return true;
  const minC = Math.min(r, g, b);
  const maxC = Math.max(r, g, b);
  return minC >= 244 && maxC - minC <= 8;
}

/** Bounding box of the drawn subject (works on transparent OR white backgrounds). */
export function subjectBBox(img: Image): Box | null {
  const { width, height } = img;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = img.getPixelAt(x + 1, y + 1);
      const r = (px >>> 24) & 0xff;
      const g = (px >>> 16) & 0xff;
      const b = (px >>> 8) & 0xff;
      const a = px & 0xff;
      if (isBackground(r, g, b, a)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0 || maxY < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** True when the source image uses a transparent (already chroma-keyed) background. */
function hasTransparentBackground(img: Image): boolean {
  const corners = [
    [1, 1],
    [img.width, 1],
    [1, img.height],
    [img.width, img.height],
  ];
  let transparent = 0;
  for (const [x, y] of corners) {
    if ((img.getPixelAt(x, y) & 0xff) < 16) transparent++;
  }
  return transparent >= 3;
}

export type NormalizeReport = {
  changed: boolean;
  bbox: Box | null;
  /** Margins of the SOURCE image, in % of its size: [left, top, right, bottom]. */
  sourceMargins: [number, number, number, number] | null;
  scale: number;
  transparent: boolean;
};

/**
 * Recompose the avatar into the canonical framing. Returns the new PNG bytes and
 * a report. Idempotent: an already normalized image comes back visually
 * identical (scale ≈ 1, offsets ≈ 0).
 */
export async function normalizeAvatarFraming(
  pngBytes: Uint8Array,
): Promise<{ bytes: Uint8Array; report: NormalizeReport }> {
  const img = await Image.decode(pngBytes);
  const bbox = subjectBBox(img);
  const transparent = hasTransparentBackground(img);

  if (!bbox || bbox.w < 32 || bbox.h < 32) {
    return {
      bytes: pngBytes,
      report: { changed: false, bbox, sourceMargins: null, scale: 1, transparent },
    };
  }

  const sourceMargins: [number, number, number, number] = [
    Math.round((bbox.x / img.width) * 100),
    Math.round((bbox.y / img.height) * 100),
    Math.round(((img.width - (bbox.x + bbox.w)) / img.width) * 100),
    Math.round(((img.height - (bbox.y + bbox.h)) / img.height) * 100),
  ];

  const S = NORMALIZE_CANVAS;

  // Scale so the subject height spans from TOP_MARGIN down to the bottom edge.
  let scale = (S * HEIGHT_FILL) / bbox.h;
  // If that leaves the shoulders too narrow, scale on the width instead and let
  // the bust bleed further out of the bottom edge.
  if (bbox.w * scale < S * MIN_WIDTH_FILL) {
    scale = (S * MIN_WIDTH_FILL) / bbox.w;
  }

  const subject = img.clone().crop(bbox.x, bbox.y, bbox.w, bbox.h);
  const targetW = Math.max(1, Math.round(bbox.w * scale));
  const targetH = Math.max(1, Math.round(bbox.h * scale));
  subject.resize(targetW, targetH);

  // Crop overflow so composite offsets stay non-negative (bleed on sides/bottom).
  let cropX = 0;
  let cropW = targetW;
  if (targetW > S) {
    cropX = Math.floor((targetW - S) / 2);
    cropW = S;
  }
  const topOffset = Math.round(S * TOP_MARGIN);
  let cropH = targetH;
  if (topOffset + targetH > S) {
    cropH = S - topOffset;
  }
  const visible = subject.clone().crop(cropX, 0, cropW, cropH);

  const canvas = new Image(S, S);
  if (!transparent) canvas.fill(0xffffffff);
  canvas.composite(visible, Math.round((S - cropW) / 2), topOffset);

  const bytes = await canvas.encode();
  return {
    bytes,
    report: {
      changed: true,
      bbox,
      sourceMargins,
      scale: Math.round(scale * 1000) / 1000,
      transparent,
    },
  };
}
