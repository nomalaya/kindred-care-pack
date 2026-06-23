// Avatar trait inference engine v2
// Pure deterministic inference from beneficiary business data.
// Cultural tags bias distributions LIGHTLY (+15-25%) but never lock phenotypes.
// Short story / emotional sentence are NEVER injected as text into prompts —
// they only deduce expression/posture/parent_energy through closed vocabularies.

export interface BeneficiaryInput {
  id: string;
  alias_first_name?: string | null;
  approx_age?: number | null;
  avatar_gender?: string | null;
  avatar_age_range?: string | null;
  avatar_skin_tone?: string | null;
  avatar_hair_type?: string | null;
  beneficiary_category?: string | null;
  profile_type?: string | null;
  children_count?: number | null;
  region?: string | null;
  short_story?: string | null;
  emotional_sentence?: string | null;
  diet_tags?: string[] | null;
  culture_tags?: string[] | null;
  urgency_level?: number | null;
  avatar_face_shape?: string | null;
  avatar_nose?: string | null;
  avatar_eye_shape?: string | null;
  avatar_eye_color?: string | null;
  avatar_facial_features?: string[] | null;
  avatar_hair_color?: string | null;
  avatar_hair_length?: string | null;
  avatar_hair_volume?: string | null;
  avatar_hair_style?: string | null;
  avatar_clothing_style?: string | null;
  avatar_clothing_color_palette?: string | null;
  avatar_expression?: string | null;
  avatar_posture?: string | null;
  avatar_parent_energy?: string | null;
  avatar_cultural_style?: string | null;
  avatar_seed?: number | null;
  // Avatar Studio extensions
  avatar_tired_level?: number | null;
  avatar_emotional_brightness?: number | null;
  avatar_beard?: string | null;
  avatar_moustache?: string | null;
  avatar_bald_level?: number | null;
  avatar_hair_recession?: string | null;
  avatar_head_covering?: string | null;
  avatar_forehead_mark?: string | null;
  avatar_cultural_style_override?: string | null;
  avatar_resilience_level?: number | null;
  avatar_fatigue_level?: number | null;
  avatar_dignity_level?: number | null;
  avatar_mobility_aid?: string | null;
  avatar_body_type?: string | null;
}

export interface AvatarTraits {
  avatar_gender: string;
  avatar_age_range: string;
  avatar_skin_tone: string;
  avatar_hair_type: string;
  avatar_face_shape: string;
  avatar_nose?: string;
  avatar_eye_shape: string;
  avatar_eye_color: string;
  avatar_facial_features: string[];
  avatar_hair_color: string;
  avatar_hair_length: string;
  avatar_hair_volume: string;
  avatar_hair_style: string;
  avatar_clothing_style: string;
  avatar_clothing_color_palette: string;
  avatar_expression: string;
  avatar_posture: string;
  avatar_parent_energy: string;
  avatar_cultural_style: string;
  avatar_seed: number;
  // Avatar Studio extensions (carried through to prompt builder)
  avatar_tired_level?: number;
  avatar_emotional_brightness?: number;
  avatar_beard?: string;
  avatar_moustache?: string;
  avatar_bald_level?: number;
  avatar_hair_recession?: string;
  avatar_head_covering?: string;
  avatar_forehead_mark?: string;
  avatar_cultural_style_override?: string;
  avatar_resilience_level?: number;
  avatar_fatigue_level?: number;
  avatar_dignity_level?: number;
  avatar_mobility_aid?: string;
  avatar_body_type?: string;
}

// FNV-1a 32-bit hash — deterministic seed from beneficiary id
export function deterministicSeed(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Seeded PRNG (mulberry32)
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T>(rng: () => number, items: Array<[T, number]>): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [v, w] of items) {
    r -= w;
    if (r <= 0) return v;
  }
  return items[items.length - 1][0];
}

// Cultural bias map — light probabilistic influence on PHENOTYPES only.
// Boosts are +15-25% to certain options. Never locks any trait.
const CULTURAL_BIAS: Record<string, {
  skin?: Record<string, number>;
  hair_color?: Record<string, number>;
  hair_type?: Record<string, number>;
  eye_color?: Record<string, number>;
  clothing_palette?: string;
  cultural_style?: string;
}> = {
  maghreb: {
    skin: { medium: 1.2, olive: 1.25, tan: 1.2 },
    hair_color: { black: 1.2, dark_brown: 1.2 },
    hair_type: { wavy: 1.15, curly: 1.15 },
    eye_color: { brown: 1.15, hazel: 1.15 },
    clothing_palette: "warm_earth",
    cultural_style: "subtle_mediterranean",
  },
  afrique_ouest: {
    skin: { dark: 1.25, deep: 1.25, medium_dark: 1.2 },
    hair_color: { black: 1.25 },
    hair_type: { coily: 1.2, curly: 1.15 },
    eye_color: { brown: 1.2, dark_brown: 1.2 },
    clothing_palette: "warm_earth",
    cultural_style: "subtle_west_african",
  },
  afrique_centrale: {
    skin: { dark: 1.25, deep: 1.25 },
    hair_color: { black: 1.25 },
    hair_type: { coily: 1.2 },
    clothing_palette: "warm_earth",
    cultural_style: "subtle_central_african",
  },
  afrique_est: {
    skin: { medium_dark: 1.2, dark: 1.2 },
    hair_color: { black: 1.2 },
    hair_type: { coily: 1.15, curly: 1.15 },
    clothing_palette: "warm_earth",
  },
  asie_sud: {
    skin: { medium: 1.2, tan: 1.2, olive: 1.15 },
    hair_color: { black: 1.25, dark_brown: 1.15 },
    hair_type: { straight: 1.15, wavy: 1.15 },
    eye_color: { brown: 1.2, dark_brown: 1.2 },
    clothing_palette: "soft_jewel",
  },
  asie_est: {
    skin: { light: 1.15, medium: 1.15 },
    hair_color: { black: 1.25 },
    hair_type: { straight: 1.25 },
    eye_color: { brown: 1.2, dark_brown: 1.2 },
    clothing_palette: "muted_neutral",
  },
  asie_sud_est: {
    skin: { medium: 1.2, tan: 1.15 },
    hair_color: { black: 1.2, dark_brown: 1.15 },
    hair_type: { straight: 1.2 },
    eye_color: { brown: 1.2 },
  },
  moyen_orient: {
    skin: { olive: 1.25, medium: 1.2, tan: 1.15 },
    hair_color: { dark_brown: 1.2, black: 1.2 },
    hair_type: { wavy: 1.15, curly: 1.1 },
    eye_color: { brown: 1.2, hazel: 1.15 },
    clothing_palette: "warm_earth",
  },
  europe_est: {
    skin: { light: 1.2, fair: 1.15 },
    hair_color: { light_brown: 1.15, blonde: 1.1, dark_brown: 1.1 },
    eye_color: { blue: 1.15, green: 1.1, gray: 1.1 },
    clothing_palette: "muted_neutral",
  },
  europe_sud: {
    skin: { olive: 1.15, medium: 1.15 },
    hair_color: { dark_brown: 1.2, black: 1.1 },
    hair_type: { wavy: 1.15 },
    eye_color: { brown: 1.15, hazel: 1.1 },
  },
  europe_nord: {
    skin: { fair: 1.2, light: 1.15 },
    hair_color: { blonde: 1.2, light_brown: 1.15, red: 1.05 },
    hair_type: { straight: 1.1 },
    eye_color: { blue: 1.2, gray: 1.15, green: 1.1 },
    clothing_palette: "muted_neutral",
  },
  dom: {
    skin: { medium_dark: 1.2, dark: 1.2, tan: 1.15 },
    hair_color: { black: 1.2, dark_brown: 1.15 },
    hair_type: { curly: 1.15, coily: 1.15, wavy: 1.1 },
  },
};

// Base French distribution (INSEE-inspired diversity)
const BASE_SKIN: Array<[string, number]> = [
  ["fair", 8], ["light", 22], ["medium", 28], ["olive", 14],
  ["tan", 10], ["medium_dark", 8], ["dark", 7], ["deep", 3],
];
const BASE_HAIR_COLOR: Array<[string, number]> = [
  ["dark_brown", 30], ["black", 22], ["brown", 15], ["light_brown", 18],
  ["blonde", 12], ["gray", 8], ["white", 5], ["red", 3], ["auburn", 2],
];
const BASE_HAIR_TYPE: Array<[string, number]> = [
  ["straight", 38], ["wavy", 32], ["curly", 18], ["coily", 12],
];
const BASE_EYE_COLOR: Array<[string, number]> = [
  ["brown", 50], ["dark_brown", 18], ["hazel", 12],
  ["green", 8], ["blue", 9], ["gray", 3],
];
const BASE_EYE_SHAPE: Array<[string, number]> = [
  ["almond", 35], ["round", 30], ["soft", 25], ["narrow", 10],
];
const BASE_FACE_SHAPE: Array<[string, number]> = [
  ["oval", 30], ["round", 25], ["square_soft", 18],
  ["heart", 14], ["long", 13],
];

function applyBias(
  base: Array<[string, number]>,
  bias?: Record<string, number>,
): Array<[string, number]> {
  if (!bias) return base;
  return base.map(([v, w]) => [v, w * (bias[v] ?? 1)] as [string, number]);
}

function mergeBias(
  cultureTags: string[],
  field: "skin" | "hair_color" | "hair_type" | "eye_color",
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const tag of cultureTags) {
    const cb = CULTURAL_BIAS[tag]?.[field];
    if (!cb) continue;
    for (const [k, v] of Object.entries(cb)) {
      out[k] = Math.max(out[k] ?? 1, v);
    }
  }
  return out;
}

// ---- Expression inference (emotional realism, no pathos) ----
// Closed vocabulary; story text only triggers keyword mapping, never sent raw.

const POSITIVE_KW = ["espoir", "sourire", "joie", "soulagement", "famille", "enfants", "amour", "fierté", "reconnaissance"];
const TIRED_KW = ["fatigue", "fatigué", "épuis", "lourd", "difficile", "épreuv", "seul", "isolé"];
const RESILIENT_KW = ["combat", "tenir", "tient bon", "courage", "battant", "se relève", "résist", "garder", "avancer"];
const SERIOUS_KW = ["perte", "décès", "violence", "deuil", "exil", "fui", "guerre", "maladie", "cancer"];
const REFLECTIVE_KW = ["pense", "se demande", "rêve", "espère", "voudrait", "souvient"];

function matchAny(text: string, kws: string[]): boolean {
  const t = text.toLowerCase();
  return kws.some(k => t.includes(k));
}

function inferExpression(b: BeneficiaryInput, rng: () => number): string {
  const text = `${b.short_story ?? ""} ${b.emotional_sentence ?? ""}`;
  // Realistic empathy: not only smiles
  if (matchAny(text, SERIOUS_KW)) {
    return pickWeighted(rng, [
      ["serious_soft", 3], ["thoughtful", 3],
      ["tired_but_warm", 2], ["resilient", 2],
    ]);
  }
  if (matchAny(text, TIRED_KW)) {
    return pickWeighted(rng, [
      ["tired_but_warm", 4], ["resilient", 2], ["pensive", 1], ["calm", 1],
    ]);
  }
  if (matchAny(text, RESILIENT_KW)) {
    return pickWeighted(rng, [
      ["resilient", 4], ["hopeful", 2], ["calm", 2], ["discreet_smile", 1],
    ]);
  }
  if (matchAny(text, REFLECTIVE_KW)) {
    return pickWeighted(rng, [
      ["thoughtful", 3], ["pensive", 2], ["calm", 2], ["hopeful", 1],
    ]);
  }
  if (matchAny(text, POSITIVE_KW)) {
    return pickWeighted(rng, [
      ["gentle_smile", 3], ["hopeful", 3], ["discreet_smile", 2], ["calm", 1],
    ]);
  }
  // Neutral default — varied realistic empathy
  return pickWeighted(rng, [
    ["calm", 3], ["discreet_smile", 2], ["gentle_smile", 2],
    ["thoughtful", 2], ["hopeful", 2], ["reserved", 1],
  ]);
}

function inferPosture(b: BeneficiaryInput, rng: () => number): string {
  const cat = b.beneficiary_category;
  if (cat === "famille_enfants") {
    return pickWeighted(rng, [["protective", 3], ["upright_calm", 2], ["leaning_slightly", 1]]);
  }
  if ((b.approx_age ?? 0) >= 65) {
    return pickWeighted(rng, [["seated_dignified", 3], ["upright_calm", 2]]);
  }
  return pickWeighted(rng, [["upright_calm", 3], ["leaning_slightly", 2], ["relaxed", 2]]);
}

function inferParentEnergy(b: BeneficiaryInput, rng: () => number): string {
  if (b.beneficiary_category !== "famille_enfants" && (b.children_count ?? 0) === 0) {
    return "none";
  }
  const text = `${b.short_story ?? ""} ${b.emotional_sentence ?? ""}`;
  if (matchAny(text, TIRED_KW)) {
    return pickWeighted(rng, [["tired_but_warm_parent", 4], ["practical_parent", 2]]);
  }
  if (matchAny(text, RESILIENT_KW) || matchAny(text, POSITIVE_KW)) {
    return pickWeighted(rng, [["protective_parent", 3], ["practical_parent", 2], ["tired_but_warm_parent", 1]]);
  }
  return pickWeighted(rng, [["protective_parent", 3], ["practical_parent", 3], ["tired_but_warm_parent", 2]]);
}

function inferCulturalStyle(cultureTags: string[], rng: () => number): string {
  for (const tag of cultureTags) {
    const cs = CULTURAL_BIAS[tag]?.cultural_style;
    if (cs) return cs;
  }
  return pickWeighted(rng, [["neutral_european", 4], ["soft_modern", 3], ["subtle_mediterranean", 1]]);
}

function inferAgeRange(b: BeneficiaryInput): string {
  if (b.avatar_age_range) return b.avatar_age_range;
  const a = b.approx_age ?? 35;
  if (a < 25) return "18-25";
  if (a < 35) return "25-35";
  if (a < 45) return "35-45";
  if (a < 55) return "45-55";
  if (a < 65) return "55-65";
  if (a < 75) return "65-75";
  return "75-85";
}

function inferGender(b: BeneficiaryInput, rng: () => number): string {
  if (b.avatar_gender && b.avatar_gender !== "person") return b.avatar_gender;
  return rng() < 0.5 ? "woman" : "man";
}

function inferClothingStyle(b: BeneficiaryInput, rng: () => number): string {
  if (b.profile_type === "etudiant") {
    return pickWeighted(rng, [["casual_modest", 3], ["simple_layered", 2]]);
  }
  if ((b.approx_age ?? 0) >= 65) {
    return pickWeighted(rng, [["classic_simple", 3], ["soft_cardigan", 2], ["modest_warm", 2]]);
  }
  if (b.beneficiary_category === "famille_enfants") {
    return pickWeighted(rng, [["practical_warm", 3], ["casual_modest", 2], ["simple_layered", 2]]);
  }
  return pickWeighted(rng, [
    ["casual_modest", 3], ["simple_layered", 2],
    ["practical_warm", 2], ["classic_simple", 2],
  ]);
}

function inferClothingPalette(cultureTags: string[], rng: () => number): string {
  for (const tag of cultureTags) {
    const cp = CULTURAL_BIAS[tag]?.clothing_palette;
    if (cp && rng() < 0.65) return cp;
  }
  return pickWeighted(rng, [
    ["warm_earth", 3], ["muted_neutral", 3],
    ["soft_jewel", 2], ["sand_ivory", 2], ["dusty_blue", 1],
  ]);
}

function inferFacialFeatures(b: BeneficiaryInput, rng: () => number): string[] {
  const age = b.approx_age ?? 35;
  const out: string[] = [];
  if (age >= 60 && rng() < 0.7) out.push("subtle_age_lines");
  if (age >= 70 && rng() < 0.6) out.push("gentle_wrinkles");
  if (rng() < 0.25) out.push("light_freckles");
  if (rng() < 0.2) out.push("soft_dimples");
  if (rng() < 0.15) out.push("expressive_brows");
  return out;
}

function inferHairLength(b: BeneficiaryInput, rng: () => number): string {
  const gender = b.avatar_gender ?? (rng() < 0.5 ? "woman" : "man");
  if (gender === "man") {
    return pickWeighted(rng, [["short", 6], ["very_short", 3], ["medium", 1]]);
  }
  return pickWeighted(rng, [
    ["medium", 4], ["long", 3], ["short", 2], ["shoulder", 3],
  ]);
}

function inferHairVolume(rng: () => number): string {
  return pickWeighted(rng, [["natural", 5], ["light", 2], ["thick", 2], ["fine", 1]]);
}

function inferHairStyle(b: BeneficiaryInput, length: string, rng: () => number): string {
  const gender = b.avatar_gender ?? "person";
  if (gender === "man" || length === "very_short" || length === "short") {
    return pickWeighted(rng, [["clean_cut", 3], ["tousled", 2], ["side_parted", 2]]);
  }
  return pickWeighted(rng, [
    ["loose", 3], ["softly_tied", 2], ["half_up", 1],
    ["natural_waves", 2], ["bun", 1], ["braided_simple", 1],
  ]);
}

export function inferAvatarTraits(b: BeneficiaryInput): AvatarTraits {
  const seed = b.avatar_seed ?? deterministicSeed(b.id);
  const rng = makeRng(seed);
  const cultureTags = b.culture_tags ?? [];

  // Phenotypes — base distribution + LIGHT cultural bias, never locked.
  const skin = b.avatar_skin_tone
    ?? pickWeighted(rng, applyBias(BASE_SKIN, mergeBias(cultureTags, "skin")));
  const hairColor = b.avatar_hair_color
    ?? pickWeighted(rng, applyBias(BASE_HAIR_COLOR, mergeBias(cultureTags, "hair_color")));
  const hairType = b.avatar_hair_type
    ?? pickWeighted(rng, applyBias(BASE_HAIR_TYPE, mergeBias(cultureTags, "hair_type")));
  const eyeColor = b.avatar_eye_color
    ?? pickWeighted(rng, applyBias(BASE_EYE_COLOR, mergeBias(cultureTags, "eye_color")));
  const eyeShape = b.avatar_eye_shape ?? pickWeighted(rng, BASE_EYE_SHAPE);
  const faceShape = b.avatar_face_shape ?? pickWeighted(rng, BASE_FACE_SHAPE);

  const ageRange = inferAgeRange(b);
  const gender = inferGender(b, rng);
  const hairLength = b.avatar_hair_length ?? inferHairLength({ ...b, avatar_gender: gender }, rng);
  const hairVolume = b.avatar_hair_volume ?? inferHairVolume(rng);
  const hairStyle = b.avatar_hair_style ?? inferHairStyle({ ...b, avatar_gender: gender }, hairLength, rng);
  const facialFeatures = b.avatar_facial_features?.length ? b.avatar_facial_features : inferFacialFeatures(b, rng);

  return {
    avatar_gender: gender,
    avatar_age_range: ageRange,
    avatar_skin_tone: skin,
    avatar_hair_type: hairType,
    avatar_face_shape: faceShape,
    avatar_eye_shape: eyeShape,
    avatar_eye_color: eyeColor,
    avatar_facial_features: facialFeatures,
    avatar_hair_color: hairColor,
    avatar_hair_length: hairLength,
    avatar_hair_volume: hairVolume,
    avatar_hair_style: hairStyle,
    avatar_clothing_style: b.avatar_clothing_style ?? inferClothingStyle(b, rng),
    avatar_clothing_color_palette: b.avatar_clothing_color_palette ?? inferClothingPalette(cultureTags, rng),
    avatar_expression: b.avatar_expression ?? inferExpression(b, rng),
    avatar_posture: b.avatar_posture ?? inferPosture(b, rng),
    avatar_parent_energy: b.avatar_parent_energy ?? inferParentEnergy(b, rng),
    avatar_cultural_style: b.avatar_cultural_style ?? inferCulturalStyle(cultureTags, rng),
    avatar_seed: seed,
    // Pass-through Studio fields (admin-overridable, no inference)
    avatar_tired_level: b.avatar_tired_level ?? undefined,
    avatar_emotional_brightness: b.avatar_emotional_brightness ?? undefined,
    avatar_beard: b.avatar_beard ?? undefined,
    avatar_moustache: b.avatar_moustache ?? undefined,
    avatar_bald_level: b.avatar_bald_level ?? undefined,
    avatar_hair_recession: b.avatar_hair_recession ?? undefined,
    avatar_head_covering: b.avatar_head_covering ?? undefined,
    avatar_forehead_mark: b.avatar_forehead_mark ?? undefined,
    avatar_cultural_style_override: b.avatar_cultural_style_override ?? undefined,
    avatar_resilience_level: b.avatar_resilience_level ?? undefined,
    avatar_fatigue_level: b.avatar_fatigue_level ?? undefined,
    avatar_dignity_level: b.avatar_dignity_level ?? undefined,
    avatar_mobility_aid: b.avatar_mobility_aid ?? undefined,
    avatar_body_type: b.avatar_body_type ?? undefined,
    avatar_nose: b.avatar_nose ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Edit-mode trait diff — used by the Avatar Studio "edit existing avatar" path.
// Compares the traits actually used at the last generation (snapshot in
// `avatar_generated_traits`) against the current values to derive a minimal,
// human-readable list of attributes that should be modified on top of the
// reference image, while preserving everything else (pose, framing, background).
// ---------------------------------------------------------------------------

// Attributes whose change would break visual identity continuity — if any of
// these change, we must NOT do an image-edit; we must fall back to a full
// regeneration so the result stays believable.
export const STRUCTURAL_TRAIT_KEYS: Array<keyof AvatarTraits> = [
  "avatar_gender",
  "avatar_age_range",
  "avatar_skin_tone",
  "avatar_face_shape",
  "avatar_nose",
  "avatar_eye_shape",
  "avatar_hair_type",
  "avatar_body_type",
  "avatar_head_covering",
];

// "Medium" traits — image-editable, but cumulating them risks identity drift.
// Used by classifyDiff to escalate the edit to a richer prompt or block it.
export const MEDIUM_TRAIT_KEYS: Array<keyof AvatarTraits> = [
  "avatar_hair_length",
  "avatar_hair_style",
  "avatar_hair_volume",
  "avatar_hair_recession",
  "avatar_bald_level",
  "avatar_beard",
  "avatar_moustache",
  "avatar_mobility_aid",
  "avatar_cultural_style",
  "avatar_cultural_style_override",
];

// All other trait keys are considered "soft / light" — safe to mutate via image edit.
export const SOFT_TRAIT_KEYS: Array<keyof AvatarTraits> = [
  "avatar_hair_color",
  "avatar_eye_color",
  "avatar_clothing_style",
  "avatar_clothing_color_palette",
  "avatar_expression",
  "avatar_posture",
  "avatar_parent_energy",
  "avatar_forehead_mark",
  "avatar_tired_level",
  "avatar_emotional_brightness",
  "avatar_resilience_level",
  "avatar_fatigue_level",
  "avatar_facial_features",
];


export interface TraitDiff {
  key: string;
  before: unknown;
  after: unknown;
  structural: boolean;
  humanLabel: string;
}

const HUMAN_LABELS: Record<string, string> = {
  avatar_gender: "genre",
  avatar_age_range: "tranche d'âge",
  avatar_skin_tone: "teint",
  avatar_hair_type: "type de cheveux",
  avatar_hair_color: "couleur de cheveux",
  avatar_hair_length: "longueur de cheveux",
  avatar_hair_volume: "volume de cheveux",
  avatar_hair_style: "coiffure",
  avatar_hair_recession: "dégagement frontal",
  avatar_bald_level: "calvitie",
  avatar_beard: "barbe",
  avatar_moustache: "moustache",
  avatar_eye_color: "couleur des yeux",
  avatar_eye_shape: "forme des yeux",
  avatar_face_shape: "forme du visage",
  avatar_nose: "nez",
  avatar_facial_features: "traits du visage",
  avatar_body_type: "morphologie",
  avatar_clothing_style: "style vestimentaire",
  avatar_clothing_color_palette: "palette vestimentaire",
  avatar_expression: "expression",
  avatar_posture: "posture",
  avatar_parent_energy: "énergie parentale",
  avatar_cultural_style: "style culturel",
  avatar_cultural_style_override: "style culturel",
  avatar_head_covering: "couvre-chef",
  avatar_forehead_mark: "marque frontale",
  avatar_mobility_aid: "aide à la mobilité",
  avatar_tired_level: "niveau de fatigue",
  avatar_emotional_brightness: "luminosité émotionnelle",
  avatar_resilience_level: "résilience",
  avatar_fatigue_level: "fatigue",
};

function normalizeForCompare(v: unknown): unknown {
  if (v === null || v === undefined || v === "") return null;
  if (Array.isArray(v)) {
    const arr = [...v].map(x => String(x)).sort();
    return arr.length === 0 ? null : arr.join("|");
  }
  return v;
}

/**
 * Compute the trait diff between the snapshot used for the previous generation
 * and the current traits. Empty when nothing meaningful changed.
 */
export function diffTraits(
  previous: Partial<AvatarTraits> | null | undefined,
  current: AvatarTraits,
): TraitDiff[] {
  if (!previous) return [];
  const out: TraitDiff[] = [];
  const allKeys = new Set<string>([...STRUCTURAL_TRAIT_KEYS, ...SOFT_TRAIT_KEYS] as string[]);
  for (const key of allKeys) {
    const before = normalizeForCompare((previous as any)[key]);
    const after = normalizeForCompare((current as any)[key]);
    if (before === after) continue;
    out.push({
      key,
      before: (previous as any)[key] ?? null,
      after: (current as any)[key] ?? null,
      structural: (STRUCTURAL_TRAIT_KEYS as string[]).includes(key),
      humanLabel: HUMAN_LABELS[key] ?? key,
    });
  }
  return out;
}

export function hasStructuralChange(diff: TraitDiff[]): boolean {
  return diff.some(d => d.structural);
}

// ---------------------------------------------------------------------------
// classifyDiff — assigns a severity level to a trait diff so the generation
// pipeline can choose between a light edit, a richer edit, or a forced full
// regeneration (with explicit operator confirmation).
//   - structural: at least one identity-defining attribute changed
//   - medium    : at least one identity-adjacent attribute changed
//   - light     : only soft cosmetic attributes changed
//   - none      : no diff
// ---------------------------------------------------------------------------
export type DiffLevel = "none" | "light" | "medium" | "structural";

export interface DiffClassification {
  level: DiffLevel;
  structuralKeys: string[];
  mediumKeys: string[];
  lightKeys: string[];
  humanLabels: string[];
}

export function classifyDiff(diff: TraitDiff[]): DiffClassification {
  const structuralSet = new Set<string>(STRUCTURAL_TRAIT_KEYS as string[]);
  const mediumSet = new Set<string>(MEDIUM_TRAIT_KEYS as string[]);
  const structuralKeys: string[] = [];
  const mediumKeys: string[] = [];
  const lightKeys: string[] = [];
  for (const d of diff) {
    if (structuralSet.has(d.key)) structuralKeys.push(d.key);
    else if (mediumSet.has(d.key)) mediumKeys.push(d.key);
    else lightKeys.push(d.key);
  }
  let level: DiffLevel = "none";
  if (structuralKeys.length) level = "structural";
  else if (mediumKeys.length) level = "medium";
  else if (lightKeys.length) level = "light";
  return {
    level,
    structuralKeys,
    mediumKeys,
    lightKeys,
    humanLabels: diff.map(d => d.humanLabel),
  };
}


