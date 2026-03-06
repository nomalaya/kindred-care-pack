export const DONATION_TIERS = [
  { amount: 32, label: "Essentiel", description: "Nourriture & produits de base", tier: 1 },
  { amount: 45, label: "Essentiel + Hygiène", description: "Ajout de produits d'hygiène", tier: 2 },
  { amount: 60, label: "Confort", description: "Ajout d'articles de confort", tier: 3 },
  { amount: 75, label: "Famille+", description: "Extras pour toute la famille", tier: 4 },
] as const;

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

export const MIN_DONATION = 32;
export const MAX_DONATION = 75;
