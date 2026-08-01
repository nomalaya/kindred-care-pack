// sync
// Moteur de « remix » d'attributs avatar : casse l'effet clone créé par les
// defaults phénotypiques (une seule valeur par groupe + sexe) en piochant dans
// les plages crédibles du groupe.
//
// Garanties :
//  - déterministe par bénéficiaire (graine = hash de l'id) ;
//  - ne touche JAMAIS : genre, tranche d'âge, couvre-chef, culture_tags,
//    aides à la mobilité, niveaux psychosociaux ;
//  - ne touche jamais un champ déduit d'un signal explicite (note privée, récit) ;
//  - toute valeur produite est validée par enforcePhenotypeCoherence.

import { detectCountryGroup, type GroupKey } from "./countryPhenotypes";
import {
  PHENOTYPE_RANGES,
  HAIR_STYLE_BY_TYPE,
  HAIR_STYLE_BY_GROUP,
  HAIR_TYPE_LOCKED_VALUES,
  SKIN_TONE_SCALE,
  enforcePhenotypeCoherence,
} from "./phenotypeRanges";

import { inferStudioDefaultsWithReasons } from "./avatarAutoInfer";

/** Champs strictement intouchables. */
export const REMIX_NEVER = [
  "avatar_gender",
  "avatar_age_range",
  "avatar_head_covering",
  "culture_tags",
  "avatar_mobility_aid",
  "avatar_fatigue_level",
  "avatar_tired_level",
  "avatar_emotional_brightness",
  "avatar_resilience_level",
  "avatar_dignity_level",
  "avatar_parent_energy",
  "avatar_beard",
  "avatar_moustache",
  "avatar_bald_level",
  "avatar_hair_recession",
] as const;

/** Signaux dont la déduction est prioritaire sur le remix. */
const WEAK_SIGNALS = new Set(["country_phenotype", "age_known", "name_known"]);

const CLOTHING_STYLES = [
  "casual_modest", "simple_layered", "practical_warm",
  "classic_simple", "soft_cardigan", "modest_warm",
];
const CLOTHING_PALETTES = [
  "warm_earth", "muted_neutral", "soft_jewel", "sand_ivory", "dusty_blue",
];
const HAIR_LENGTHS_F = ["short", "shoulder", "medium", "long"];
const HAIR_LENGTHS_M = ["very_short", "short", "medium"];
const NEUTRAL_EXPRESSIONS = [
  "calm", "gentle_smile", "discreet_smile", "thoughtful", "reserved", "resilient",
];
const NEUTRAL_POSTURES = ["upright_calm", "leaning_slightly", "relaxed"];
const FEATURE_POOL = [
  "subtle_age_lines", "gentle_wrinkles", "light_freckles",
  "soft_dimples", "expressive_brows",
];

const CULTURE_TAG_TO_GROUP: Record<string, GroupKey> = {
  europe_nord: "north_european",
  mediterranee: "mediterranean",
  maghreb: "mena",
  moyen_orient: "mena",
  afrique_subsaharienne: "sub_saharan_africa",
  afrique_ouest: "sub_saharan_africa",
  est_asie: "east_asian",
  sud_asie: "south_asian",
};

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** PRNG déterministe (mulberry32). */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length) % arr.length];

/** Détermine le groupe phénotypique d'un bénéficiaire. */
export function resolveGroup(b: any): GroupKey | null {
  const text = [b?.avatar_private_notes, b?.short_story, b?.emotional_sentence]
    .filter(Boolean).join(" ");
  const hit = detectCountryGroup(text);
  if (hit) return hit.group;

  const tags: string[] = Array.isArray(b?.culture_tags) ? b.culture_tags : [];
  for (const t of tags) {
    if (CULTURE_TAG_TO_GROUP[t]) return CULTURE_TAG_TO_GROUP[t];
  }

  // Dernier recours : déduction depuis les traits déjà enregistrés.
  const skin = b?.avatar_skin_tone;
  const hair = b?.avatar_hair_type;
  if (hair === "coily" || ["deep", "dark"].includes(skin)) return "sub_saharan_africa";
  if (hair === "straight" && b?.avatar_eye_shape === "narrow") return "east_asian";
  if (["olive", "tan", "medium_dark"].includes(skin)) return "mena";
  if (["fair", "light"].includes(skin)) return "north_european";
  return null;
}

export interface RemixResult {
  /** Champs à écrire (uniquement ceux qui changent). */
  patch: Record<string, any>;
  group: GroupKey | null;
  /** Champs volontairement laissés intacts (signal explicite). */
  protectedFields: string[];
}

export function remixAttributes(b: any): RemixResult {
  const rng = makeRng(hashSeed(String(b?.id ?? b?.alias_first_name ?? "seed")));
  const seedIdx = hashSeed(String(b?.id ?? "seed")) % 97;
  const group = resolveGroup(b);
  const range = group ? PHENOTYPE_RANGES[group] : null;

  // Champs protégés : déduits d'un signal fort (récit / note privée).
  const { reasons } = inferStudioDefaultsWithReasons(b);
  const protectedFields = Object.entries(reasons)
    .filter(([, rs]) => rs.some(r => !WEAK_SIGNALS.has(r.signal)))
    .map(([f]) => f);
  const isProtected = (f: string) =>
    (REMIX_NEVER as readonly string[]).includes(f) || protectedFields.includes(f);

  const next: Record<string, any> = {};
  const set = (field: string, value: any) => {
    if (isProtected(field) || value == null) return;
    next[field] = value;
  };

  // --- Traits phénotypiques : uniquement dans la plage du groupe ---
  if (range) {
    // peau : ±1 cran autour de la valeur actuelle, borné à la plage du groupe
    const cur = b?.avatar_skin_tone;
    const idx = SKIN_TONE_SCALE.indexOf(cur);
    let skinChoices = range.skin_tone;
    if (idx >= 0) {
      const window = SKIN_TONE_SCALE.slice(Math.max(0, idx - 1), idx + 2);
      const inRange = window.filter(v => range.skin_tone.includes(v));
      if (inRange.length) skinChoices = inRange;
    }
    set("avatar_skin_tone", pick(rng, skinChoices));
    set("avatar_eye_color", pick(rng, range.eye_color));
    set("avatar_eye_shape", pick(rng, range.eye_shape));
    set("avatar_hair_type", pick(rng, range.hair_type));
    set("avatar_hair_color", pick(rng, range.hair_color));
    set("avatar_hair_volume", pick(rng, range.hair_volume));
    set("avatar_nose", pick(rng, range.nose));
    set("avatar_face_shape", pick(rng, range.face_shape));
  } else {
    // sans groupe identifié : seuls les champs neutres varient
    set("avatar_face_shape", pick(rng, ["oval", "round", "square_soft", "heart", "long"]));
  }

  // --- Cheveux : longueur + coiffure cohérentes ---
  const gender = b?.avatar_gender;
  const lengths = gender === "man" ? HAIR_LENGTHS_M : HAIR_LENGTHS_F;
  set("avatar_hair_length", pick(rng, lengths));
  const hairType = next.avatar_hair_type ?? b?.avatar_hair_type ?? "straight";
  const styles = HAIR_STYLE_BY_TYPE[hairType] ?? HAIR_STYLE_BY_TYPE.straight;
  set("avatar_hair_style", pick(rng, styles));

  // --- Morphologie & vêtements ---
  set("avatar_body_type", pick(rng, ["thin", "average", "average", "chubby"]));
  set("avatar_clothing_style", pick(rng, CLOTHING_STYLES));
  set("avatar_clothing_color_palette", pick(rng, CLOTHING_PALETTES));

  // --- Traits du visage : 0 à 2 marqueurs ---
  const existingFeatures: string[] = Array.isArray(b?.avatar_facial_features)
    ? b.avatar_facial_features : [];
  const keepGlasses = existingFeatures.includes("glasses") ? ["glasses"] : [];
  const nbFeatures = Math.floor(rng() * 3);
  const shuffled = [...FEATURE_POOL].sort(() => rng() - 0.5);
  set("avatar_facial_features", [...keepGlasses, ...shuffled.slice(0, nbFeatures)]);

  // --- Expression / posture : variation légère et neutre ---
  set("avatar_expression", pick(rng, NEUTRAL_EXPRESSIONS));
  set("avatar_posture", pick(rng, NEUTRAL_POSTURES));

  // --- Validation de cohérence (bloquante) ---
  const merged = {
    ...next,
    avatar_head_covering: b?.avatar_head_covering,
    avatar_age_range: b?.avatar_age_range,
  };
  const coherent = enforcePhenotypeCoherence(
    merged,
    { head_covering: b?.avatar_head_covering, age_range: b?.avatar_age_range, group },
    seedIdx,
  );

  const patch: Record<string, any> = {};
  for (const key of Object.keys(next)) {
    const val = coherent[key] ?? next[key];
    if (isProtected(key)) continue;
    const cur = b?.[key];
    const same = Array.isArray(val) && Array.isArray(cur)
      ? JSON.stringify([...val].sort()) === JSON.stringify([...cur].sort())
      : val === cur;
    if (!same) patch[key] = val;
  }

  return { patch, group, protectedFields };
}
