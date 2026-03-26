export const DONATION_TIERS = [
  { amount: 20, label: "Essentiel", description: "Nourriture & produits de base", tier: 1 },
  { amount: 35, label: "Essentiel + Hygiène", description: "Ajout de produits d'hygiène", tier: 2 },
  { amount: 50, label: "Confort", description: "Ajout d'articles de confort", tier: 3 },
  { amount: 75, label: "Famille+", description: "Extras pour toute la famille", tier: 4 },
] as const;

export const DONATION_STEPS = [20, 35, 50, 75, 100] as const;
export const DEFAULT_DONATION = 35;
export const STEP_INCREMENT = 25;

export const CAUSE_ICONS: Record<string, string> = {
  Baby: "👶",
  Heart: "💜",
  GraduationCap: "🎓",
  HandHeart: "🤝",
  Briefcase: "💼",
  Stethoscope: "🩺",
};

export const DELIVERY_STATUSES = [
  { key: "confirmed", label: "Don confirmé", icon: "✓" },
  { key: "prepared", label: "Colis préparé", icon: "📦" },
  { key: "shipped", label: "Colis expédié", icon: "🚚" },
  { key: "delivered", label: "Colis livré", icon: "🎉" },
] as const;

export const TAX_DEDUCTION_RATE = 0.66;

export const MIN_DONATION = 20;
export const MAX_DONATION = 150;

export interface UpsellOption {
  id: string;
  amount: number;
  icon: string;
  description: string;
}

export const UPSELL_MATRIX: Record<number, UpsellOption[]> = {
  20: [
    { id: "u1", amount: 10, icon: "🍞", description: "Produits alimentaires essentiels" },
    { id: "u2", amount: 20, icon: "🧴", description: "Pack hygiène & alimentaire" },
  ],
  35: [
    { id: "u1", amount: 5, icon: "🍞", description: "Produits de première nécessité" },
    { id: "u2", amount: 15, icon: "🧴", description: "Pack hygiène complet" },
    { id: "u3", amount: 25, icon: "👶", description: "Pack famille & bien-être" },
  ],
  50: [
    { id: "u1", amount: 10, icon: "🍞", description: "Produits alimentaires essentiels" },
    { id: "u2", amount: 20, icon: "🧴", description: "Pack hygiène & confort" },
    { id: "u3", amount: 30, icon: "👶", description: "Pack famille complet" },
  ],
  75: [
    { id: "u1", amount: 5, icon: "🍞", description: "Produits de première nécessité" },
    { id: "u2", amount: 15, icon: "🧴", description: "Pack hygiène complet" },
    { id: "u3", amount: 25, icon: "👶", description: "Pack famille & bien-être" },
  ],
  100: [
    { id: "u1", amount: 10, icon: "🍞", description: "Produits alimentaires essentiels" },
    { id: "u2", amount: 20, icon: "🧴", description: "Pack hygiène & confort" },
    { id: "u3", amount: 30, icon: "👶", description: "Pack famille complet" },
  ],
};

/** Get upsell options for any donation amount. Falls back to nearest lower tier. */
export function getUpsellsForAmount(amount: number): UpsellOption[] {
  if (UPSELL_MATRIX[amount]) return UPSELL_MATRIX[amount];
  // For amounts above 100 (125, 150), use same pattern as 100
  const tiers = Object.keys(UPSELL_MATRIX).map(Number).sort((a, b) => b - a);
  const nearest = tiers.find((t) => t <= amount) || tiers[tiers.length - 1];
  // Adjust amounts so totals end in 0
  const base = UPSELL_MATRIX[nearest];
  return base.map((opt) => {
    const remainder = (amount + opt.amount) % 10;
    const adjusted = remainder === 0 ? opt.amount : opt.amount + (10 - remainder);
    return { ...opt, amount: adjusted };
  });
}

export const CAUSE_KEY_MAP: Record<string, string> = {
  "Aider un enfant en aidant sa famille": "child_family",
  "Aider une femme à se reconstruire": "women_recovery",
  "Donner sa chance à un étudiant": "student",
  "Soutenir une personne âgée": "elderly",
  "Aider un travailleur en difficulté": "working_poor",
  "Soutenir face à la maladie": "health_disability",
};

