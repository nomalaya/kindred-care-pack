// Contextual upsell descriptions per cause key
export const UPSELL_DESCRIPTIONS_BY_CAUSE: Record<string, { u1: string; u2: string; u3?: string }> = {
  child_family: {
    u1: "Goûters et petits pots pour les enfants",
    u2: "Pack couches, lait et soins bébé",
    u3: "Vêtements et jouets pour toute la famille",
  },
  women_recovery: {
    u1: "Kit bien-être et produits de soin",
    u2: "Pack hygiène et réconfort",
    u3: "Vêtements et articles de reconstruction",
  },
  student: {
    u1: "Fournitures et snacks pour réviser",
    u2: "Pack repas complets pour la semaine",
    u3: "Kit autonomie : entretien et hygiène",
  },
  elderly: {
    u1: "Thé, biscuits et petites douceurs",
    u2: "Pack santé et hygiène adaptée",
    u3: "Repas complets et produits d'entretien",
  },
  working_poor: {
    u1: "Repas rapides pour la semaine",
    u2: "Pack hygiène et entretien du logement",
    u3: "Kit autonomie et produits essentiels",
  },
  health_disability: {
    u1: "Alimentation adaptée et réconfort",
    u2: "Pack santé, hygiène et bien-être",
    u3: "Repas complets et soins de convalescence",
  },
};

export function getContextualUpsellDescription(
  causeKey: string,
  optionId: string,
  fallback: string
): string {
  const descriptions = UPSELL_DESCRIPTIONS_BY_CAUSE[causeKey];
  if (!descriptions) return fallback;

  const key = optionId as keyof typeof descriptions;
  return descriptions[key] || fallback;
}
