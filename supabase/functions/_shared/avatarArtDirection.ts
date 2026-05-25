// Centralized art direction — invariants injected in every avatar prompt.
// Locked: not editable from admin panel. Guarantees premium homogeneous catalog.

import { AvatarTraits } from "./avatarTraits.ts";

const EXPRESSION_DESCRIPTIONS: Record<string, string> = {
  gentle_smile: "a gentle, sincere smile, warm eyes",
  hopeful: "a hopeful, soft expression, eyes looking slightly upward",
  calm: "a calm, peaceful expression, relaxed mouth",
  discreet_smile: "a discreet, almost imperceptible smile, kind eyes",
  tired_but_warm: "subtle fatigue around the eyes but warmth and humanity preserved",
  resilient: "a resilient, composed expression, quiet strength",
  serious_soft: "a serious but soft expression, gentle gaze, no harshness",
  thoughtful: "a thoughtful, contemplative expression, eyes slightly downward",
  pensive: "a pensive expression, looking slightly away, introspective",
  reserved: "a reserved, modest expression, soft gaze",
};

const POSTURE_DESCRIPTIONS: Record<string, string> = {
  upright_calm: "upright posture, shoulders relaxed",
  leaning_slightly: "leaning slightly forward, engaged",
  relaxed: "relaxed natural posture",
  protective: "protective posture, slightly turned, conveying care",
  seated_dignified: "seated, dignified posture",
};

const CLOTHING_STYLE_DESC: Record<string, string> = {
  casual_modest: "modest casual clothing, simple cotton sweater or shirt",
  simple_layered: "simple layered everyday clothing",
  practical_warm: "practical warm clothing, cardigan or jumper",
  classic_simple: "classic simple clothing, soft knit",
  soft_cardigan: "soft cardigan over a simple top",
  modest_warm: "modest warm clothing, shawl or wool layer",
};

const PALETTE_DESC: Record<string, string> = {
  warm_earth: "warm earth tones (terracotta, ochre, sand)",
  muted_neutral: "muted neutrals (cream, soft gray, beige)",
  soft_jewel: "soft jewel tones (dusty teal, faded plum, muted rose)",
  sand_ivory: "sand and ivory tones",
  dusty_blue: "dusty blue and sage tones",
};

const CULTURAL_STYLE_DESC: Record<string, string> = {
  neutral_european: "",
  soft_modern: "",
  subtle_mediterranean: "with subtle Mediterranean styling cues (kept understated)",
  subtle_west_african: "with subtle West African styling cues (kept understated, no traditional dress)",
  subtle_central_african: "with subtle Central African styling cues (kept understated)",
};

const FACIAL_FEATURE_DESC: Record<string, string> = {
  subtle_age_lines: "subtle age lines",
  gentle_wrinkles: "gentle wrinkles around the eyes",
  light_freckles: "light freckles",
  soft_dimples: "soft dimples",
  expressive_brows: "expressive eyebrows",
};

const SKIN_DESC: Record<string, string> = {
  fair: "fair skin", light: "light skin", medium: "medium skin",
  olive: "olive skin", tan: "tan skin", medium_dark: "medium-dark skin",
  dark: "dark skin", deep: "deep skin",
};

const HAIR_COLOR_DESC: Record<string, string> = {
  black: "black hair", dark_brown: "dark brown hair", light_brown: "light brown hair",
  blonde: "blonde hair", red: "red hair", auburn: "auburn hair",
  gray: "gray hair", white: "white hair",
};

const HAIR_TYPE_DESC: Record<string, string> = {
  straight: "straight", wavy: "wavy", curly: "curly", coily: "coily",
};

const BODY_TYPE_DESC: Record<string, string> = {
  very_thin: "very slender, slim build, narrow shoulders and thin face",
  thin: "slim build, lean face",
  average: "average build",
  chubby: "slightly heavier build, rounder face and softer features",
  heavy: "noticeably heavier build, fuller face, rounded cheeks and broader shoulders",
};

export const ART_DIRECTION_INVARIANTS = `
HAND-DRAWN SEMI-REALISTIC CARTOON ILLUSTRATION — editorial storybook portrait, in the visual style of modern picture-book and editorial illustration (think contemporary New Yorker meets warm 2D storybook). Hand-drawn ink linework with fine, soft, organic outlines (NOT thick uniform vector outlines). Realistic human proportions and anatomy, clearly non-photographic, with subtle stylization.
EXPLICITLY NOT: not a photograph, not photorealistic, not a 3D render, not Pixar/Disney 3D, not flat vector sticker, not Storyset/unDraw style, not anime, not manga, not chibi, not comic book, not oil painting, not heavy acrylic painting, not saturated watercolor, not pencil sketch only.
LINEWORK: fine, slightly varying hand-drawn ink lines around face, hair, clothes. Visible but subtle. Natural imperfection — not vector-perfect.
SHADING: soft hand-applied shading reminiscent of colored pencil with a light digital wash. Gentle volume on the face (cheeks, nose, jaw) without realistic skin pores or photographic detail. Warm soft natural lighting. NO visible paper grain, NO watercolor paper texture.
COLOR PALETTE: warm, slightly desaturated, harmonious. Muted earth and warm pastel tones. No neon, no oversaturation, no high-contrast pop.
ANONYMITY (CRITICAL): generic archetypal character — must NEVER resemble any real person, public figure, celebrity or identifiable individual. No specific likeness, no recognizable features that could identify a real human. The character is a respectful fictional stand-in.
FRAMING (CRITICAL — STRICT): chest-up bust, subject centered, square 1:1 composition, character occupies ~65-75% of the frame, looking softly toward the camera. Full-bleed image: the illustrated background MUST extend all the way to the four edges of the image with NO border, NO white margin, NO frame, NO passe-partout / mat, NO torn or deckled paper edge, NO vignette, NO rounded-corner card, NO scrapbook or sticker outline. The image must look like a single continuous illustration filling the entire 1:1 canvas, not an illustration sitting on a sheet of paper.
BACKGROUND: soft, gently BLURRED contextual background coherent with the situation (warm domestic interior, kitchen, living room, simple street, workshop, outdoor garden, etc.) — illustrated in the same hand-drawn style, kept low-contrast and out of focus so the subject remains the clear focal point, and extending edge-to-edge across all four sides of the frame. NEVER a pure white studio background. NEVER a busy or sharp background. NEVER a background that stops short of the image edges.
DIGNITY: respectful, warm, kind, gentle expression. Quiet humanity. No caricature, no exaggeration, no stereotype, no pathos, no misery, no sadness.
`.trim();

export const NEGATIVE_PROMPT = [
  "no text", "no watermark", "no logo", "no caption", "no signature",
  "no photograph", "no photorealism", "no realistic skin texture", "no skin pores", "no DSLR look", "no stock photo", "no passport photo", "no LinkedIn portrait",
  "no 3D render", "no CGI", "no octane render", "no Pixar 3D", "no Disney 3D render", "no Blender render",
  "no flat vector sticker style", "no Storyset style", "no unDraw style", "no Notion avatar style", "no bold uniform vector outlines",
  "no anime", "no manga", "no chibi", "no comic book style", "no superhero style",
  "no oil painting", "no heavy acrylic painting", "no impasto", "no thick brush strokes", "no saturated watercolor", "no abstract painting",
  "no pencil-only sketch", "no monochrome",
  "no identifiable likeness of any real person", "no recognizable individual", "no celebrity resemblance", "no public figure resemblance", "no portrait of a real human",
  "no pure white studio background", "no plain background", "no busy background", "no sharp detailed background", "no cluttered scene",
  "no white border", "no paper border", "no torn paper edge", "no deckled edge", "no vignette", "no frame", "no passe-partout", "no mat around the illustration", "no scrapbook look", "no sticker outline", "no rounded corner card", "no watercolor paper texture", "no visible paper grain", "no margin around the illustration", "background must extend fully to all four edges of the image",
  "no artificial commercial smile", "no dramatic lighting", "no tears", "no despair", "no exaggerated emotion", "no crying",
  "no caricature", "no cultural stereotype", "no traditional ceremonial dress",
  "no multiple faces, single subject only", "no nudity",
  "no harsh shadows", "no neon", "no oversaturation", "no glossy plastic skin",
].join(", ");

export function buildAvatarPrompt(t: AvatarTraits): string {
  const features = t.avatar_facial_features
    .map(f => FACIAL_FEATURE_DESC[f])
    .filter(Boolean)
    .join(", ");

  const subject = [
    `a ${t.avatar_age_range} year old ${t.avatar_gender}`,
    SKIN_DESC[t.avatar_skin_tone] ?? `${t.avatar_skin_tone} skin`,
    `${t.avatar_face_shape.replace("_", " ")} face shape`,
    `${t.avatar_eye_shape} ${t.avatar_eye_color} eyes`,
    features ? features : "",
    `${HAIR_TYPE_DESC[t.avatar_hair_type] ?? t.avatar_hair_type} ${t.avatar_hair_length} ${HAIR_COLOR_DESC[t.avatar_hair_color] ?? t.avatar_hair_color}, ${t.avatar_hair_style.replace("_", " ")} style, ${t.avatar_hair_volume} volume`,
  ].filter(Boolean).join(", ");

  // Studio extensions — appended only when set
  const extras: string[] = [];
  if (t.avatar_body_type && BODY_TYPE_DESC[t.avatar_body_type] && t.avatar_body_type !== "average") {
    extras.push(BODY_TYPE_DESC[t.avatar_body_type]);
  }
  if ((t.avatar_tired_level ?? 0) >= 3) extras.push("noticeably tired eyes");
  else if ((t.avatar_tired_level ?? 0) >= 1) extras.push("slight tiredness in the eyes");
  if ((t.avatar_emotional_brightness ?? 3) <= 1) extras.push("low emotional brightness, subdued gaze");
  else if ((t.avatar_emotional_brightness ?? 3) >= 4) extras.push("bright, warm gaze");
  if (t.avatar_gender === "man") {
    if (t.avatar_beard && t.avatar_beard !== "none") extras.push(`${t.avatar_beard} beard`);
    if (t.avatar_moustache && t.avatar_moustache !== "none") extras.push(`${t.avatar_moustache} moustache`);
    if ((t.avatar_bald_level ?? 0) >= 70) extras.push("mostly bald");
    else if ((t.avatar_bald_level ?? 0) >= 30) extras.push("partial baldness on top");
    if (t.avatar_hair_recession && t.avatar_hair_recession !== "none") {
      extras.push(`${t.avatar_hair_recession} hair recession at temples`);
    }
  }
  const HEAD_COVERING: Record<string, string> = {
    light_scarf: "a light scarf draped softly on the shoulders, hair fully visible",
    headscarf: "wearing a modest headscarf that partially covers the hair, with a few strands visible at the front",
    hijab_full: "wearing a hijab that fully covers the hair, ears and neck, modest fabric in a muted tone, soft natural folds",
    taqiyah: "wearing a small white taqiyah (Muslim skull cap) on the crown of the head",
    turban: "wearing a neatly wrapped turban in a muted tone",
    kippah: "wearing a small discreet kippah on the crown of the head",
  };
  if (t.avatar_head_covering && HEAD_COVERING[t.avatar_head_covering]) {
    extras.push(HEAD_COVERING[t.avatar_head_covering]);
  }

  const FOREHEAD_MARK: Record<string, string> = {
    bindi_red: "a small red bindi centered on the forehead between the eyebrows, discreet and dignified",
    bindi_black: "a small black bindi centered on the forehead between the eyebrows, discreet and dignified",
    bindi_decorative: "a small decorative bindi centered on the forehead between the eyebrows, subtle and elegant",
  };
  if (t.avatar_forehead_mark && t.avatar_forehead_mark !== "none" && FOREHEAD_MARK[t.avatar_forehead_mark]) {
    extras.push(FOREHEAD_MARK[t.avatar_forehead_mark]);
  }
  if ((t.avatar_fatigue_level ?? 0) >= 3) extras.push("visible but dignified fatigue in the face");
  if ((t.avatar_resilience_level ?? 3) >= 4) extras.push("quiet inner strength conveyed in the posture");

  const PARENT_ENERGY: Record<string, string> = {
    protective_parent: "warm protective parental presence, gentle but watchful",
    practical_parent: "calm grounded parental presence, focused and capable",
    tired_but_warm_parent: "weary parental presence softened by warmth and tenderness",
  };
  if (t.avatar_parent_energy && t.avatar_parent_energy !== "none" && PARENT_ENERGY[t.avatar_parent_energy]) {
    extras.push(PARENT_ENERGY[t.avatar_parent_energy]);
  }

  const MOBILITY: Record<string, string> = {
    wheelchair_electric: "seated in a modern electric wheelchair with discreet controls, hands resting calmly on the armrests, dignified upright posture",
    wheelchair_manual: "seated in a simple manual wheelchair, hands resting on the lap, dignified posture",
    cane: "holding a wooden walking cane with both hands resting in front, seated or standing calmly",
    crutches: "with a single forearm crutch visible beside the subject, calm and dignified",
    walker: "with a light walking frame visible in front, hands resting on the handles",
    visible_bandage: "with a discreet white bandage visible on the forearm or hand",
    arm_sling: "with one arm gently supported in a soft fabric sling",
    oxygen_cannula: "wearing a discreet nasal oxygen cannula, kept understated and dignified",
  };
  if (t.avatar_mobility_aid && t.avatar_mobility_aid !== "none" && MOBILITY[t.avatar_mobility_aid]) {
    extras.push(MOBILITY[t.avatar_mobility_aid]);
  }

  const expression = EXPRESSION_DESCRIPTIONS[t.avatar_expression] ?? "a calm natural expression";
  const posture = POSTURE_DESCRIPTIONS[t.avatar_posture] ?? "upright posture";
  const clothing = `${CLOTHING_STYLE_DESC[t.avatar_clothing_style] ?? "simple modest clothing"} in ${PALETTE_DESC[t.avatar_clothing_color_palette] ?? "warm muted tones"}`;
  const culturalCue = t.avatar_cultural_style_override
    ? `with ${t.avatar_cultural_style_override.replace(/_/g, " ")} styling cues (kept understated)`
    : (CULTURAL_STYLE_DESC[t.avatar_cultural_style] ?? "");

  return [
    ART_DIRECTION_INVARIANTS,
    "",
    `SUBJECT: ${subject}.`,
    extras.length ? `DETAILS: ${extras.join(", ")}.` : "",
    `EXPRESSION: ${expression}.`,
    `POSTURE: ${posture}.`,
    `CLOTHING: ${clothing} ${culturalCue}`.trim() + ".",
    "",
    `AVOID: ${NEGATIVE_PROMPT}.`,
  ].filter(Boolean).join("\n");
}

// Same model for preview and final to guarantee a single consistent cartoon style across the catalog.
export const MODEL_PREVIEW = "google/gemini-3.1-flash-image-preview";
export const MODEL_FINAL = "google/gemini-3.1-flash-image-preview";
export const MODEL_QA = "google/gemini-2.5-flash";
