// Moteur de pré-filtrage psychosocial pour Avatar Studio.
// Détecte des signaux fins (handicap, maladie, deuil, parentalité solo, exil…)
// dans short_story + emotional_sentence et déduit des attributs visuels et émotionnels.
// Les signaux médicaux priment toujours sur les signaux émotionnels positifs.
import { mapApproxAgeToVocab } from "./avatarAgeRange";
import { inferGenderFromName } from "./genderFromName";


export interface InferInput {
  approx_age?: number | null;
  avatar_gender?: string | null;
  avatar_age_range?: string | null;
  real_first_name?: string | null;
  alias_first_name?: string | null;
  beneficiary_category?: string | null;
  profile_type?: string | null;
  children_count?: number | null;
  urgency_level?: number | null;
  short_story?: string | null;
  emotional_sentence?: string | null;
  culture_tags?: string[] | null;
}

export interface FieldReason {
  signal: string;
  signalLabel: string;
  keyword: string;
}

export interface InferenceResult {
  values: Record<string, unknown>;
  reasons: Record<string, FieldReason[]>;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// --- Dictionnaires de signaux (FR, normalisés sans accents) ---
const KW = {
  mobility_severe: [
    "fauteuil roulant", "sclerose en plaques", "sclerose",
    "paraplegie", "paraplegique", "tetraplegie", "tetraplegique",
    "hemiplegie", "hemiplegique", "ne peut plus marcher",
    "perte de mobilite", "ne marche plus", "alite",
  ],
  mobility_light: [
    "canne", "bequille", "bequilles", "deambulateur",
    "marche difficilement", "problemes de hanche", "prothese",
    "arthrose severe", "boite", "mal a marcher",
  ],
  bandage: ["pansement", "bandage", "platre", "attelle"],
  arm_sling: ["echarpe au bras", "bras casse", "bras en echarpe"],
  oxygen: ["oxygene", "bouteille d'oxygene", "insuffisance respiratoire"],
  illness_heavy: [
    "cancer", "tumeur", "chimio", "chimiotherapie", "radiotherapie",
    "dialyse", "leucemie", "vih", "sida",
    "maladie grave", "maladie chronique", "traitement lourd",
    "hospitalise", "hopital", "douleur qui", "douleur chronique",
    "fibromyalgie", "lupus", "parkinson", "alzheimer",
  ],
  grief: [
    "deces", "decede", "decedee", "mort", "perdu son", "perdu sa",
    "veuve", "veuf", "orphelin", "enterrement", "deuil",
  ],
  violence_exile: [
    "violence", "violences conjugales", "battue", "agressee",
    "fui", "fuit", "guerre", "exil", "refugie", "refugiee",
    "demandeur d'asile", "demandeuse d'asile",
  ],
  solo_parent: [
    "seule avec ses enfants", "seul avec ses enfants",
    "eleve seule", "eleve seul", "mere celibataire", "pere celibataire",
    "mari decede", "femme decedee", "abandonnee",
  ],
  pregnant: ["enceinte", "grossesse", "attend un enfant", "attend un bebe"],
  isolation: ["seul", "seule", "isole", "isolee", "personne pour", "n'a personne"],
  precarity_housing: [
    "sdf", "sans domicile", "sans abri", "vit dans la rue",
    "hebergement d'urgence", "centre d'hebergement", "squat",
  ],
  elderly_fragile: [
    "tres age", "tres agee", "perte d'autonomie", "dependance",
    "epad", "ehpad", "maison de retraite",
  ],
  resilience: [
    "se bat", "je me bats", "tient bon", "courage", "garde espoir",
    "avenir", "ne lache rien", "resiste", "avance malgre",
  ],
  positive: [
    "espoir", "sourire", "joie", "soulagement", "reconnaissance",
    "fierte", "famille unie",
  ],
} as const;

export const SIGNAL_LABELS: Record<keyof typeof KW, string> = {
  mobility_severe: "Mobilité lourde",
  mobility_light: "Mobilité réduite",
  bandage: "Bandage / plâtre",
  arm_sling: "Bras en écharpe",
  oxygen: "Oxygène / respiratoire",
  illness_heavy: "Maladie grave",
  grief: "Deuil",
  violence_exile: "Violence / exil",
  solo_parent: "Parent isolé",
  pregnant: "Grossesse",
  isolation: "Isolement",
  precarity_housing: "Précarité logement",
  elderly_fragile: "Grand âge fragile",
  resilience: "Résilience",
  positive: "Émotion positive",
};

type SignalKey = keyof typeof KW;

// Renvoie le 1er mot-clé matché, ou null
const firstMatch = (text: string, signal: SignalKey): string | null => {
  for (const k of KW[signal]) {
    if (text.includes(norm(k))) return k;
  }
  return null;
};

const max = (a: number | undefined, b: number) => Math.max(a ?? 0, b);
const min = (a: number | undefined, b: number) => Math.min(a ?? 5, b);

export function inferStudioDefaultsWithReasons(b: InferInput): InferenceResult {
  const rawText = `${b.short_story ?? ""} ${b.emotional_sentence ?? ""}`;
  const text = norm(rawText);
  const age = b.approx_age ?? 35;
  const children = b.children_count ?? 0;
  const urgency = b.urgency_level ?? 0;
  const culture = b.culture_tags ?? [];

  // Détection des signaux (une seule fois)
  const matched: Partial<Record<SignalKey, string>> = {};
  (Object.keys(KW) as SignalKey[]).forEach(sig => {
    const kw = firstMatch(text, sig);
    if (kw) matched[sig] = kw;
  });

  const reasons: Record<string, FieldReason[]> = {};
  const addReason = (field: string, sig: SignalKey) => {
    const kw = matched[sig];
    if (!kw) return;
    reasons[field] = reasons[field] || [];
    if (!reasons[field].some(r => r.signal === sig)) {
      reasons[field].push({ signal: sig, signalLabel: SIGNAL_LABELS[sig], keyword: kw });
    }
  };

  // Valeurs cumulatives
  let expression = "calm";
  let posture = "upright_calm";
  let parent_energy: string = "none";
  let mobility_aid = "none";
  let fatigue = 0;
  let tired_level = 0;
  let brightness = 3;
  let resilience = Math.max(1, 4 - Math.floor(urgency));
  let clothing_style = "casual_modest";

  // --- Signaux médicaux / handicap (priorité maximale) ---
  if (matched.mobility_severe) {
    mobility_aid = "wheelchair_electric";
    posture = "seated_dignified";
    fatigue = max(fatigue, 4);
    tired_level = max(tired_level, 3);
    expression = "tired_but_warm";
    brightness = min(brightness, 2);
    ["avatar_mobility_aid", "avatar_posture", "avatar_fatigue_level", "avatar_tired_level", "avatar_expression", "avatar_emotional_brightness"]
      .forEach(f => addReason(f, "mobility_severe"));
  } else if (matched.mobility_light) {
    mobility_aid = age >= 65 ? "cane" : "crutches";
    posture = "seated_dignified";
    fatigue = max(fatigue, 2);
    ["avatar_mobility_aid", "avatar_posture", "avatar_fatigue_level"].forEach(f => addReason(f, "mobility_light"));
  }

  if (matched.oxygen) {
    if (mobility_aid === "none") mobility_aid = "oxygen_cannula";
    fatigue = max(fatigue, 3);
    addReason("avatar_mobility_aid", "oxygen");
    addReason("avatar_fatigue_level", "oxygen");
  } else if (matched.arm_sling && mobility_aid === "none") {
    mobility_aid = "arm_sling";
    addReason("avatar_mobility_aid", "arm_sling");
  } else if (matched.bandage && mobility_aid === "none") {
    mobility_aid = "visible_bandage";
    addReason("avatar_mobility_aid", "bandage");
  }

  if (matched.illness_heavy) {
    expression = expression === "calm" ? "tired_but_warm" : expression;
    fatigue = max(fatigue, 3);
    tired_level = max(tired_level, 3);
    brightness = min(brightness, 2);
    resilience = Math.max(resilience, 3);
    ["avatar_expression", "avatar_fatigue_level", "avatar_tired_level", "avatar_emotional_brightness", "avatar_resilience_level"]
      .forEach(f => addReason(f, "illness_heavy"));
  }

  // --- Deuil ---
  if (matched.grief) {
    expression = ["tired_but_warm", "serious_soft"].includes(expression) ? expression : "serious_soft";
    brightness = min(brightness, 2);
    resilience = Math.max(resilience, 3);
    ["avatar_expression", "avatar_emotional_brightness", "avatar_resilience_level"].forEach(f => addReason(f, "grief"));
  }

  // --- Violence / exil ---
  if (matched.violence_exile) {
    if (expression === "calm") expression = "serious_soft";
    brightness = min(brightness, 2);
    resilience = 4;
    ["avatar_expression", "avatar_emotional_brightness", "avatar_resilience_level"].forEach(f => addReason(f, "violence_exile"));
  }

  // --- Parentalité ---
  if (b.beneficiary_category === "famille_enfants" || children > 0) {
    const solo = !!matched.solo_parent;
    const tired = fatigue >= 3 || text.includes("fatigue") || text.includes("epuis");
    parent_energy = solo || tired ? "tired_but_warm_parent" : "protective_parent";
    if (posture === "upright_calm") posture = "protective";
    if (solo) {
      addReason("avatar_parent_energy", "solo_parent");
      addReason("avatar_posture", "solo_parent");
    }
  }

  // --- Grossesse ---
  if (matched.pregnant) {
    clothing_style = "practical_warm";
    if (expression === "calm") expression = "hopeful";
    addReason("avatar_clothing_style", "pregnant");
    addReason("avatar_expression", "pregnant");
  }

  // --- Isolement ---
  if (children === 0 && matched.isolation && expression === "calm") {
    expression = "pensive";
    addReason("avatar_expression", "isolation");
  }

  // --- Précarité logement ---
  if (matched.precarity_housing) {
    clothing_style = "practical_warm";
    fatigue = max(fatigue, 3);
    tired_level = max(tired_level, 2);
    ["avatar_clothing_style", "avatar_fatigue_level", "avatar_tired_level"].forEach(f => addReason(f, "precarity_housing"));
  }

  // --- Âge ---
  if (age >= 65) {
    if (posture === "upright_calm") posture = "seated_dignified";
    if (clothing_style === "casual_modest") clothing_style = "classic_simple";
  }
  if (matched.elderly_fragile) {
    if (mobility_aid === "none") mobility_aid = "cane";
    posture = "seated_dignified";
    fatigue = max(fatigue, 2);
    ["avatar_mobility_aid", "avatar_posture", "avatar_fatigue_level"].forEach(f => addReason(f, "elderly_fragile"));
  }

  // --- Résilience / espoir ---
  if (matched.resilience) {
    resilience = Math.max(resilience, 4);
    if (expression === "calm") expression = "resilient";
    addReason("avatar_resilience_level", "resilience");
    if (expression === "resilient") addReason("avatar_expression", "resilience");
  } else if (matched.positive && expression === "calm") {
    expression = "gentle_smile";
    brightness = Math.max(brightness, 4);
    addReason("avatar_expression", "positive");
    addReason("avatar_emotional_brightness", "positive");
  }

  if (children >= 3) fatigue = max(fatigue, fatigue + 1);
  fatigue = Math.min(5, fatigue);
  tired_level = Math.min(5, Math.max(tired_level, Math.round(fatigue * 0.7)));

  // Couvre-chef culturel
  let head_covering = "none";
  if (
    culture.some(t => ["maghreb", "moyen_orient", "afrique_ouest"].includes(t)) &&
    b.avatar_gender === "woman"
  ) {
    head_covering = "optional";
  }
  if (head_covering !== "none" && clothing_style === "casual_modest") {
    clothing_style = "modest_warm";
  }

  const values: Record<string, unknown> = {
    avatar_expression: expression,
    avatar_posture: posture,
    avatar_parent_energy: parent_energy,
    avatar_mobility_aid: mobility_aid,
    avatar_fatigue_level: fatigue,
    avatar_tired_level: tired_level,
    avatar_emotional_brightness: brightness,
    avatar_resilience_level: resilience,
    avatar_dignity_level: 5,
    avatar_head_covering: head_covering,
    avatar_clothing_style: clothing_style,
  };

  // --- Pré-remplissage genre + tranche d'âge depuis prénom/age ---
  const ageRange = mapApproxAgeToVocab(b.approx_age ?? null);
  if (ageRange) {
    values.avatar_age_range = ageRange;
    reasons.avatar_age_range = [{
      signal: "age_known",
      signalLabel: "Âge connu",
      keyword: String(b.approx_age),
    }];
  }
  const { gender: inferredGender, matchedName } = inferGenderFromName(
    b.real_first_name, b.alias_first_name,
  );
  const effectiveGender = b.avatar_gender ?? inferredGender;
  if (inferredGender) {
    values.avatar_gender = inferredGender;
    if (matchedName) {
      reasons.avatar_gender = [{
        signal: "name_known",
        signalLabel: "Prénom",
        keyword: matchedName,
      }];
    }
  }

  if (effectiveGender === "man") {
    values.avatar_beard = age >= 25 ? "light" : "none";
    values.avatar_moustache = "none";
    values.avatar_bald_level = age >= 60 ? 35 : age >= 45 ? 15 : 0;
    values.avatar_hair_recession = age >= 50 ? "moderate" : age >= 35 ? "light" : "none";
  }

  return { values, reasons };
}

// Backward-compatible wrapper
export function inferStudioDefaults(b: InferInput): Record<string, unknown> {
  return inferStudioDefaultsWithReasons(b).values;
}
