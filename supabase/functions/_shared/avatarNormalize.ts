// sync
/**
 * Deterministic avatar framing normalization — ZERO AI credits for the cropping
 * itself (the eye line is measured separately, see avatarEyeLine.ts).
 *
 * TWO independent rules, nothing else:
 *   1. POSITION — the measured eye line lands exactly on EYE_LINE (38 %) of the
 *      canvas height, and the face center on 50 % of the width.
 *   2. SCALE    — the smallest zoom such that the garment covers 100 % of the
 *      bottom edge and leaves no background in the bottom band.
 *
 * No head-height target, no chin target, no hair-top anchor: those made the
 * system over-determined and deformed morphologies (broad shoulders squashed to
 * hit a head-size number). Head size is now whatever the drawing says it is.
 *
 * If the eye line is unknown, we DO NOT crop: the image is returned untouched
 * with `needsRegeneration`, never a blind guess.
 */
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";
import {
  EYE_LINE,
  HAIR_HEADROOM,
  STUDIO_TOP_HEADROOM,
  BOTTOM_WIDTH_FILL,
  BOTTOM_BAND,
  MIN_ZOOM,
  MAX_ZOOM,
} from "./avatarFramingSpec.ts";

export const NORMALIZE_CANVAS = 1024;
export { EYE_LINE, HAIR_HEADROOM, STUDIO_TOP_HEADROOM, BOTTOM_WIDTH_FILL, BOTTOM_BAND, MIN_ZOOM, MAX_ZOOM } from "./avatarFramingSpec.ts";


type Box = { x: number; y: number; w: number; h: number };
type RowSpan = { min: number; max: number; w: number };

function isBackground(r: number, g: number, b: number, a: number): boolean {
  if (a < 16) return true;
  const minC = Math.min(r, g, b);
  const maxC = Math.max(r, g, b);
  return minC >= 244 && maxC - minC <= 8;
}

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
  // Rows covering less than 2 % of the width are noise (stray ink dot, faint
  // sketch mark, keying residue) — ignore them.
  const width = spans.reduce((m, s) => Math.max(m, s.max + 1), 0);
  const minRowW = Math.max(4, Math.round(width * 0.02));
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (let y = 0; y < spans.length; y++) {
    const s = spans[y];
    if (s.w < minRowW) continue;
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

/** True when the source image uses a transparent (already chroma-keyed) background. */
/**
 * Does the PNG carry a real alpha channel (already cut out)?
 *
 * Corner sampling is NOT usable here: the trombinoscope framing pushes the bust
 * to 100% of the bottom width, so both bottom corners are opaque subject pixels.
 * With a corner test the image was wrongly considered opaque and the canvas was
 * flooded with white — baking a white square into cut-out avatars.
 * We therefore look at the whole image and consider it cut out as soon as a
 * meaningful share of pixels is fully transparent.
 */
function hasTransparentBackground(img: Image): boolean {
  const { width, height } = img;
  const step = Math.max(1, Math.round(Math.min(width, height) / 128));
  let transparent = 0;
  let total = 0;
  for (let y = 1; y <= height; y += step) {
    for (let x = 1; x <= width; x += step) {
      total++;
      if ((img.getPixelAt(x, y) & 0xff) < 16) transparent++;
    }
  }
  return total > 0 && transparent / total >= 0.02;
}


export type EyeAnchor = { eyeY: number; centerX: number };

export type NormalizeReport = {
  changed: boolean;
  bbox: Box | null;
  /** Margins of the SOURCE image, in % of its size: [left, top, right, bottom]. */
  sourceMargins: [number, number, number, number] | null;
  scale: number;
  transparent: boolean;
  /** Eye line actually produced on the canvas, in % (target = 38). */
  eyeYPct: number | null;
  /** Garment coverage of the bottom edge, in % of the canvas width. */
  bottomWidthFillPct: number | null;
  /** Worst background gap found in the bottom band, in % of the canvas width. */
  sideGapBottomPct: number | null;
  needsRegeneration?: boolean;
  regenerationReason?: string;
};

const S = NORMALIZE_CANVAS;

/**
 * Coverage of one canvas row by the subject, in [0..1] of the canvas width.
 * `winX`/`winY` are the coordinates (in scaled-source pixels) of the canvas
 * top-left corner.
 */
function rowCoverage(
  spans: RowSpan[],
  scale: number,
  winX: number,
  winY: number,
  canvasY: number,
): number {
  const ySrc = Math.round((winY + canvasY) / scale);
  if (ySrc < 0 || ySrc >= spans.length) return 0;
  const s = spans[ySrc];
  if (s.w <= 0) return 0;
  const left = Math.max(s.min * scale, winX);
  const right = Math.min((s.max + 1) * scale, winX + S);
  return Math.max(0, (right - left) / S);
}

export async function normalizeAvatarFraming(
  pngBytes: Uint8Array,
  eye?: EyeAnchor | null,
): Promise<{ bytes: Uint8Array; report: NormalizeReport }> {
  const img = await Image.decode(pngBytes);
  const spans = rowSpans(img);
  const bbox = bboxFromSpans(spans);
  const transparent = hasTransparentBackground(img);

  const base: NormalizeReport = {
    changed: false,
    bbox,
    sourceMargins: null,
    scale: 1,
    transparent,
    eyeYPct: null,
    bottomWidthFillPct: null,
    sideGapBottomPct: null,
  };

  if (!bbox || bbox.w < 32 || bbox.h < 32) {
    return { bytes: pngBytes, report: base };
  }

  base.sourceMargins = [
    Math.round((bbox.x / img.width) * 100),
    Math.round((bbox.y / img.height) * 100),
    Math.round(((img.width - (bbox.x + bbox.w)) / img.width) * 100),
    Math.round(((img.height - (bbox.y + bbox.h)) / img.height) * 100),
  ];

  if (!eye) {
    return {
      bytes: pngBytes,
      report: {
        ...base,
        needsRegeneration: true,
        regenerationReason:
          "ligne des yeux non mesurée : aucun recadrage effectué (jamais de recadrage à l'aveugle).",
      },
    };
  }

  const eyeSrcY = eye.eyeY * img.height;
  const faceSrcX = eye.centerX * img.width;

  // ---- SCALE: smallest zoom filling the bottom edge, eye line pinned. -------
  const bandTop = Math.round(S * (1 - BOTTOM_BAND));
  const evaluate = (scale: number) => {
    const winY = eyeSrcY * scale - S * EYE_LINE;
    const winX = faceSrcX * scale - S / 2;
    let worst = 1;
    for (let cy = bandTop; cy < S; cy += 8) {
      const c = rowCoverage(spans, scale, winX, winY, cy);
      if (c < worst) worst = c;
    }
    const bottomFill = rowCoverage(spans, scale, winX, winY, S - 1);
    return { winX, winY, worst, bottomFill };
  };

  let scale = MIN_ZOOM;
  let chosen = evaluate(scale);
  let ok = chosen.worst >= BOTTOM_WIDTH_FILL - 0.001;
  if (!ok) {
    let best = { scale, ...chosen };
    for (let s = MIN_ZOOM; s <= MAX_ZOOM + 1e-9; s += 0.01) {
      const r = evaluate(s);
      if (r.worst > best.worst) best = { scale: s, ...r };
      if (r.worst >= BOTTOM_WIDTH_FILL - 0.001) {
        scale = s;
        chosen = r;
        ok = true;
        break;
      }
    }
    if (!ok) {
      scale = best.scale;
      chosen = { winX: best.winX, winY: best.winY, worst: best.worst, bottomFill: best.bottomFill };
    }
  }

  const needsRegeneration = !ok;
  const regenerationReason = ok
    ? undefined
    : "buste insuffisant dans la source : impossible de remplir 100 % du bord bas " +
      "sans inventer le vêtement — régénérer avec épaules complètes + haut de poitrine " +
      `(meilleur remplissage atteint : ${Math.round(chosen.worst * 100)} %).`;

  // ---- RENDER --------------------------------------------------------------
  const scaledW = Math.max(1, Math.round(img.width * scale));
  const scaledH = Math.max(1, Math.round(img.height * scale));
  const scaled = img.clone().resize(scaledW, scaledH);

  const winX = Math.round(chosen.winX);
  // TROMBINOSCOPE GUARD — never crop through hair / veil / hat. If the eye-line
  // window would cut the top of the subject, slide the window DOWN (uniform
  // translation only, no rescale, no deformation) until the required headroom is
  // restored. The eye line is then slightly below EYE_LINE for very tall hair —
  // that is accepted: homogeneity comes from the circular container, not from
  // cutting someone's head.
  const subjectTopScaled = bbox.y * scale;
  const maxWinY = subjectTopScaled - S * HAIR_HEADROOM;
  const winY = Math.round(Math.min(chosen.winY, maxWinY));
  const eyeYPctActual =
    Math.round((((eyeSrcY * scale - winY) / S) * 100) * 10) / 10;


  const canvas = new Image(S, S);
  if (!transparent) canvas.fill(0xffffffff);

  const srcX = Math.max(0, winX);
  const srcY = Math.max(0, winY);
  const srcW = Math.min(scaledW - srcX, S - Math.max(0, -winX));
  const srcH = Math.min(scaledH - srcY, S - Math.max(0, -winY));

  if (srcW <= 0 || srcH <= 0) {
    return {
      bytes: pngBytes,
      report: {
        ...base,
        needsRegeneration: true,
        regenerationReason: "fenêtre de recadrage hors image — source inutilisable en l'état.",
      },
    };
  }

  const visible = scaled.clone().crop(srcX, srcY, srcW, srcH);
  canvas.composite(visible, Math.max(0, -winX), Math.max(0, -winY));
  const bytes = await canvas.encode();

  return {
    bytes,
    report: {
      changed: true,
      bbox,
      sourceMargins: base.sourceMargins,
      scale: Math.round(scale * 1000) / 1000,
      transparent,
      eyeYPct: eyeYPctActual,
      bottomWidthFillPct: Math.round(chosen.bottomFill * 1000) / 10,
      sideGapBottomPct: Math.round((1 - chosen.worst) * 1000) / 10,
      needsRegeneration,
      regenerationReason,
    },
  };
}

// ---------------------------------------------------------------------------
// TRIM TO STUDIO BOX — geometry of the published file (trombinoscope)
// ---------------------------------------------------------------------------

export type TrimReport = {
  changed: boolean;
  bbox: Box | null;
  /** Margins of the SOURCE image, in % of its size: [left, top, right, bottom]. */
  sourceMargins: [number, number, number, number] | null;
  /** Uniform scale applied (no axis is ever stretched independently). */
  scale: number;
  transparent: boolean;
  /** Background band left under the subject in the OUTPUT, in % of height. */
  bottomMarginPct: number | null;
  reason?: string;
};

/**
 * Rewrites the file so every avatar shares the SAME internal geometry:
 *   - STUDIO_TOP_HEADROOM of free space above the highest drawn pixel
 *     (hair, afro, veil, hat are never cropped)
 *   - the lowest drawn pixel touches the bottom edge — zero background band
 *     under the bust, which is what created the empty gap in the donor circle
 *   - horizontally centered on the face axis when known, on the bbox otherwise
 *
 * ONE uniform scale, one translation. No head-size target, no stretching, no
 * alteration of the person's morphology. Idempotent.
 */
export async function trimToStudioBox(
  pngBytes: Uint8Array,
  faceCenterX?: number | null,
): Promise<{ bytes: Uint8Array; report: TrimReport }> {
  const img = await Image.decode(pngBytes);
  const bbox = bboxFromSpans(rowSpans(img));
  const transparent = hasTransparentBackground(img);

  const report: TrimReport = {
    changed: false,
    bbox,
    sourceMargins: null,
    scale: 1,
    transparent,
    bottomMarginPct: null,
  };

  if (!bbox || bbox.w < 32 || bbox.h < 32) {
    return { bytes: pngBytes, report: { ...report, reason: "sujet non détecté" } };
  }

  report.sourceMargins = [
    Math.round((bbox.x / img.width) * 100),
    Math.round((bbox.y / img.height) * 100),
    Math.round(((img.width - (bbox.x + bbox.w)) / img.width) * 100),
    Math.round(((img.height - (bbox.y + bbox.h)) / img.height) * 100),
  ];

  // Square window in SOURCE pixels: subject height fills (1 - headroom) of it,
  // its bottom edge flush with the subject's lowest pixel.
  const side = bbox.h / (1 - STUDIO_TOP_HEADROOM);
  const winTop = bbox.y + bbox.h - side;
  const centerX = typeof faceCenterX === "number" && faceCenterX > 0 && faceCenterX < 1
    ? faceCenterX * img.width
    : bbox.x + bbox.w / 2;
  const winLeft = centerX - side / 2;

  const scale = S / side;
  const scaledW = Math.max(1, Math.round(img.width * scale));
  const scaledH = Math.max(1, Math.round(img.height * scale));
  const scaled = img.clone().resize(scaledW, scaledH);

  const winX = Math.round(winLeft * scale);
  const winY = Math.round(winTop * scale);

  const srcX = Math.max(0, winX);
  const srcY = Math.max(0, winY);
  const srcW = Math.min(scaledW - srcX, S - Math.max(0, -winX));
  const srcH = Math.min(scaledH - srcY, S - Math.max(0, -winY));
  if (srcW <= 0 || srcH <= 0) {
    return { bytes: pngBytes, report: { ...report, reason: "fenêtre hors image" } };
  }

  const canvas = new Image(S, S);
  if (!transparent) canvas.fill(0xffffffff);
  const visible = scaled.clone().crop(srcX, srcY, srcW, srcH);
  canvas.composite(visible, Math.max(0, -winX), Math.max(0, -winY));
  const bytes = await canvas.encode();

  // Verify the output really has no band under the subject.
  const outBox = bboxFromSpans(rowSpans(await Image.decode(bytes)));
  const bottomMarginPct = outBox
    ? Math.round(((S - (outBox.y + outBox.h)) / S) * 1000) / 10
    : null;

  return {
    bytes,
    report: {
      ...report,
      changed: true,
      scale: Math.round(scale * 1000) / 1000,
      bottomMarginPct,
    },
  };
}
