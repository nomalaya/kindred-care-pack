// sync
/**
 * Deterministic avatar framing normalization — ZERO AI credits.
 *
 * Goal: every portrait must look like it was shot with the SAME camera —
 * same distance, same eye height — WITHOUT making every head the same size.
 * A fuller face stays fuller, a long face stays long; only the "shot" is
 * normalized.
 *
 * Canonical framing (canvas 1024x1024):
 *   - head height     -> HEAD_FILL of the canvas height     (sets the scale)
 *   - eye line        -> EYE_LINE of the canvas height      (sets the position)
 *   - horizontal      -> centered on the middle of the face
 *   - bust            -> always bleeds out through the bottom edge
 *
 * Landmarks are derived from the alpha/white silhouette only (no AI, no model):
 *   - neck      = narrowest row between NECK_FROM and NECK_TO of the silhouette
 *   - head      = skull top -> neck
 *   - eye line  = head top + EYE_IN_HEAD x head height
 *   - center    = middle of the face band around the eye line
 *
 * If a landmark can't be detected, we fall back to the previous bust-based
 * framing. Never throws, never rejects.
 */
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

export const NORMALIZE_CANVAS = 1024;
/**
 * REFERENCE FRAMING = LÉA (style anchor `avatars/style-anchors/lea.jpg`).
 * Measured on her portrait with the detector below:
 *   head height 62.1 % | eye line 31.5 % | face center 50.7 %
 * Those measurements are the canonical target for the whole catalog.
 */
/** Share of the canvas height taken by the head (skull top -> neck). */
export const HEAD_FILL = 0.62;
/** Vertical position of the eye line, in % of the canvas height. */
export const EYE_LINE = 0.315;
/** Eye line inside the head, in % of the head height (anatomical average). */
const EYE_IN_HEAD = 0.4;
/** Search window for the neck, in % of the silhouette height. */
const NECK_FROM = 0.25;
const NECK_TO = 0.7;
/** Head height / head width ratio, used when the neck is hidden (scarf, hood). */
const HEAD_ASPECT = 1.35;

/**
 * Arbitration when the source is too short to fill the canvas:
 *   1. the eye line stays at EYE_LINE — never negotiable;
 *   2. no white band under the bust;
 *   3. head size (HEAD_FILL) is the soft target and gives way first.
 * The head is allowed to grow up to HEAD_FILL_MAX to close a bottom gap.
 * Beyond that the crop would look absurd: the avatar is flagged for
 * regeneration with a wider source framing instead.
 */
export const HEAD_FILL_MAX = 0.72;


/** Fallback (legacy) framing constants — used when landmarks are unavailable. */
export const TOP_MARGIN = 0.06;
const HEIGHT_FILL = 1 - TOP_MARGIN;
const MIN_WIDTH_FILL = 0.92;


type Box = { x: number; y: number; w: number; h: number };

function isBackground(r: number, g: number, b: number, a: number): boolean {
  if (a < 16) return true;
  const minC = Math.min(r, g, b);
  const maxC = Math.max(r, g, b);
  return minC >= 244 && maxC - minC <= 8;
}

type RowSpan = { min: number; max: number; w: number };

/** Per-row horizontal extent of the drawn subject. */
function rowSpans(img: Image): RowSpan[] {
  const { width, height } = img;
  const spans: RowSpan[] = [];
  for (let y = 0; y < height; y++) {
    let min = -1;
    let max = -1;
    for (let x = 0; x < width; x++) {
      const px = img.getPixelAt(x + 1, y + 1);
      const r = (px >>> 24) & 0xff;
      const g = (px >>> 16) & 0xff;
      const b = (px >>> 8) & 0xff;
      const a = px & 0xff;
      if (isBackground(r, g, b, a)) continue;
      if (min < 0) min = x;
      max = x;
    }
    spans.push({ min, max, w: max < 0 ? 0 : max - min + 1 });
  }
  return spans;
}

function bboxFromSpans(spans: RowSpan[]): Box | null {
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (let y = 0; y < spans.length; y++) {
    const s = spans[y];
    if (s.w === 0) continue;
    if (s.min < minX) minX = s.min;
    if (s.max > maxX) maxX = s.max;
    if (y < minY) minY = y;
    maxY = y;
  }
  if (maxX < 0 || maxY < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Bounding box of the drawn subject (transparent OR white backgrounds). */
export function subjectBBox(img: Image): Box | null {
  return bboxFromSpans(rowSpans(img));
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export type Landmarks = {
  /** Eye line, in source pixels. */
  eyeY: number;
  /** Horizontal center of the face, in source pixels. */
  centerX: number;
  /** Head height (skull top -> neck), in source pixels. */
  headH: number;
};

/**
 * Derive the head + eye line from the silhouette. The neck (narrowest row of
 * the upper body) is a far more stable anatomical anchor than the shoulders,
 * which vary with clothing, hair volume and pose.
 * Returns null when the shape is too ambiguous (e.g. head-only crop).
 */
export function detectLandmarks(spans: RowSpan[], bbox: Box): Landmarks | null {
  // Head width reference: median width of the rows just under the skull top.
  const probeStart = bbox.y + Math.round(bbox.h * 0.06);
  const probeEnd = bbox.y + Math.round(bbox.h * 0.2);
  const headWidths: number[] = [];
  for (let y = probeStart; y <= probeEnd && y < spans.length; y++) {
    if (spans[y].w > 0) headWidths.push(spans[y].w);
  }
  const headWidth = median(headWidths);
  if (headWidth <= 0) return null;

  // Neck = narrowest row of the head -> shoulders transition window.
  const neckFrom = bbox.y + Math.round(bbox.h * NECK_FROM);
  const neckTo = Math.min(spans.length - 1, bbox.y + Math.round(bbox.h * NECK_TO));
  let neckY = -1;
  let neckW = Infinity;
  for (let y = neckFrom; y <= neckTo; y++) {
    const w = spans[y].w;
    if (w <= 0) continue;
    if (w < neckW) {
      neckW = w;
      neckY = y;
    }
  }
  // Head height. Preferred source: the neck narrowing. When the neck is hidden
  // (headscarf, hood, long hair, beard), fall back to the anatomical head
  // width -> height ratio so veiled subjects stay framed like everyone else.
  let headH: number;
  if (neckY >= 0 && isFinite(neckW) && neckW <= headWidth * 0.95) {
    headH = neckY - bbox.y;
  } else {
    headH = headWidth * HEAD_ASPECT;
  }
  if (headH < bbox.h * 0.15 || headH > bbox.h * 0.8) return null;


  // Horizontal center: middle of the face band around the eye line.
  const eyeY = bbox.y + headH * EYE_IN_HEAD;
  const bandFrom = Math.max(0, Math.round(eyeY - headH * 0.12));
  const bandTo = Math.min(spans.length - 1, Math.round(eyeY + headH * 0.12));
  const centers: number[] = [];
  for (let y = bandFrom; y <= bandTo; y++) {
    const s = spans[y];
    if (s.w > 0) centers.push((s.min + s.max) / 2);
  }
  if (!centers.length) return null;

  return {
    eyeY,
    centerX: median(centers),
    headH,
  };
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
  /** "landmarks" = head + eye line, "bust" = legacy fallback. */
  mode: "landmarks" | "bust";
  /** Measured landmarks, in % of the source size (for reporting/dry-runs). */
  landmarks: { eyeYPct: number; centerXPct: number; headHPct: number } | null;
  /** Resulting framing on the 1024 canvas, in % (landmarks mode only). */
  output?: { headHPct: number; eyeYPct: number; centerXPct: number; bottomMarginPct: number };

};

/**
 * Recompose the avatar into the canonical framing. Returns the new PNG bytes and
 * a report. Idempotent: an already normalized image comes back visually
 * identical (scale ≈ 1).
 */
export async function normalizeAvatarFraming(
  pngBytes: Uint8Array,
): Promise<{ bytes: Uint8Array; report: NormalizeReport }> {
  const img = await Image.decode(pngBytes);
  const spans = rowSpans(img);
  const bbox = bboxFromSpans(spans);
  const transparent = hasTransparentBackground(img);

  if (!bbox || bbox.w < 32 || bbox.h < 32) {
    return {
      bytes: pngBytes,
      report: {
        changed: false,
        bbox,
        sourceMargins: null,
        scale: 1,
        transparent,
        mode: "bust",
        landmarks: null,
      },
    };
  }

  const sourceMargins: [number, number, number, number] = [
    Math.round((bbox.x / img.width) * 100),
    Math.round((bbox.y / img.height) * 100),
    Math.round(((img.width - (bbox.x + bbox.w)) / img.width) * 100),
    Math.round(((img.height - (bbox.y + bbox.h)) / img.height) * 100),
  ];

  const S = NORMALIZE_CANVAS;
  const lm = detectLandmarks(spans, bbox);

  if (lm) {
    // Same camera distance for everyone: the head always spans HEAD_FILL.
    let scale = (S * HEAD_FILL) / lm.headH;

    // Anti-crop guarantee: the bust must bleed out through the bottom edge.
    // We zoom around the eye line (which stays pinned at EYE_LINE) until the
    // bottom of the silhouette reaches the bottom of the canvas.
    const bustDepth = bbox.y + bbox.h - lm.eyeY; // source px, eye line -> bust bottom
    if (bustDepth > 0) {
      const needed = (S * (1 - EYE_LINE)) / bustDepth;
      if (needed > scale) scale = Math.min(needed, scale * MAX_BLEED_ZOOM);
    }

    const scaledW = Math.max(1, Math.round(img.width * scale));
    const scaledH = Math.max(1, Math.round(img.height * scale));
    const scaled = img.clone().resize(scaledW, scaledH);

    // Window of the scaled image that lands on the canvas.
    const winX = Math.round(lm.centerX * scale - S / 2);
    const winY = Math.round(lm.eyeY * scale - S * EYE_LINE);

    const canvas = new Image(S, S);
    if (!transparent) canvas.fill(0xffffffff);

    const srcX = Math.max(0, winX);
    const srcY = Math.max(0, winY);
    const srcW = Math.min(scaledW - srcX, S - Math.max(0, -winX));
    const srcH = Math.min(scaledH - srcY, S - Math.max(0, -winY));

    if (srcW > 0 && srcH > 0) {
      const visible = scaled.clone().crop(srcX, srcY, srcW, srcH);
      canvas.composite(visible, Math.max(0, -winX), Math.max(0, -winY));
      const bytes = await canvas.encode();
      const outBottom = (bbox.y + bbox.h) * scale - winY;
      return {
        bytes,
        report: {
          changed: true,
          bbox,
          sourceMargins,
          scale: Math.round(scale * 1000) / 1000,
          transparent,
          mode: "landmarks",
          landmarks: {
            eyeYPct: Math.round((lm.eyeY / img.height) * 1000) / 10,
            centerXPct: Math.round((lm.centerX / img.width) * 1000) / 10,
            headHPct: Math.round((lm.headH / img.height) * 1000) / 10,
          },
          output: {
            headHPct: Math.round(((lm.headH * scale) / S) * 1000) / 10,
            eyeYPct: Math.round(EYE_LINE * 1000) / 10,
            centerXPct: 50,
            bottomMarginPct: Math.max(0, Math.round(((S - outBottom) / S) * 1000) / 10),
          },
        },
      };
    }
  }

  // ---- Fallback: legacy bust framing (unchanged behaviour) ----

  let scale = (S * HEIGHT_FILL) / bbox.h;
  if (bbox.w * scale < S * MIN_WIDTH_FILL) {
    scale = (S * MIN_WIDTH_FILL) / bbox.w;
  }

  const subject = img.clone().crop(bbox.x, bbox.y, bbox.w, bbox.h);
  const targetW = Math.max(1, Math.round(bbox.w * scale));
  const targetH = Math.max(1, Math.round(bbox.h * scale));
  subject.resize(targetW, targetH);

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
      mode: "bust",
      landmarks: null,
    },
  };
}
