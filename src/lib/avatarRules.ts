// Suggestive rule engine for Avatar Studio.
// Returns non-blocking warnings (except dignity_level < 3 which is blocking).

export type RuleSeverity = "info" | "warning" | "error";

export interface RuleWarning {
  id: string;
  severity: RuleSeverity;
  section: "face" | "eyes" | "hair" | "male" | "cultural" | "clothing" | "posture" | "social";
  message: string;
  suggestion?: Record<string, unknown>;
  suggestionLabel?: string;
}

interface RuleInput {
  approx_age?: number | null;
  avatar_gender?: string | null;
  avatar_hair_color?: string | null;
  avatar_bald_level?: number | null;
  avatar_beard?: string | null;
  avatar_head_covering?: string | null;
  avatar_clothing_style?: string | null;
  avatar_fatigue_level?: number | null;
  avatar_dignity_level?: number | null;
  children_count?: number | null;
  culture_tags?: string[] | null;
}

export function evaluateAvatarRules(b: RuleInput): RuleWarning[] {
  const warnings: RuleWarning[] = [];
  const age = b.approx_age ?? 0;
  const culture = b.culture_tags ?? [];

  if (age > 50 && b.avatar_hair_color && !["gray", "white"].includes(b.avatar_hair_color)) {
    warnings.push({
      id: "age_hair_gray",
      severity: "info",
      section: "hair",
      message: `À ${age} ans, des cheveux grisonnants seraient plus cohérents.`,
      suggestion: { avatar_hair_color: "gray" },
      suggestionLabel: "Passer en gris",
    });
  }

  if (b.avatar_gender === "man" && age > 60 && (b.avatar_bald_level ?? 0) < 20) {
    warnings.push({
      id: "age_baldness",
      severity: "info",
      section: "male",
      message: "Une calvitie partielle serait statistiquement réaliste à cet âge.",
      suggestion: { avatar_bald_level: 35 },
      suggestionLabel: "Appliquer 35%",
    });
  }

  if (b.avatar_gender === "man" && age > 25 && b.avatar_beard === "none") {
    warnings.push({
      id: "male_beard",
      severity: "info",
      section: "male",
      message: "Environ 1 homme adulte sur 2 porte une barbe en France.",
      suggestion: { avatar_beard: "light" },
      suggestionLabel: "Ajouter barbe légère",
    });
  }

  if ((b.children_count ?? 0) >= 3 && (b.avatar_fatigue_level ?? 0) < 2) {
    warnings.push({
      id: "many_children_fatigue",
      severity: "warning",
      section: "social",
      message: `${b.children_count} enfants : un niveau de fatigue visible améliorerait la cohérence émotionnelle.`,
      suggestion: { avatar_fatigue_level: 3 },
      suggestionLabel: "Régler à 3",
    });
  }

  if (
    culture.some(t => ["maghreb", "moyen_orient"].includes(t)) &&
    b.avatar_head_covering === "required" &&
    b.avatar_clothing_style === "casual_modest"
  ) {
    warnings.push({
      id: "cultural_clothing_pairing",
      severity: "info",
      section: "clothing",
      message: "Avec un couvre-chef requis, un style « modest_warm » sera plus cohérent.",
      suggestion: { avatar_clothing_style: "modest_warm" },
      suggestionLabel: "Passer en modest_warm",
    });
  }

  if ((b.avatar_dignity_level ?? 5) < 3) {
    warnings.push({
      id: "dignity_too_low",
      severity: "error",
      section: "social",
      message: "Le niveau de dignité ne peut pas descendre sous 3. La génération sera bloquée.",
    });
  }

  return warnings;
}
