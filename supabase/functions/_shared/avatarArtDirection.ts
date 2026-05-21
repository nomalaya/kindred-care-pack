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

export const ART_DIRECTION_INVARIANTS = `
FLAT VECTOR CARTOON AVATAR — clean modern illustrated character avatar, in the visual style of contemporary app illustration packs (Storyset, unDraw, Notion-style avatars, modern mobile app onboarding characters). Bold clean outlines, simple cel-shaded flat color fills with at most 2 tones per surface, sticker-like rendering, Adobe Illustrator vector look. Friendly, generic, archetypal — intentionally non-specific.
EXPLICITLY NOT: not a photograph, not photorealistic, not semi-realistic, not painterly, not watercolor, not oil painting, not Pixar 3D render, not Disney render, not Studio Ghibli, not anime, not manga, not chibi, not comic book, not pencil sketch.
LINEWORK: clean, bold, deliberate vector outlines around face, hair and body. Simplified stylized features (slightly enlarged friendly eyes, simple nose, simple mouth). No painterly brush strokes.
SHADING: pure flat color fills with one soft cel-shading tone for depth. No gradients on skin, no painted texture, no pores, no realistic skin rendering.
ANONYMITY: generic archetypal character — must NEVER resemble any real person, public figure, celebrity, or identifiable individual. No identifying marks, no specific likeness, no facial recognition possible. The character is a friendly stand-in, not a portrait.
FRAMING: chest-up bust, subject centered, square 1:1 composition, consistent margins, character occupies ~70% of the frame.
BACKGROUND: pure plain white background (#FFFFFF), perfectly uniform, no gradient, no shadow, no decoration. Catalog-grade consistency.
COLOR PALETTE: warm, friendly, slightly muted illustration colors. No neon, no oversaturation.
DIGNITY: respectful, warm, kind expression. No caricature, no exaggeration, no stereotype, no pathos, no misery.
`.trim();

export const NEGATIVE_PROMPT = [
  "no text", "no watermark", "no logo", "no caption", "no signature",
  "no photograph", "no photorealism", "no realistic skin texture", "no skin pores",
  "no DSLR look", "no stock photo feel", "no passport photo", "no LinkedIn portrait",
  "no semi-realistic style", "no painterly style", "no painted portrait",
  "no watercolor", "no oil painting", "no acrylic painting", "no textured brushstrokes",
  "no 3D render", "no CGI render", "no octane render", "no Pixar 3D style", "no Disney render", "no Studio Ghibli style",
  "no anime", "no manga", "no chibi", "no comic book style", "no superhero style", "no pencil sketch",
  "no gaussian blur", "no smudged features",
  "no identifiable likeness of any real person", "no recognizable individual", "no celebrity resemblance", "no public figure resemblance",
  "no colored background", "no gradient background", "no decorated background", "no scene background",
  "no artificial commercial smile", "no dramatic lighting", "no tears", "no despair", "no exaggerated emotion",
  "no caricature", "no cultural stereotype", "no traditional ceremonial dress",
  "no multiple faces, single subject only", "no nudity", "no children faces in isolation",
  "no harsh shadows", "no oversaturation", "no glossy skin",
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
  if (t.avatar_head_covering === "required") extras.push("wearing a soft modest headscarf");
  else if (t.avatar_head_covering === "optional") extras.push("a light scarf draped on the shoulders");
  if ((t.avatar_fatigue_level ?? 0) >= 3) extras.push("visible but dignified fatigue in the face");
  if ((t.avatar_resilience_level ?? 3) >= 4) extras.push("quiet inner strength conveyed in the posture");

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
