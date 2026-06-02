/**
 * Avatar Framing — non-destructive display transformation for beneficiary avatars.
 *
 * Stored as 3 columns in `beneficiaries` (avatar_scale, avatar_offset_x, avatar_offset_y).
 * The image is never modified — only the way it is rendered inside its container.
 *
 * Architecture is intentionally centralized here so future evolutions
 * (copy/paste between beneficiaries, presets, batch apply, schema v2…)
 * require no refactor of consumers.
 */
import type { CSSProperties } from "react";

export const FRAMING_VERSION = 1 as const;

export type AvatarFraming = {
  /** Schema version of the framing object — enables future migrations without breaking consumers. */
  version: typeof FRAMING_VERSION;
  /** Zoom factor. 1.0 = native object-cover, 2.0 = 200%. Locked ≥ 1 to guarantee no white edges. */
  scale: number;
  /** Horizontal offset in % of the container width. Signed. */
  offsetX: number;
  /** Vertical offset in % of the container height. Signed. */
  offsetY: number;
};

export const FRAMING_BOUNDS = {
  scaleMin: 1.0,
  scaleMax: 2.0,
  offsetMin: -100,
  offsetMax: 100,
} as const;

export const DEFAULT_FRAMING: AvatarFraming = {
  version: FRAMING_VERSION,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

// ---------------------------------------------------------------------------
// Helpers — numeric
// ---------------------------------------------------------------------------

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const round = (n: number, decimals = 2) => {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
};

// ---------------------------------------------------------------------------
// Migration — future-proofing
// ---------------------------------------------------------------------------

/**
 * Coerce any raw input (legacy version, partial object, unknown JSON) into a
 * valid current-version AvatarFraming. Always returns something usable.
 */
export function migrateFraming(raw: unknown): AvatarFraming {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_FRAMING };
  const r = raw as Record<string, unknown>;
  const scale = typeof r.scale === "number" ? r.scale : 1;
  const offsetX = typeof r.offsetX === "number" ? r.offsetX : 0;
  const offsetY = typeof r.offsetY === "number" ? r.offsetY : 0;
  return {
    version: FRAMING_VERSION,
    scale: clamp(scale, FRAMING_BOUNDS.scaleMin, FRAMING_BOUNDS.scaleMax),
    offsetX: clamp(offsetX, FRAMING_BOUNDS.offsetMin, FRAMING_BOUNDS.offsetMax),
    offsetY: clamp(offsetY, FRAMING_BOUNDS.offsetMin, FRAMING_BOUNDS.offsetMax),
  };
}

// ---------------------------------------------------------------------------
// Serialization — ready for clipboard copy/paste, presets, batch apply
// ---------------------------------------------------------------------------

export function serializeFraming(f: AvatarFraming): string {
  return JSON.stringify({
    v: f.version,
    s: round(f.scale, 3),
    x: round(f.offsetX, 2),
    y: round(f.offsetY, 2),
  });
}

export function parseFraming(s: string): AvatarFraming | null {
  try {
    const o = JSON.parse(s);
    if (!o || typeof o !== "object") return null;
    return migrateFraming({
      version: o.v,
      scale: o.s,
      offsetX: o.x,
      offsetY: o.y,
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// DB adapter — single point of contact with the beneficiary row shape
// ---------------------------------------------------------------------------

type FramingRow = {
  avatar_scale?: number | null;
  avatar_offset_x?: number | null;
  avatar_offset_y?: number | null;
};

export function readFramingFromRow(row: FramingRow | null | undefined): AvatarFraming {
  if (!row) return { ...DEFAULT_FRAMING };
  return migrateFraming({
    scale: row.avatar_scale ?? 1,
    offsetX: row.avatar_offset_x ?? 0,
    offsetY: row.avatar_offset_y ?? 0,
  });
}

export function framingToRowPatch(f: AvatarFraming) {
  return {
    avatar_scale: round(f.scale, 3),
    avatar_offset_x: round(f.offsetX, 2),
    avatar_offset_y: round(f.offsetY, 2),
  };
}

export function framingEquals(a: AvatarFraming, b: AvatarFraming): boolean {
  return (
    Math.abs(a.scale - b.scale) < 1e-3 &&
    Math.abs(a.offsetX - b.offsetX) < 1e-2 &&
    Math.abs(a.offsetY - b.offsetY) < 1e-2
  );
}

// ---------------------------------------------------------------------------
// Real anti-white-edge clamp
// ---------------------------------------------------------------------------

/**
 * Compute the real maximum offset (in % of the container) that keeps the image
 * fully covering the container after a given scale.
 *
 * Uses the actual rendered rectangle produced by `object-cover` on the natural
 * image dimensions — NOT the theoretical (scale-1)/2 approximation.
 */
export function maxOffsetPct(
  container: { w: number; h: number },
  imageNatural: { w: number; h: number },
  scale: number,
): { x: number; y: number } {
  if (!container.w || !container.h || !imageNatural.w || !imageNatural.h) {
    return { x: 0, y: 0 };
  }
  const containerRatio = container.w / container.h;
  const imageRatio = imageNatural.w / imageNatural.h;
  // object-cover: image fills container on one axis, overflows on the other
  let renderedW: number;
  let renderedH: number;
  if (imageRatio > containerRatio) {
    // image is wider — height matches container, width overflows
    renderedH = container.h;
    renderedW = renderedH * imageRatio;
  } else {
    renderedW = container.w;
    renderedH = renderedW / imageRatio;
  }
  const overflowX = (renderedW * scale - container.w) / 2;
  const overflowY = (renderedH * scale - container.h) / 2;
  return {
    x: Math.max(0, (overflowX / container.w) * 100),
    y: Math.max(0, (overflowY / container.h) * 100),
  };
}

/**
 * Clamp framing offsets to the real anti-white-edge bounds. Scale is also
 * clamped to [scaleMin, scaleMax]. Pass concrete container + image dimensions.
 */
export function clampFraming(
  f: AvatarFraming,
  container: { w: number; h: number },
  imageNatural: { w: number; h: number },
): AvatarFraming {
  const scale = clamp(f.scale, FRAMING_BOUNDS.scaleMin, FRAMING_BOUNDS.scaleMax);
  const max = maxOffsetPct(container, imageNatural, scale);
  return {
    version: FRAMING_VERSION,
    scale,
    offsetX: clamp(f.offsetX, -max.x, max.x),
    offsetY: clamp(f.offsetY, -max.y, max.y),
  };
}

// ---------------------------------------------------------------------------
// CSS transform — used by every consumer (BeneficiaryAvatar, dialog preview)
// ---------------------------------------------------------------------------

export function framingToTransform(f: AvatarFraming | undefined | null): CSSProperties {
  const framing = f ?? DEFAULT_FRAMING;
  return {
    transform: `translate(${round(framing.offsetX, 2)}%, ${round(framing.offsetY, 2)}%) scale(${round(framing.scale, 3)})`,
    transformOrigin: "center center",
    transition: "transform 120ms ease-out",
    willChange: "transform",
  };
}

export function isDefaultFraming(f: AvatarFraming): boolean {
  return framingEquals(f, DEFAULT_FRAMING);
}
