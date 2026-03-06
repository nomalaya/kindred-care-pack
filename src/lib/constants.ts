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

export const EMERGENCY_PACKS = [
  { id: "alimentaire", name: "Pack urgence alimentaire", amount: 5, icon: "🍞", description: "Produits alimentaires essentiels" },
  { id: "hygiene", name: "Pack hygiène", amount: 8, icon: "🧴", description: "Savon, dentifrice, protections" },
  { id: "bebe", name: "Pack bébé", amount: 10, icon: "👶", description: "Lait infantile, couches" },
] as const;

export type EmergencyPack = typeof EMERGENCY_PACKS[number];

export const IMPACT_METRICS = {
  products: { min: 6, max: 18 },
  meals: { min: 4, max: 10 },
  days: { min: 3, max: 7 },
} as const;
