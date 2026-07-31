// sync
/**
 * SINGLE SOURCE OF TRUTH for avatar framing.
 *
 * ONE position anchor and ONE scale rule — nothing else. The previous stack of
 * five simultaneous constraints (hair top 6 %, eyes 38 %, chin 50 %, face 40 %,
 * head 44 %) was geometrically over-determined: on morphologies far from the
 * reference it silently squashed shoulders to satisfy the head-height target.
 *
 *   POSITION : the eye line sits at EYE_LINE of the canvas height. Always.
 *   SCALE    : the smallest zoom for which the garment fills 100 % of the
 *              bottom edge width (no background under the shoulders).
 *
 * Nothing constrains the head height any more: a broad build stays broad, an
 * afro / veil / hat stays whatever height it is.
 */

/** Vertical position of the eye line, in % of the canvas height. Only anchor. */
export const EYE_LINE = 0.38;

/**
 * TROMBINOSCOPE GUARD — minimum free space above the highest drawn pixel of the
 * subject (hair, afro volume, veil, hat), in % of the canvas height.
 * The eye line is relaxed downward rather than cropping anyone's hair: the
 * container brings homogeneity, never a crop through someone's head.
 */
export const HAIR_HEADROOM = 0.04;

/**
 * TROMBINOSCOPE BOX — geometry every published avatar file must share so the
 * donor-facing circle has nothing left to correct.
 *   - free space above the highest drawn pixel: STUDIO_TOP_HEADROOM
 *   - the lowest drawn pixel touches the bottom edge (no background band under
 *     the bust, which is what produced the empty gap seen on Fatima)
 *   - horizontal centering on the face axis when it is known, bbox center else
 * A SINGLE uniform scale satisfies both edges — never a non-uniform stretch.
 */
export const STUDIO_TOP_HEADROOM = 0.04;





/** Required garment coverage on the bottom edge of the canvas (1 = full width). */
export const BOTTOM_WIDTH_FILL = 1.0;

/** Bottom band (share of canvas height) checked for background gaps. */
export const BOTTOM_BAND = 0.1;

/** Never zoom out below this: beyond it the source simply lacks bust. */
export const MIN_ZOOM = 0.9;

/** Upper bound of the zoom search. */
export const MAX_ZOOM = 2.6;

/** Format a ratio as a human/model readable percentage ("38%"). */
export const framingPct = (v: number) => `${Math.round(v * 1000) / 10}%`;
