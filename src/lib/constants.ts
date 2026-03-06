export const DONATION_TIERS = [
  { amount: 32, label: "Essential", description: "Basic food & essentials", tier: 1 },
  { amount: 45, label: "Essential + Hygiene", description: "Add hygiene products", tier: 2 },
  { amount: 60, label: "Comfort", description: "Add comfort items", tier: 3 },
  { amount: 75, label: "Family+", description: "Full family extras", tier: 4 },
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
  { key: "confirmed", label: "Donation confirmed", icon: "✓" },
  { key: "prepared", label: "Package prepared", icon: "📦" },
  { key: "shipped", label: "Package shipped", icon: "🚚" },
  { key: "delivered", label: "Package delivered", icon: "🎉" },
] as const;
