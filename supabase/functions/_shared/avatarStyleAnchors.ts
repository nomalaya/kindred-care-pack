// sync
/**
 * STYLE ANCHORS — the ONLY stylistic references for the avatar catalog.
 *
 * House style = a single frozen MATERIAL PLATE (`style-plate.jpg`): a grid of
 * close-up crops taken from the three validated renders (Léa, Nguyen, Fatima)
 * showing hair strands, ink contours, pencil grain, skin shading and fabric
 * texture — and NO complete face.
 *
 * Why no full portraits: Gemini image models copy the identity of attached
 * images far more strongly than they follow text, so sending whole portraits
 * made every young / mid-age woman converge on Léa's face and curls regardless
 * of her own attributes. A faceless plate keeps the drawing style and removes
 * the identity leak. Amadou is still explicitly NOT a reference (vector drift).
 *
 * Phenotype, age, gender and every other attribute come exclusively from the
 * text prompt.
 */

const BUCKET_BASE =
  "https://reofbeluopsnqeirxofv.supabase.co/storage/v1/object/public/avatars/style-anchors";

export const STYLE_ANCHOR_URLS: string[] = [
  `${BUCKET_BASE}/style-plate.jpg`,
];

/** Injected in text-to-image prompts, where the plate is the only image sent. */
export const STYLE_ANCHOR_BLOCK = `
STYLE REFERENCE PLATE — STRICT:
The attached image is NOT a person and NOT a subject: it is a grid of close-up MATERIAL SAMPLES (hair strands, ink contour lines, pencil grain, skin shading, fabric folds) that defines the REQUIRED drawing style of this catalog. Reproduce that graphic language exactly: hand-drawn illustration, thin readable ink contours, soft smooth shading with subtle pencil grain, hair drawn as soft masses with a few visible drawn strands, gently textured fabric, warm slightly desaturated palette, plain white background, realistic human proportions, calm dignified presence.
Do NOT reproduce the plate's grid, crops, tiles or framing, and do NOT infer any face, hairstyle, hair colour, skin tone, age, gender or clothing from it. The person you draw is defined EXCLUSIVELY by the PRIMARY SUBJECT attributes above, and EVERY attribute listed there must be clearly visible in the result.
`.trim();

/** Injected in edit prompts, where the FIRST image is the subject to retouch. */
export const STYLE_ANCHOR_BLOCK_EDIT = `
IMAGE ORDER — STRICT:
The FIRST attached image is the subject to retouch — identity, pose, framing and composition come from it.
The FOLLOWING attached image is a MATERIAL STYLE PLATE (close-up crops of hair, ink lines, pencil grain and fabric — not a person): it defines the required drawing style only (hand-drawn illustration, thin readable ink contours, soft smooth shading with subtle pencil grain, warm slightly desaturated palette, plain white background). Never reproduce its grid or crops, and never infer any face, hair, skin tone or clothing from it.
`.trim();
