// Centralized art direction — invariants injected in every avatar prompt.
// Locked: not editable from admin panel. Guarantees premium homogeneous catalog.

import { AvatarTraits, TraitDiff } from "./avatarTraits.ts";

// EXPRESSION_DESCRIPTIONS — fragments aligned with the 4 user-facing tonalities
// of the simplified Avatar Studio (Réservée / Chaleureuse / Fatiguée / Inquiète).
// The other historic keys are kept and rétro-mappés vers la tonalité la plus proche.
const EXPRESSION_DESCRIPTIONS: Record<string, string> = {
  // warm
  gentle_smile: "Emotional tone: warm. Add a gentle natural smile, softer eyes, and a welcoming human presence. The expression should feel kind and approachable, never forced or exaggerated.",
  discreet_smile: "Emotional tone: warm. A discreet, almost imperceptible smile with kind eyes; welcoming presence, never forced.",
  hopeful: "Emotional tone: warm. A hopeful, soft expression with a gentle gaze; kind and approachable, never theatrical.",
  // reserved
  reserved: "Emotional tone: reserved. Keep the expression calm, composed, understated, with a neutral mouth and steady gaze. No strong smile, no visible distress.",
  calm: "Emotional tone: reserved. A calm, composed expression with a relaxed mouth and steady gaze; no strong smile, no distress.",
  serious_soft: "Emotional tone: reserved. A serious but soft expression, gentle gaze, no harshness; composed and understated.",
  thoughtful: "Emotional tone: reserved. A thoughtful, composed expression, steady gaze; understated, no distress.",
  resilient: "Emotional tone: reserved. A composed expression conveying quiet strength; steady gaze, no theatricality.",
  // tired
  tired_but_warm: "Emotional tone: tired. Add subtle visible fatigue around the eyes and a slightly heavier gaze while preserving dignity, humanity, and warmth. Avoid despair, illness, misery, or exaggerated suffering.",
  // worried
  pensive: "Emotional tone: worried. Show a subtly concerned expression with a slightly tense gaze and a calm, restrained face. Keep the emotion discreet and human. Avoid panic, despair, theatrical sadness, or exaggerated distress.",
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
  straight: "straight smooth hair, no waves, sleek strands",
  wavy: "wavy hair with soft S-shaped waves, no curls",
  curly: "clearly curly hair with defined curls, ringlets or spiral curls",
  coily: "tightly coiled afro-textured hair, dense kinky texture with small tight coils — distinctly coily, not merely curly",
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
  very_thin: "clearly very slender body, narrow thin face and jawline, thin neck, narrow shoulders, slim collarbone, garment falling loose on a slim frame",
  thin: "slim body, lean face and jawline, slender neck and shoulders, garment lightly fitted on a thin frame",
  average: "average build, neutral proportions",
  chubby: "clearly fuller body, rounder cheeks and softer jawline, slightly wider neck and shoulders, fuller upper bust, garment naturally following a fuller body volume",
  heavy: "clearly large full body build, visibly fuller face with full round cheeks, softer rounded lower face and chin, wider thicker neck, broader shoulders, larger upper bust, garment naturally draping over a noticeably larger body volume — the heavier silhouette MUST be clearly visible, not subtle",
};

// Compact, focused art direction. Style + dignity + anonymity only.
// Framing is enforced separately right after the subject for maximum weight.
export const ART_DIRECTION_INVARIANTS = `
STYLE: clean modern editorial illustration. Fine soft ink linework with subtle organic outlines. Soft colored-pencil shading with a light digital wash. Realistic human proportions, clearly non-photographic, gently stylized.
COLOR: warm, slightly desaturated, harmonious. Muted earth and warm pastel tones. No neon, no oversaturation.
ANONYMITY (CRITICAL): generic archetypal character — must NEVER resemble any real person, public figure or celebrity. Fictional respectful stand-in only.
DIGNITY (GLOBAL, NON-NEGOTIABLE): Always portray the person with dignity, respect, and humanity. Never make the portrait humiliating, miserable, grotesque, exaggerated, caricatural, or stereotyped. Quiet humanity, no pathos.
`.trim();

// Strict framing block. Short, repeated, capitalized — image models obey these much better than long paragraphs.
export const FRAMING_BLOCK = `
IMAGE FORMAT — STRICT: square 1:1 canvas. Full-bleed illustration. The white background MUST extend all the way to the four edges of the image.
FRAMING — STRICT: the subject shows HEAD + NECK + SHOULDERS + UPPER BUST, with the garment fully drawn. The bottom edge of the canvas crops just BELOW the upper-bust line — clearly above the waist, clearly above the mid-torso. The upper bust IS visible (this is required), but the full torso, mid-chest, ribcage and waist MUST NOT be visible. No deep cleavage, no exposed chest skin beyond a normal neckline.
SUBJECT SIZE — TARGET: the subject occupies approximately 70% of the canvas (both height and width). Preferred range: 65%–75%. AT LEAST 12% of pure white margin MUST remain visible on EACH of the four sides. The subject must NEVER touch any edge of the canvas.
COMPOSITION: subject perfectly centered horizontally and vertically. The face occupies the upper-middle portion of the framed subject. Looking softly toward the camera.
COMPLETE UPPER BUST — STRICT (NON-NEGOTIABLE):
The portrait must show a complete, solid upper bust with fully visible shoulders and a continuous torso outline down to the cropping line.
The clothing and shoulders must remain fully drawn and fully opaque until the bottom crop line.
The lower edge of the upper bust must end as a CLEAN DRAWN PORTRAIT (a real garment line + a clean horizontal canvas crop), NOT as a fading wash into the white background.
Do not fade, dissolve, wash out, blur, mask, vignette or watercolor-fade the bust. No circular crop, no cut-off shoulders, no disappearing body, no soft fade-out at the bottom.
ABSOLUTELY FORBIDDEN: full torso visible, waist visible, mid-chest visible, ribcage visible, hips, arms hanging full-length, edge-to-edge subject, head touching the top edge, shoulders touching the side edges, paper sheet, torn paper edge, deckled edge, mat, passe-partout, frame, scrapbook outline, sticker outline, rounded-corner card, watercolor paper texture, visible paper grain, vignette, faded edges, soft fade at bottom, drop shadow under chin, ghosted edges, soft halo around hair.
`.trim();


// ---- Background system --------------------------------------------------------
// The colored mesh-gradient background is composed in the UI (CSS layer) using
// curated imported assets. The image model must therefore generate the subject
// on a perfectly plain white background, edge-to-edge, with no halo, no glow,
// no gradient and no decoration — so the front-end can layer the portrait
// cleanly over any background.
export function buildBackgroundBlock(_seed: string): string {
  return `
BACKGROUND — STRICT PLAIN WHITE (NON-NEGOTIABLE):
Pure plain white background (#FFFFFF), perfectly uniform, edge-to-edge, full-bleed to all four corners of the square canvas.
ABSOLUTELY NO: halo, glow, gradient, mesh gradient, color tint, shadow behind the subject, vignette, texture, paper grain, framing, border, dot, pattern, scenery, object, furniture, window, wall, sky, soft fade where the body meets the bottom edge.
The subject must be cleanly isolated on this flat white, with crisp opaque edges, ready for layered composition. Any background color or decoration is a critical failure.
`.trim();
}

// Short, focused negative prompt. Long lists dilute and are ignored by Gemini image models.
// IMPORTANT: do NOT add "no white background" — the new system requires plain white.
export const NEGATIVE_PROMPT = [
  "no photograph", "no photorealism", "no 3D render", "no CGI", "no Pixar style",
  "no flat vector sticker", "no anime", "no manga", "no oil painting", "no saturated watercolor",
  "no paper edge", "no torn edge", "no deckled edge", "no frame", "no watercolor paper texture",
  "no vignette", "no faded edges", "no watercolor edges", "no soft fade at bottom",
  "no head-only portrait", "no floating bust", "no drop shadow under chin",
  "no full torso", "no waist visible", "no mid-chest visible", "no ribcage visible", "no hips", "no full-length arms", "no deep cleavage", "no exposed chest skin",
  "no ghosted edges", "no soft halo around hair",
  "no colored background", "no gradient background", "no halo behind the subject", "no glow behind the subject", "no shadow behind the subject",
  "no textured background", "no patterns", "no geometric shapes in background",
  "no contextual scene", "no interior", "no furniture", "no window", "no objects behind the subject",
  "no identifiable real person", "no celebrity likeness",
  "no multiple faces", "no text", "no watermark", "no logo",
  // Bust-completeness — direct tokens (no double negation) per operator brief.
  "watercolor fade-out", "disappearing torso", "fading bust", "dissolved shoulders",
  "cropped shoulders", "cut-off torso", "circular crop", "vignette mask over body",
  "white gradient over body", "unfinished clothing", "body fading into background",
  "lower bust missing", "transparent fade at bottom", "soft bottom dissolve",
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
  if ((t.avatar_fatigue_level ?? 0) >= 3) extras.push("visible but dignified fatigue in the face — never sick, miserable, theatrical, or exaggerated; quiet humanity preserved");
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

  // SUBJECT FIRST, then framing, then art direction, then background system.
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
    buildBackgroundBlock(t.avatar_seed ?? ""),
    "",
    `AVOID: ${NEGATIVE_PROMPT}.`,
  ].filter(Boolean).join("\n");
}

// Same model for preview and final to guarantee a single consistent cartoon style across the catalog.
export const MODEL_PREVIEW = "google/gemini-3.1-flash-image-preview";
export const MODEL_FINAL = "google/gemini-3.1-flash-image-preview";
export const MODEL_EDIT = "google/gemini-3.1-flash-image-preview";
export const MODEL_QA = "google/gemini-2.5-flash";

// ---------------------------------------------------------------------------
// EDIT-MODE PROMPT — used when a beneficiary already has an approved avatar
// and the user changes a small subset of attributes. We send the existing
// image as a visual reference and ask Gemini to modify ONLY the listed
// attributes, preserving identity / pose / framing / lighting / style.
//
// IMPORTANT: FRAMING_BLOCK, ART_DIRECTION_INVARIANTS, buildBackgroundBlock
// and NEGATIVE_PROMPT are reinjected here. Without them, Gemini Flash Image
// drifts on art direction as soon as expression is touched (Léa case).
// ---------------------------------------------------------------------------

const EYE_COLOR_DESC: Record<string, string> = {
  brown: "warm brown eyes",
  dark_brown: "deep dark brown eyes",
  hazel: "hazel eyes",
  green: "green eyes",
  blue: "blue eyes",
  gray: "soft gray eyes",
};
const EYE_SHAPE_DESC: Record<string, string> = {
  almond: "almond-shaped eyes",
  round: "round, open eyes",
  soft: "soft-shaped eyes",
  narrow: "narrow eyes",
  hooded: "hooded eyelids",
  tired: "subtly tired eyes",
  deep_set: "deep-set eyes",
};
const BEARD_DESC: Record<string, string> = {
  none: "clean-shaven (no beard)",
  light: "light stubble beard",
  full: "full trimmed beard",
  grey: "neatly trimmed grey beard",
  religious_long: "a long untrimmed beard in a modest religious style, moustache kept short",
};
const MOUSTACHE_DESC: Record<string, string> = {
  none: "no moustache",
  light: "light thin moustache",
  full: "full moustache",
};
const MOBILITY_DESC: Record<string, string> = {
  none: "no visible mobility aid",
  wheelchair_manual: "seated in a simple manual wheelchair, hands on the lap",
  wheelchair_electric: "seated in a modern electric wheelchair with discreet controls",
  cane: "holding a wooden walking cane",
  crutches: "a single forearm crutch visible beside the subject",
  walker: "a light walking frame visible in front",
  visible_bandage: "a discreet white bandage on the forearm",
  arm_sling: "one arm gently supported in a soft fabric sling",
  oxygen_cannula: "wearing a discreet nasal oxygen cannula",
};
const HEAD_COVERING_DESC: Record<string, string> = {
  none: "no head covering, hair fully visible",
  light_scarf: "a light scarf draped on the shoulders, hair fully visible",
  headscarf: "a modest headscarf partially covering the hair",
  hijab_full: "a hijab fully covering the hair, ears and neck",
  taqiyah: "a small white taqiyah on the crown of the head",
  turban: "a neatly wrapped turban in a muted tone",
  kippah: "a small discreet kippah on the crown of the head",
};
const FOREHEAD_MARK_DESC: Record<string, string> = {
  none: "no forehead mark",
  bindi_red: "a small red bindi centered on the forehead",
  bindi_black: "a small black bindi centered on the forehead",
  bindi_decorative: "a small decorative bindi centered on the forehead",
};
const PARENT_ENERGY_DESC: Record<string, string> = {
  none: "no specific parental presence",
  protective_parent: "warm protective parental presence",
  practical_parent: "calm grounded parental presence",
  tired_but_warm_parent: "weary parental presence softened by warmth",
};
const HAIR_LENGTH_DESC: Record<string, string> = {
  very_short: "very short hair",
  short: "short hair",
  shoulder: "shoulder-length hair",
  medium: "medium-length hair",
  long: "long hair",
};
const HAIR_VOLUME_DESC: Record<string, string> = {
  fine: "fine, thin hair volume",
  natural: "natural hair volume",
  light: "light hair volume",
  thick: "thick, dense hair volume",
};
const HAIR_STYLE_DESC: Record<string, string> = {
  clean_cut: "clean-cut hairstyle",
  tousled: "tousled hairstyle",
  side_parted: "side-parted hairstyle",
  loose: "loose flowing hairstyle",
  softly_tied: "softly tied back hairstyle",
  half_up: "half-up hairstyle",
  natural_waves: "natural waves hairstyle",
  bun: "neat bun hairstyle",
  braided_simple: "simple braid hairstyle",
  cornrows: "cornrows hairstyle",
  box_braids: "box braids hairstyle",
  braided_updo: "braided updo hairstyle",
};

const EDIT_VALUE_LABELS: Record<string, Record<string, string>> = {
  avatar_hair_color: HAIR_COLOR_DESC,
  avatar_hair_type: HAIR_TYPE_DESC,
  avatar_hair_length: HAIR_LENGTH_DESC,
  avatar_hair_volume: HAIR_VOLUME_DESC,
  avatar_hair_style: HAIR_STYLE_DESC,
  avatar_skin_tone: SKIN_DESC,
  avatar_nose: NOSE_DESC,
  avatar_body_type: BODY_TYPE_DESC,
  avatar_clothing_color_palette: PALETTE_DESC,
  avatar_clothing_style: CLOTHING_STYLE_DESC,
  avatar_expression: EXPRESSION_DESCRIPTIONS,
  avatar_posture: POSTURE_DESCRIPTIONS,
  avatar_eye_color: EYE_COLOR_DESC,
  avatar_eye_shape: EYE_SHAPE_DESC,
  avatar_beard: BEARD_DESC,
  avatar_moustache: MOUSTACHE_DESC,
  avatar_mobility_aid: MOBILITY_DESC,
  avatar_head_covering: HEAD_COVERING_DESC,
  avatar_forehead_mark: FOREHEAD_MARK_DESC,
  avatar_parent_energy: PARENT_ENERGY_DESC,
};

function describeValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "(retiré)";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "(aucun)";
  const dict = EDIT_VALUE_LABELS[key];
  if (dict && typeof value === "string" && dict[value]) return dict[value];
  return String(value).replace(/_/g, " ");
}

// Compact identity recap — reminds the model who the subject is so it does not
// silently invent a different person while applying the diff.
function buildSubjectRecap(t: AvatarTraits): string {
  const parts: string[] = [
    `${t.avatar_age_range} year old ${t.avatar_gender}`,
    `${HAIR_TYPE_DESC[t.avatar_hair_type] ?? t.avatar_hair_type} hair`,
    SKIN_DESC[t.avatar_skin_tone] ?? `${t.avatar_skin_tone} skin`,
    `${t.avatar_face_shape.replace(/_/g, " ")} face`,
  ];
  if (t.avatar_head_covering && t.avatar_head_covering !== "none") {
    parts.push(`wearing ${t.avatar_head_covering.replace(/_/g, " ")}`);
  }
  if (t.avatar_body_type && t.avatar_body_type !== "average") {
    parts.push(`${t.avatar_body_type.replace(/_/g, " ")} build`);
  }
  return parts.filter(Boolean).join(", ");
}

// Per-trait "same person transformed" guidance blocks. These are injected at
// the top of the edit prompt when a transformative attribute changes, so the
// model knows it must transform the SAME individual (not invent a new person)
// AND must allow the natural consequences of that attribute on the body/face.
const TRANSFORM_BLOCKS: Record<string, string> = {
  avatar_body_type: [
    `BODY TYPE TRANSFORMATION — SAME PERSON, CLEARLY VISIBLE CHANGE:`,
    `Transform the reference person to match the requested body type. The morphological change MUST be clearly visible — NOT subtle.`,
    `For a heavier/stronger body type (chubby, heavy): visibly increase facial fullness, cheek roundness, chin softness, jawline softness, neck width and thickness, shoulder breadth, upper-bust volume and garment drape over a larger body.`,
    `For a thinner body type (thin, very_thin): visibly reduce facial fullness, slim the cheeks and jawline, narrow the neck, shoulders and upper bust, and let the garment hang loosely on a slim frame.`,
    `Keep the SAME individual recognizable: same eye color and shape, same gaze, same nose identity, same mouth identity, same hairstyle silhouette, same hair color, same age range, same head tilt, same pose, same artistic style, same framing, same lighting.`,
    `Do NOT create a new face. Do NOT change the person into someone else. But do NOT preserve the previous silhouette either — the body morphology MUST change to match the new value.`,
  ].join("\n"),
  avatar_age_range: [
    `AGE TRANSFORMATION — SAME PERSON:`,
    `Adjust the apparent age while keeping the same individual recognizable.`,
    `Allow natural age signs (fine lines, skin tone, hair density) to evolve, but preserve the same eye shape, gaze, nose identity, mouth identity, hairstyle silhouette and overall likeness.`,
  ].join("\n"),
  avatar_expression: [
    `EXPRESSION TRANSFORMATION — SAME PERSON:`,
    `Adjust the facial expression musculature (eyes, brows, mouth corners) while preserving the same identity.`,
    `Do not change face shape, nose, eye color/shape, hairstyle or pose.`,
  ].join("\n"),
  avatar_hair_type: [
    `HAIR TYPE TRANSFORMATION — SAME PERSON, REAL TEXTURE CHANGE:`,
    `Change ONLY the hair texture to match the requested type. The texture change MUST be clearly visible.`,
    `straight = smooth, no waves. wavy = soft S-shaped waves, no curls. curly = defined curls / ringlets / spirals. coily = tightly coiled afro-textured hair, dense and kinky — clearly distinct from "curly", not just more curls.`,
    `Preserve strictly: same face, same age range, same hair COLOR (unless explicitly changed), same hair LENGTH and overall hairstyle silhouette where possible, same framing, same artistic style, same lighting.`,
    `Do not change the face, the body, the pose or the cropping.`,
  ].join("\n"),
};

function buildTransformativeIntro(diff: TraitDiff[]): string {
  const blocks = diff
    .map(d => TRANSFORM_BLOCKS[d.key])
    .filter(Boolean);
  return blocks.length ? blocks.join("\n\n") + "\n" : "";
}

function affectsBodyShape(diff: TraitDiff[]): boolean {
  return diff.some(d => d.key === "avatar_body_type");
}

export function buildEditPrompt(diff: TraitDiff[], traits: AvatarTraits): string {
  const changes = diff
    .map(d => `- ${d.humanLabel}: ${describeValue(d.key, d.after)}`)
    .join("\n");
  const subjectRecap = buildSubjectRecap(traits);
  const transformativeIntro = buildTransformativeIntro(diff);

  // When the body type changes, the face/neck/shoulders MUST be allowed to
  // adapt — so we replace the strict "same proportions / same face shape"
  // clauses with a softer "same identity" clause for that specific case.
  const bodyShifts = affectsBodyShape(diff);
  const identityClause = bodyShifts
    ? `- the SAME person and SAME identity (same eyes, same gaze, same nose, same mouth, same hairstyle, same hair color, same age range, same overall likeness). Facial fullness, cheek softness, neck/shoulder width and garment drape ARE expected to change to match the new body type.`
    : `- the exact same person and facial identity (same face shape, same proportions, same gaze, same eyes)`;
  const poseClause = bodyShifts
    ? `- the same pose, body angle and head tilt (shoulder/bust width may grow or shrink with the body type)`
    : `- the exact same pose, body angle, head tilt, shoulder position`;

  return [
    transformativeIntro,
    `EDIT THE PROVIDED REFERENCE IMAGE — surgical retouch, NOT regeneration.`,
    ``,
    `REFERENCE SUBJECT (must remain the same person):`,
    `${subjectRecap}.`,
    ``,
    `PRESERVE STRICTLY (non-negotiable):`,
    identityClause,
    poseClause,
    `- the exact same framing, crop, composition, camera distance and subject scale within the canvas`,
    `- the exact same background (color, texture, edges)`,
    `- the exact same lighting direction, color temperature and shadows`,
    `- the exact same artistic style (line work, shading, color palette, illustration style)`,
    `- the exact original lower bust boundary, garment line, shoulder visibility and torso outline from the reference image`,
    ``,
    `CHANGE ONLY the following attributes, keeping every other visual element untouched:`,
    changes || `- (no change requested)`,
    ``,
    `DO NOT:`,
    `- regenerate from scratch`,
    `- change the cropping, the canvas margins or the subject size`,
    `- change the background or add any decoration behind the subject`,
    bodyShifts
      ? `- replace the person with someone else (the face must remain recognizable as the same individual)`
      : `- alter the face structure or identity`,
    `- redraw any feature or clothing not explicitly listed above`,
    `- redraw the lower torso as a fade-out, watercolor wash or transparent dissolve`,
    `- shorten, mask, vignette or circular-crop the bust of the reference`,
    `- replace the existing drawn garment line with a soft gradient into the background`,
    ``,
    FRAMING_BLOCK,
    ``,
    ART_DIRECTION_INVARIANTS,
    ``,
    buildBackgroundBlock(String(traits.avatar_seed ?? "")),
    ``,
    `AVOID: ${NEGATIVE_PROMPT}.`,
    ``,
    `Return ONE square 1:1 image with the requested changes applied as a minimal, surgical retouch on top of the reference. Every preserved element must remain pixel-faithful to the reference (except the elements explicitly transformed above).`,
  ].filter(Boolean).join("\n");
}


