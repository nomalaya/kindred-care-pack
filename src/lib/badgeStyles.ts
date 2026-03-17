import type React from "react";

/**
 * Badge styling system for beneficiary context badges.
 *
 * Centralized here so BeneficiarySelection and DonationFlow share
 * the same visual logic. Colors use high-contrast pairings.
 */

// ─── Badge text/border/bg styles ─────────────────────────

export const BADGE_STYLES: Record<string, string> = {
  // Proximity — emerald
  "Proche de chez vous":                "border-emerald-500/60 text-emerald-800 bg-emerald-100",
  "Dans votre département":             "border-emerald-500/60 text-emerald-800 bg-emerald-100",
  "Dans votre région":                  "border-emerald-500/60 text-emerald-800 bg-emerald-100",
  "Dans votre pays":                    "border-emerald-500/60 text-emerald-800 bg-emerald-100",
  // New beneficiary — blue
  "Nouveau bénéficiaire inscrit":       "border-blue-500/60 text-blue-800 bg-blue-100",
  // Housing — amber
  "Logement provisoire":                "border-amber-500/60 text-amber-800 bg-amber-100",
  // Legal / Admin — indigo
  "Démarches juridiques en cours":      "border-indigo-500/60 text-indigo-800 bg-indigo-100",
  "Démarches administratives en cours": "border-indigo-500/60 text-indigo-800 bg-indigo-100",
  // Far from family — fuchsia
  "Très loin de sa famille":            "border-fuchsia-500/60 text-fuchsia-800 bg-fuchsia-100",
  // Medical desert — red
  "Désert médical":                     "border-red-500/60 text-red-800 bg-red-100",
  // Rural — teal
  "Zone rurale isolée":                 "border-teal-500/60 text-teal-800 bg-teal-100",
  // Inflation — slate
  "Impact de l'inflation":              "border-slate-400/60 text-slate-800 bg-slate-100",
  // New trade — cyan
  "Apprend un nouveau métier":          "border-cyan-500/60 text-cyan-800 bg-cyan-100",
  // University — violet
  "1ère année universitaire":           "border-violet-500/60 text-violet-800 bg-violet-100",
  // Baby / pregnancy — pink
  "Nourrisson arrivé récemment":        "border-pink-500/60 text-pink-800 bg-pink-100",
  "1ère grossesse":                     "border-pink-500/60 text-pink-800 bg-pink-100",
  // Living alone — orange
  "Difficile de vivre seul":            "border-orange-500/60 text-orange-800 bg-orange-100",
  "Difficile de vivre seule":           "border-orange-500/60 text-orange-800 bg-orange-100",
  "Difficile de vivre seul(e)":         "border-orange-500/60 text-orange-800 bg-orange-100",
  // Starting career — lime
  "Début de vie active":                "border-lime-500/60 text-lime-800 bg-lime-100",
  // Family carer — purple
  "Aidant familial":                    "border-purple-500/60 text-purple-800 bg-purple-100",
  // Transition — sky
  "Parcours de transition":             "border-sky-500/60 text-sky-800 bg-sky-100",
  // Lack of services — stone
  "Manque de repères dans la ville":    "border-stone-400/60 text-stone-800 bg-stone-200",
  "Manque de commerces de proximité":   "border-stone-400/60 text-stone-800 bg-stone-200",
};

// ─── Card background tint per badge ─────────────────────

export const DEFAULT_BADGE = "Impact de l'inflation";

// ─── Card gradient per badge ────────────────────────────

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

export function getCardGradient(): React.CSSProperties {
  return { background: "linear-gradient(180deg, hsla(157, 68%, 33%, 0.10) 0%, transparent 100%)" };
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
  if (b.context_badge) return genderizeBadge(b.context_badge, b.avatar_gender);
  if (isNewBeneficiary(b.created_at)) return "Nouveau bénéficiaire inscrit";
  return DEFAULT_BADGE;
}

export function deduplicateBadges(beneficiaries: BeneficiaryBadgeInput[]): string[] {
  const usedBadges = new Set<string>();
  const result: string[] = [];
  const allBadgeKeys = Object.keys(BADGE_STYLES);

  for (const b of beneficiaries) {
    let badge = getDisplayBadge(b);
    if (usedBadges.has(badge)) {
      const newLabel = isNewBeneficiary(b.created_at) ? "Nouveau bénéficiaire inscrit" : null;
      if (newLabel && !usedBadges.has(newLabel)) {
        badge = newLabel;
      } else if (!usedBadges.has(DEFAULT_BADGE)) {
        badge = DEFAULT_BADGE;
      } else {
        const fallback = allBadgeKeys.find(k => !usedBadges.has(k));
        if (fallback) badge = fallback;
      }
    }
    usedBadges.add(badge);
    result.push(badge);
  }
  return result;
}
