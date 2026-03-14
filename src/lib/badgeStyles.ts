/**
 * Badge styling system for beneficiary context badges.
 *
 * Centralized here so BeneficiarySelection and DonationFlow share
 * the same visual logic. Colors use high-contrast pairings.
 */

// ─── Badge text/border/bg styles ─────────────────────────

export const BADGE_STYLES: Record<string, string> = {
  // Proximity — emerald
  "Proche de chez vous":                "border-emerald-500/40 text-emerald-700 bg-emerald-100",
  "Dans votre département":             "border-emerald-500/40 text-emerald-700 bg-emerald-100",
  "Dans votre région":                  "border-emerald-500/40 text-emerald-700 bg-emerald-100",
  "Dans votre pays":                    "border-emerald-500/40 text-emerald-700 bg-emerald-100",
  // New beneficiary — blue
  "Nouveau bénéficiaire inscrit":       "border-blue-500/40 text-blue-700 bg-blue-100",
  // Housing — amber
  "Logement provisoire":                "border-amber-500/40 text-amber-800 bg-amber-100",
  // Legal / Admin — indigo
  "Démarches juridiques en cours":      "border-indigo-500/40 text-indigo-700 bg-indigo-100",
  "Démarches administratives en cours": "border-indigo-500/40 text-indigo-700 bg-indigo-100",
  // Far from family — fuchsia
  "Très loin de sa famille":            "border-fuchsia-500/40 text-fuchsia-700 bg-fuchsia-100",
  // Medical desert — red
  "Désert médical":                     "border-red-500/40 text-red-700 bg-red-100",
  // Rural — teal
  "Zone rurale isolée":                 "border-teal-500/40 text-teal-800 bg-teal-100",
  // Inflation — slate
  "Impact de l'inflation":              "border-slate-400/40 text-slate-700 bg-slate-100",
  // New trade — cyan
  "Apprend un nouveau métier":          "border-cyan-500/40 text-cyan-800 bg-cyan-100",
  // University — violet
  "1ère année universitaire":           "border-violet-500/40 text-violet-700 bg-violet-100",
  // Baby / pregnancy — pink
  "Nourrisson arrivé récemment":        "border-pink-500/40 text-pink-700 bg-pink-100",
  "1ère grossesse":                     "border-pink-500/40 text-pink-700 bg-pink-100",
  // Living alone — orange
  "Difficile de vivre seul":            "border-orange-500/40 text-orange-700 bg-orange-100",
  "Difficile de vivre seule":           "border-orange-500/40 text-orange-700 bg-orange-100",
  "Difficile de vivre seul(e)":         "border-orange-500/40 text-orange-700 bg-orange-100",
  // Starting career — lime
  "Début de vie active":                "border-lime-500/40 text-lime-800 bg-lime-100",
  // Family carer — purple
  "Aidant familial":                    "border-purple-500/40 text-purple-700 bg-purple-100",
  // Transition — sky
  "Parcours de transition":             "border-sky-500/40 text-sky-700 bg-sky-100",
  // Lack of services — stone
  "Manque de repères dans la ville":    "border-stone-400/40 text-stone-700 bg-stone-200",
  "Manque de commerces de proximité":   "border-stone-400/40 text-stone-700 bg-stone-200",
};

// ─── Card background tint per badge ─────────────────────

export const BADGE_CARD_BG: Record<string, string> = {
  "Proche de chez vous":                "bg-emerald-50/60",
  "Dans votre département":             "bg-emerald-50/60",
  "Dans votre région":                  "bg-emerald-50/60",
  "Dans votre pays":                    "bg-emerald-50/60",
  "Nouveau bénéficiaire inscrit":       "bg-blue-50/60",
  "Logement provisoire":                "bg-amber-50/60",
  "Démarches juridiques en cours":      "bg-indigo-50/60",
  "Démarches administratives en cours": "bg-indigo-50/60",
  "Très loin de sa famille":            "bg-fuchsia-50/60",
  "Désert médical":                     "bg-red-50/60",
  "Zone rurale isolée":                 "bg-teal-50/60",
  "Impact de l'inflation":              "bg-slate-50/60",
  "Apprend un nouveau métier":          "bg-cyan-50/60",
  "1ère année universitaire":           "bg-violet-50/60",
  "Nourrisson arrivé récemment":        "bg-pink-50/60",
  "1ère grossesse":                     "bg-pink-50/60",
  "Difficile de vivre seul":            "bg-orange-50/60",
  "Difficile de vivre seule":           "bg-orange-50/60",
  "Difficile de vivre seul(e)":         "bg-orange-50/60",
  "Début de vie active":                "bg-lime-50/60",
  "Aidant familial":                    "bg-purple-50/60",
  "Parcours de transition":             "bg-sky-50/60",
  "Manque de repères dans la ville":    "bg-stone-100/60",
  "Manque de commerces de proximité":   "bg-stone-100/60",
};

export const DEFAULT_BADGE = "Impact de l'inflation";

// ─── Helpers ─────────────────────────────────────────────

export function genderizeBadge(badge: string, gender: string): string {
  if (badge === "Difficile de vivre seul(e)") {
    return gender === "woman" ? "Difficile de vivre seule" : "Difficile de vivre seul";
  }
  return badge;
}

export function getBadgeStyle(badge: string): string {
  return BADGE_STYLES[badge] || BADGE_STYLES[DEFAULT_BADGE];
}

export function getCardBg(badge: string): string {
  return BADGE_CARD_BG[badge] || "bg-card";
}

export function isNewBeneficiary(createdAt?: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}

interface BeneficiaryBadgeInput {
  proximity_label?: string;
  created_at?: string;
  context_badge?: string;
  avatar_gender: string;
}

export function getDisplayBadge(b: BeneficiaryBadgeInput): string {
  if (b.proximity_label) return b.proximity_label;
  if (isNewBeneficiary(b.created_at)) return "Nouveau bénéficiaire inscrit";
  if (b.context_badge) return genderizeBadge(b.context_badge, b.avatar_gender);
  return DEFAULT_BADGE;
}

export function deduplicateBadges(beneficiaries: BeneficiaryBadgeInput[]): string[] {
  const usedBadges = new Set<string>();
  const result: string[] = [];
  for (const b of beneficiaries) {
    let badge = getDisplayBadge(b);
    if (usedBadges.has(badge)) {
      const contextBadge = b.context_badge ? genderizeBadge(b.context_badge, b.avatar_gender) : null;
      if (contextBadge && !usedBadges.has(contextBadge) && contextBadge !== badge) {
        badge = contextBadge;
      } else if (!usedBadges.has(DEFAULT_BADGE)) {
        badge = DEFAULT_BADGE;
      }
    }
    usedBadges.add(badge);
    result.push(badge);
  }
  return result;
}
