// sync
/**
 * STYLE ANCHORS — the ONLY stylistic references for the avatar catalog.
 *
 * Three curated portraits define the house style: Léa, Nguyen, Fatima.
 * Amadou is explicitly NOT a style reference (his render drifted to a smooth
 * vector look) and must never be added here.
 *
 * The files are frozen copies (512px) stored under `avatars/style-anchors/`,
 * so regenerating those three beneficiaries can never change the house style.
 *
 * They are sent as visual references on every generation. They constrain the
 * DRAWING STYLE only — never identity, phenotype or attributes, which come
 * exclusively from the text prompt.
 */

const BUCKET_BASE =
  "https://reofbeluopsnqeirxofv.supabase.co/storage/v1/object/public/avatars/style-anchors";

export const STYLE_ANCHOR_URLS: string[] = [
  `${BUCKET_BASE}/lea.jpg`,
  `${BUCKET_BASE}/nguyen.jpg`,
  `${BUCKET_BASE}/fatima.jpg`,
];

/** Injected in text-to-image prompts, where the anchors are the only images sent. */
export const STYLE_ANCHOR_BLOCK = `
STYLE REFERENCE IMAGES — STRICT:
The attached reference images define the REQUIRED drawing style of this catalog. Reproduce their graphic language exactly: hand-drawn illustration, thin readable ink contours, soft smooth shading with subtle pencil grain, warm slightly desaturated palette, plain white background, realistic human proportions, calm dignified presence.
COPY THE STYLE ONLY — NEVER THE PEOPLE: do NOT copy any face, hairstyle, skin tone, age, gender, clothing or identity from the reference images. The person you draw is defined EXCLUSIVELY by the PRIMARY SUBJECT attributes above. The references are a stylistic guide, nothing else.
`.trim();

/** Injected in edit prompts, where the FIRST image is the subject to retouch. */
export const STYLE_ANCHOR_BLOCK_EDIT = `
IMAGE ORDER — STRICT:
The FIRST attached image is the subject to retouch — identity, pose, framing and composition come from it.
The FOLLOWING attached images are STYLE REFERENCES ONLY: they define the required drawing style (hand-drawn illustration, thin readable ink contours, soft smooth shading with subtle pencil grain, warm slightly desaturated palette, plain white background). NEVER copy any face, hair, skin tone, clothing or identity from them.
`.trim();
