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
 *   - shoulder width  -> SHOULDER_FILL of the canvas width  (sets the scale)
 *   - eye line        -> EYE_LINE of the canvas height      (sets the position)
 *   - horizontal      -> centered on the middle of the shoulders
 *   - bust            -> bleeds out through the bottom edge
 *
 * Landmarks are derived from the alpha/white silhouette only (no AI, no model):
 *   - head bottom = first row (from the top) whose width jumps above
 *     SHOULDER_JUMP x the head width -> start of the shoulders
 *   - eye line    = head top + EYE_IN_HEAD x head height
 *   - shoulders   = widest row of the upper half of the silhouette
 *
 * If a landmark can't be detected, we fall back to the previous bust-based
 * framing. Never throws, never rejects.
 */
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

export const NORMALIZE_CANVAS = 1024;
/** Share of the canvas width taken by the shoulders. */
export const SHOULDER_FILL = 0.95;
/** Vertical position of the eye line, in % of the canvas height. */
export const EYE_LINE = 0.38;
/** Eye line inside the head, in % of the head height (anatomical average). */
const EYE_IN_HEAD = 0.4;
/** Width ratio that marks the transition head -> shoulders. */
const SHOULDER_JUMP = 1.45;

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
  /** Horizontal center of the shoulders, in source pixels. */
  centerX: number;
  /** Shoulder width, in source pixels. */
  shoulderW: number;
  /** Head height, in source pixels. */
  headH: number;
};

/**
 * Derive the shoulders + eye line from the silhouette. Returns null when the
 * shape is too ambiguous (e.g. head-only crop, no shoulder transition).
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

  // Shoulders start where the silhouette widens sharply.
  let shoulderY = -1;
  const scanEnd = bbox.y + Math.round(bbox.h * 0.85);
  for (let y = probeEnd; y <= scanEnd && y < spans.length; y++) {
    if (spans[y].w >= headWidth * SHOULDER_JUMP) {
      shoulderY = y;
      break;
    }
  }
  if (shoulderY < 0) return null;

  const headH = shoulderY - bbox.y;
  if (headH < bbox.h * 0.12) return null;

  // Shoulder width + center: widest row from the shoulder line downwards,
  // limited to the upper part of the bust to avoid arms/props.
  let bestY = shoulderY;
  let bestW = spans[shoulderY].w;
  const shoulderScanEnd = Math.min(spans.length - 1, shoulderY + Math.round(headH * 1.2));
  for (let y = shoulderY; y <= shoulderScanEnd; y++) {
    if (spans[y].w > bestW) {
      bestW = spans[y].w;
      bestY = y;
    }
  }
  const span = spans[bestY];
  if (!span || span.w <= 0) return null;

  return {
    eyeY: bbox.y + headH * EYE_IN_HEAD,
    centerX: (span.min + span.max) / 2,
    shoulderW: span.w,
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
  /** "landmarks" = shoulders + eye line, "bust" = legacy fallback. */
  mode: "landmarks" | "bust";
  /** Measured landmarks, in % of the source size (for reporting/dry-runs). */
  landmarks: { eyeYPct: number; centerXPct: number; shoulderWPct: number; headHPct: number } | null;
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
    // Same camera distance for everyone: shoulders always span SHOULDER_FILL.
    const scale = (S * SHOULDER_FILL) / lm.shoulderW;
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
            shoulderWPct: Math.round((lm.shoulderW / img.width) * 1000) / 10,
            headHPct: Math.round((lm.headH / img.height) * 1000) / 10,
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
