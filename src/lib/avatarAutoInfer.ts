// Moteur de pré-filtrage psychosocial pour Avatar Studio.
// Détecte des signaux fins (handicap, maladie, deuil, parentalité solo, exil…)
// dans short_story + emotional_sentence et déduit des attributs visuels et émotionnels.
// Les signaux médicaux priment toujours sur les signaux émotionnels positifs.

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

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const hasAny = (text: string, kws: string[]) => kws.some(k => text.includes(norm(k)));

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
};

const max = (a: number | undefined, b: number) => Math.max(a ?? 0, b);
const min = (a: number | undefined, b: number) => Math.min(a ?? 5, b);

export function inferStudioDefaults(b: InferInput): Record<string, unknown> {
  const rawText = `${b.short_story ?? ""} ${b.emotional_sentence ?? ""}`;
  const text = norm(rawText);
  const age = b.approx_age ?? 35;
  const children = b.children_count ?? 0;
  const urgency = b.urgency_level ?? 0;
  const culture = b.culture_tags ?? [];

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
  if (hasAny(text, KW.mobility_severe)) {
    mobility_aid = "wheelchair_electric";
    posture = "seated_dignified";
    fatigue = max(fatigue, 4);
    tired_level = max(tired_level, 3);
    expression = "tired_but_warm";
    brightness = min(brightness, 2);
  } else if (hasAny(text, KW.mobility_light)) {
    mobility_aid = age >= 65 ? "cane" : "crutches";
    posture = "seated_dignified";
    fatigue = max(fatigue, 2);
  }

  if (hasAny(text, KW.oxygen)) {
    mobility_aid = mobility_aid === "none" ? "oxygen_cannula" : mobility_aid;
    fatigue = max(fatigue, 3);
  } else if (hasAny(text, KW.arm_sling) && mobility_aid === "none") {
    mobility_aid = "arm_sling";
  } else if (hasAny(text, KW.bandage) && mobility_aid === "none") {
    mobility_aid = "visible_bandage";
  }

  if (hasAny(text, KW.illness_heavy)) {
    expression = expression === "calm" ? "tired_but_warm" : expression;
    fatigue = max(fatigue, 3);
    tired_level = max(tired_level, 3);
    brightness = min(brightness, 2);
    resilience = Math.max(resilience, 3);
  }

  // --- Deuil ---
  if (hasAny(text, KW.grief)) {
    expression = ["tired_but_warm", "serious_soft"].includes(expression)
      ? expression
      : "serious_soft";
    brightness = min(brightness, 2);
    resilience = Math.max(resilience, 3);
  }

  // --- Violence / exil ---
  if (hasAny(text, KW.violence_exile)) {
    if (expression === "calm") expression = "serious_soft";
    brightness = min(brightness, 2);
    resilience = 4;
  }

  // --- Parentalité ---
  if (b.beneficiary_category === "famille_enfants" || children > 0) {
    const solo = hasAny(text, KW.solo_parent);
    const tired = fatigue >= 3 || hasAny(text, ["fatigue", "epuis"]);
    parent_energy = solo || tired ? "tired_but_warm_parent" : "protective_parent";
    if (posture === "upright_calm") posture = "protective";
  }

  // --- Grossesse ---
  if (hasAny(text, KW.pregnant)) {
    clothing_style = "practical_warm";
    if (expression === "calm") expression = "hopeful";
  }

  // --- Isolement (uniquement si pas enfants) ---
  if (children === 0 && hasAny(text, KW.isolation) && expression === "calm") {
    expression = "pensive";
  }

  // --- Précarité logement ---
  if (hasAny(text, KW.precarity_housing)) {
    clothing_style = "practical_warm";
    fatigue = max(fatigue, 3);
    tired_level = max(tired_level, 2);
  }

  // --- Âge ---
  if (age >= 65) {
    if (posture === "upright_calm") posture = "seated_dignified";
    if (clothing_style === "casual_modest") clothing_style = "classic_simple";
  }
  if (hasAny(text, KW.elderly_fragile)) {
    if (mobility_aid === "none") mobility_aid = "cane";
    posture = "seated_dignified";
    fatigue = max(fatigue, 2);
  }

  // --- Résilience / espoir (n'efface jamais un signal médical) ---
  if (hasAny(text, KW.resilience)) {
    resilience = Math.max(resilience, 4);
    if (expression === "calm") expression = "resilient";
  } else if (hasAny(text, KW.positive) && expression === "calm") {
    expression = "gentle_smile";
    brightness = Math.max(brightness, 4);
  }

  // Modulations finales
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

  const result: Record<string, unknown> = {
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

  if (b.avatar_gender === "man") {
    result.avatar_beard = age >= 25 ? "light" : "none";
    result.avatar_moustache = "none";
    result.avatar_bald_level = age >= 60 ? 35 : age >= 45 ? 15 : 0;
    result.avatar_hair_recession = age >= 50 ? "moderate" : age >= 35 ? "light" : "none";
  }

  return result;
}
