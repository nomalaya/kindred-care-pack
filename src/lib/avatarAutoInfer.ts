// Lightweight frontend inference of avatar attributes from beneficiary profile.
// Pre-fills the Avatar Studio editor. Mirrors the heuristics used server-side
// in supabase/functions/_shared/avatarTraits.ts (without phenotype randomness).

interface InferInput {
  approx_age?: number | null;
  avatar_gender?: string | null;
  beneficiary_category?: string | null;
  profile_type?: string | null;
  children_count?: number | null;
  urgency_level?: number | null;
  short_story?: string | null;
  emotional_sentence?: string | null;
  culture_tags?: string[] | null;
}

const TIRED_KW = ["fatigue", "épuis", "lourd", "difficile", "épreuv", "seul", "isolé"];
const RESILIENT_KW = ["combat", "tenir", "courage", "résist", "avancer"];
const POSITIVE_KW = ["espoir", "sourire", "joie", "soulagement", "famille", "fierté"];
const SERIOUS_KW = ["perte", "décès", "deuil", "violence", "exil", "guerre", "maladie"];

function matchAny(text: string, kws: string[]) {
  const t = text.toLowerCase();
  return kws.some(k => t.includes(k));
}

export function inferStudioDefaults(b: InferInput): Record<string, unknown> {
  const text = `${b.short_story ?? ""} ${b.emotional_sentence ?? ""}`;
  const age = b.approx_age ?? 35;
  const children = b.children_count ?? 0;
  const urgency = b.urgency_level ?? 0;
  const culture = b.culture_tags ?? [];

  let expression = "calm";
  if (matchAny(text, SERIOUS_KW)) expression = "serious_soft";
  else if (matchAny(text, TIRED_KW)) expression = "tired_but_warm";
  else if (matchAny(text, RESILIENT_KW)) expression = "resilient";
  else if (matchAny(text, POSITIVE_KW)) expression = "gentle_smile";

  let posture = "upright_calm";
  if (b.beneficiary_category === "famille_enfants") posture = "protective";
  else if (age >= 65) posture = "seated_dignified";

  let parent_energy = "none";
  if (b.beneficiary_category === "famille_enfants" || children > 0) {
    parent_energy = matchAny(text, TIRED_KW) ? "tired_but_warm_parent" : "protective_parent";
  }

  // Fatigue: combines text signals, children count and urgency
  let fatigue = 0;
  if (matchAny(text, TIRED_KW)) fatigue += 2;
  if (children >= 3) fatigue += 1;
  if (urgency >= 2) fatigue += 1;
  if (age >= 65) fatigue += 1;
  fatigue = Math.min(5, fatigue);

  // Tired eyes mirror fatigue lightly
  const tired_level = Math.min(5, Math.round(fatigue * 0.8));

  // Emotional brightness — lower when serious / tired
  let brightness = 3;
  if (expression === "serious_soft" || expression === "tired_but_warm") brightness = 2;
  if (expression === "gentle_smile" || expression === "hopeful") brightness = 4;

  // Resilience inversely indexed on urgency
  const resilience = Math.max(1, 4 - Math.floor(urgency));

  // Cultural defaults
  let head_covering = "none";
  if (culture.some(t => ["maghreb", "moyen_orient", "afrique_ouest"].includes(t))) {
    head_covering = b.avatar_gender === "woman" ? "optional" : "none";
  }

  // Clothing
  let clothing_style = "casual_modest";
  if (age >= 65) clothing_style = "classic_simple";
  else if (b.beneficiary_category === "famille_enfants") clothing_style = "practical_warm";
  if (head_covering === "required") clothing_style = "modest_warm";

  // Male attributes — set only if gender = man
  const result: Record<string, unknown> = {
    avatar_expression: expression,
    avatar_posture: posture,
    avatar_parent_energy: parent_energy,
    avatar_fatigue_level: fatigue,
    avatar_tired_level: tired_level,
    avatar_emotional_brightness: brightness,
    avatar_resilience_level: resilience,
    avatar_dignity_level: 5,
    avatar_head_covering: head_covering,
    avatar_clothing_style: clothing_style,
  };

  if (b.avatar_gender === "man") {
    result.avatar_beard = age >= 25 ? "light" : "none";
    result.avatar_moustache = "none";
    result.avatar_bald_level = age >= 60 ? 35 : age >= 45 ? 15 : 0;
    result.avatar_hair_recession = age >= 50 ? "moderate" : age >= 35 ? "light" : "none";
  }

  return result;
}
