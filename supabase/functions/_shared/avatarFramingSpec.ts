// sync
/**
 * SINGLE SOURCE OF TRUTH for avatar framing — reference portrait = LÉA
 * (style anchor `avatars/style-anchors/lea.jpg`), measured with a face-landmark
 * detector (not the silhouette):
 *
 *   face box height 39.8 % | eye line 38.0 % | chin ≈ 50 % | head + hair ≈ 44 %
 *
 * Read: on Léa the head is about as tall as the visible body underneath — the
 * chin sits mid-canvas. That proportion is the catalog target.
 *
 * These constants are consumed BOTH by the generation prompt
 * (`avatarArtDirection.ts` → FRAMING_BLOCK) and by the deterministic
 * normalizer (`avatarNormalize.ts`), so prompt and post-processing can never
 * drift apart. This module holds no dependency on purpose (kept importable
 * from anywhere, zero cold-start cost).
 */

/** Share of the canvas height taken by the FACE BOX (hairline -> chin, hair excluded). */
export const FACE_FILL = 0.4;
/** Vertical position of the eye line, in % of the canvas height. */
export const EYE_LINE = 0.38;
/** Chin line = mid canvas: head height == visible body height. */
export const CHIN_LINE = 0.5;
/** Share of the canvas height taken by the head, hair included. */
export const HEAD_FILL = 0.44;
/** Upper bound for the head share before an avatar is flagged for regeneration. */
export const HEAD_FILL_MAX = 0.5;
/** Never zoom out more than this: beyond it the source lacks body. */
export const MIN_ZOOM = 0.9;
/**
 * Vertical anchor actually used by the normalizer: top of the hair.
 * Derived from the two measured lines (chin at 50 %, head 44 % tall), so it is
 * the SAME framing expressed on a landmark the silhouette gives exactly —
 * unlike the eye line, which had to be guessed from the head height and drifted
 * (short hair + wide sweater collar => head bottom mistaken for the collar).
 */
export const HAIR_TOP_LINE = CHIN_LINE - HEAD_FILL;

/** Format a ratio as a human/model readable percentage ("38%"). */
export const framingPct = (v: number) => `${Math.round(v * 1000) / 10}%`;
