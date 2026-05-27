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
  black: "black", dark_brown: "dark brown", brown: "brown", light_brown: "light brown",
  blonde: "blonde", red: "red", auburn: "auburn",
  gray: "gray", white: "white",
};

const HAIR_TYPE_DESC: Record<string, string> = {
  straight: "straight", wavy: "wavy", curly: "curly", coily: "coily",
};

const NOSE_DESC: Record<string, string> = {
  straight: "a straight, balanced nose",
  aquiline: "an aquiline nose with a softly curved bridge",
  rounded: "a softly rounded nose with a gentle tip",
  wide: "a wide nose with broad nostrils",
  narrow: "a narrow, slim nose",
  flat_bridge: "a nose with a low, flat bridge",
  upturned: "a slightly upturned nose",
};

const BODY_TYPE_DESC: Record<string, string> = {
  very_thin: "very slender, slim build, narrow shoulders and thin face",
  thin: "slim build, lean face",
  average: "average build",
  chubby: "slightly heavier build, rounder face and softer features",
  heavy: "noticeably heavier build, fuller face, rounded cheeks and broader shoulders",
};

// Compact, focused art direction. Style + dignity + anonymity only.
// Framing is enforced separately right after the subject for maximum weight.
export const ART_DIRECTION_INVARIANTS = `
STYLE: hand-drawn semi-realistic editorial storybook illustration. Fine soft ink linework with subtle organic outlines. Soft colored-pencil shading with a light digital wash. Realistic human proportions, clearly non-photographic, gently stylized.
COLOR: warm, slightly desaturated, harmonious. Muted earth and warm pastel tones. No neon, no oversaturation.
ANONYMITY (CRITICAL): generic archetypal character — must NEVER resemble any real person, public figure or celebrity. Fictional respectful stand-in only.
DIGNITY: warm, kind, gentle. Quiet humanity. No caricature, no stereotype, no pathos, no misery.
BACKGROUND (STRICT): purely abstract, socially neutral. A large off-white / warm cream canvas dominates the frame (at least 55% of the surface). Behind the subject, exactly THREE soft organic blob shapes in THREE different muted tints, low opacity (~25-40%), gently blurred, no hard edges, scattered behind the head and shoulders. No fourth color, no pattern, no texture beyond a faint paper grain. Absolutely no objects, no furniture, no window, no plants, no room, no street, no workshop, no landscape, no decorative motif — nothing that suggests wealth, poverty, location or activity.
`.trim();

// Strict framing block. Short, repeated, capitalized — image models obey these much better than long paragraphs.
export const FRAMING_BLOCK = `
IMAGE FORMAT — STRICT: square 1:1 canvas. Full-bleed illustration. The illustrated background MUST extend all the way to the four edges of the image.
ABSOLUTELY FORBIDDEN: paper sheet, torn paper edge, deckled edge, white margin, mat, passe-partout, frame, scrapbook outline, sticker outline, rounded-corner card, watercolor paper texture, visible paper grain, vignette.
Composition: chest-up bust, subject centered, character occupies ~65-75% of the frame, looking softly toward the camera.
`.trim();

// Curated palette of soft, socially-neutral tints. Ordered so that (i, i+2, i+4) always yields a harmonious triplet.
const BLOB_TINTS = [
  "dusty terracotta",
  "soft sage",
  "warm ochre",
  "misty blue",
  "faded plum",
  "clay rose",
  "sand beige",
];

const BLOB_LAYOUTS = [
  { main: "in the upper-left area behind the head", b: "in the lower-right area behind the shoulder", c: "in the mid-left edge" },
  { main: "in the upper-right area behind the head", b: "in the lower-left area behind the shoulder", c: "in the mid-right edge" },
  { main: "centered behind the head, slightly offset to the left", b: "in the lower-right area", c: "in the upper-right corner" },
  { main: "centered behind the head, slightly offset to the right", b: "in the lower-left area", c: "in the upper-left corner" },
];

const BLOB_MAIN_SIZES = ["medium", "large", "extra large"];

export function pickBackgroundDirective(seed: number): string {
  const s = (seed >>> 0) || 1;
  const tintStart = s % BLOB_TINTS.length;
  const tintA = BLOB_TINTS[tintStart];
  const tintB = BLOB_TINTS[(tintStart + 2) % BLOB_TINTS.length];
  const tintC = BLOB_TINTS[(tintStart + 4) % BLOB_TINTS.length];
  const layout = BLOB_LAYOUTS[Math.floor(s / 7) % BLOB_LAYOUTS.length];
  const mainSize = BLOB_MAIN_SIZES[Math.floor(s / 28) % BLOB_MAIN_SIZES.length];

  return [
    "BACKGROUND COMPOSITION — STRICT, OVERRIDES ANY OTHER BACKGROUND DESCRIPTION:",
    "A large off-white warm cream canvas covers most of the frame (at least 55% of the visible surface).",
    `Behind the subject, paint exactly THREE soft organic blob shapes, gently blurred, low opacity (~25-40%), no hard edges, no outlines:`,
    `- one ${mainSize} ${tintA} blob ${layout.main} (dominant blob, behind the head),`,
    `- one smaller ${tintB} blob ${layout.b},`,
    `- one smaller ${tintC} blob ${layout.c}.`,
    "The three blobs never touch the subject's face. No fourth color anywhere in the background. No objects, no furniture, no window, no plant, no landscape, no scene, no pattern, no geometric shape.",
  ].join("\n");
}

// Short, focused negative prompt. Long lists dilute and are ignored by Gemini image models.
export const NEGATIVE_PROMPT = [
  "no photograph", "no photorealism", "no 3D render", "no CGI", "no Pixar style",
  "no flat vector sticker", "no anime", "no manga", "no oil painting", "no saturated watercolor",
  "no white border", "no paper edge", "no torn edge", "no deckled edge", "no frame", "no watercolor paper texture", "no vignette", "no plain white studio background",
  "no domestic scene", "no interior", "no furniture", "no window", "no plants", "no landscape", "no street", "no workshop", "no decorative pattern",
  "no more than three background colors", "no geometric shapes in background", "no hard-edged background shapes",
  "no identifiable real person", "no celebrity likeness",
  "no multiple faces", "no text", "no watermark", "no logo",
].join(", ");


export function buildAvatarPrompt(t: AvatarTraits): string {
  const features = t.avatar_facial_features
    .map(f => FACIAL_FEATURE_DESC[f])
    .filter(Boolean)
    .join(", ");

  // Lead with the high-signal phenotypic attributes first (gender, age, hair),
  // then face/skin/eyes. Image models weight early tokens the most.
  const hairColor = HAIR_COLOR_DESC[t.avatar_hair_color] ?? t.avatar_hair_color;
  const hairType = HAIR_TYPE_DESC[t.avatar_hair_type] ?? t.avatar_hair_type;
  const hairLength = (t.avatar_hair_length ?? "").replace(/_/g, " ");
  const hairStyle = (t.avatar_hair_style ?? "").replace(/_/g, " ");
  const hairVolume = t.avatar_hair_volume ?? "";

  const subjectParts = [
    `a ${t.avatar_age_range} year old ${t.avatar_gender}`,
    `with ${hairLength} ${hairType} ${hairColor} hair (${hairStyle} style, ${hairVolume} volume)`,
    SKIN_DESC[t.avatar_skin_tone] ?? `${t.avatar_skin_tone} skin`,
    `${t.avatar_face_shape.replace(/_/g, " ")} face shape`,
    t.avatar_nose ? NOSE_DESC[t.avatar_nose] : "",
    `${t.avatar_eye_shape} ${t.avatar_eye_color} eyes`,
    features,
  ].filter(Boolean);
  const subject = subjectParts.join(", ");

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
    if (t.avatar_beard && t.avatar_beard !== "none") {
      if (t.avatar_beard === "religious_long") {
        extras.push("a long untrimmed beard in a modest religious style, with the moustache kept short or trimmed above the upper lip");
      } else {
        extras.push(`${t.avatar_beard} beard`);
      }
    }
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

  // SUBJECT FIRST, then framing, then art direction.
  return [
    `PRIMARY SUBJECT — STRICTLY FOLLOW ALL ATTRIBUTES BELOW, do not substitute or omit any of them:`,
    subject + ".",
    extras.length ? `DETAILS: ${extras.join(", ")}.` : "",
    `EXPRESSION: ${expression}.`,
    `POSTURE: ${posture}.`,
    `CLOTHING: ${clothing} ${culturalCue}`.trim() + ".",
    "",
    FRAMING_BLOCK,
    "",
    ART_DIRECTION_INVARIANTS,
    "",
    `AVOID: ${NEGATIVE_PROMPT}.`,
  ].filter(Boolean).join("\n");
}

// Same model for preview and final to guarantee a single consistent cartoon style across the catalog.
export const MODEL_PREVIEW = "google/gemini-3.1-flash-image-preview";
export const MODEL_FINAL = "google/gemini-3.1-flash-image-preview";
export const MODEL_QA = "google/gemini-2.5-flash";
