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

// ─── Left border color per badge ────────────────────────

export const BADGE_BORDER_COLOR: Record<string, string> = {
  "Proche de chez vous":                "border-l-emerald-500",
  "Dans votre département":             "border-l-emerald-500",
  "Dans votre région":                  "border-l-emerald-500",
  "Dans votre pays":                    "border-l-emerald-500",
  "Nouveau bénéficiaire inscrit":       "border-l-blue-500",
  "Logement provisoire":                "border-l-amber-500",
  "Démarches juridiques en cours":      "border-l-indigo-500",
  "Démarches administratives en cours": "border-l-indigo-500",
  "Très loin de sa famille":            "border-l-fuchsia-500",
  "Désert médical":                     "border-l-red-500",
  "Zone rurale isolée":                 "border-l-teal-500",
  "Impact de l'inflation":              "border-l-slate-400",
  "Apprend un nouveau métier":          "border-l-cyan-500",
  "1ère année universitaire":           "border-l-violet-500",
  "Nourrisson arrivé récemment":        "border-l-pink-500",
  "1ère grossesse":                     "border-l-pink-500",
  "Difficile de vivre seul":            "border-l-orange-500",
  "Difficile de vivre seule":           "border-l-orange-500",
  "Difficile de vivre seul(e)":         "border-l-orange-500",
  "Début de vie active":                "border-l-lime-500",
  "Aidant familial":                    "border-l-purple-500",
  "Parcours de transition":             "border-l-sky-500",
  "Manque de repères dans la ville":    "border-l-stone-400",
  "Manque de commerces de proximité":   "border-l-stone-400",
};

// ─── Card gradient per badge ────────────────────────────

const BADGE_GRADIENT: Record<string, string> = {
  "Proche de chez vous":                "linear-gradient(180deg, rgba(16,185,129,0.12) 0%, transparent 100%)",
  "Dans votre département":             "linear-gradient(180deg, rgba(16,185,129,0.12) 0%, transparent 100%)",
  "Dans votre région":                  "linear-gradient(180deg, rgba(16,185,129,0.12) 0%, transparent 100%)",
  "Dans votre pays":                    "linear-gradient(180deg, rgba(16,185,129,0.12) 0%, transparent 100%)",
  "Nouveau bénéficiaire inscrit":       "linear-gradient(180deg, rgba(59,130,246,0.12) 0%, transparent 100%)",
  "Logement provisoire":                "linear-gradient(180deg, rgba(245,158,11,0.12) 0%, transparent 100%)",
  "Démarches juridiques en cours":      "linear-gradient(180deg, rgba(99,102,241,0.12) 0%, transparent 100%)",
  "Démarches administratives en cours": "linear-gradient(180deg, rgba(99,102,241,0.12) 0%, transparent 100%)",
  "Très loin de sa famille":            "linear-gradient(180deg, rgba(217,70,239,0.12) 0%, transparent 100%)",
  "Désert médical":                     "linear-gradient(180deg, rgba(239,68,68,0.12) 0%, transparent 100%)",
  "Zone rurale isolée":                 "linear-gradient(180deg, rgba(20,184,166,0.12) 0%, transparent 100%)",
  "Impact de l'inflation":              "linear-gradient(180deg, rgba(148,163,184,0.12) 0%, transparent 100%)",
  "Apprend un nouveau métier":          "linear-gradient(180deg, rgba(6,182,212,0.12) 0%, transparent 100%)",
  "1ère année universitaire":           "linear-gradient(180deg, rgba(139,92,246,0.12) 0%, transparent 100%)",
  "Nourrisson arrivé récemment":        "linear-gradient(180deg, rgba(236,72,153,0.12) 0%, transparent 100%)",
  "1ère grossesse":                     "linear-gradient(180deg, rgba(236,72,153,0.12) 0%, transparent 100%)",
  "Difficile de vivre seul":            "linear-gradient(180deg, rgba(249,115,22,0.12) 0%, transparent 100%)",
  "Difficile de vivre seule":           "linear-gradient(180deg, rgba(249,115,22,0.12) 0%, transparent 100%)",
  "Difficile de vivre seul(e)":         "linear-gradient(180deg, rgba(249,115,22,0.12) 0%, transparent 100%)",
  "Début de vie active":                "linear-gradient(180deg, rgba(132,204,22,0.12) 0%, transparent 100%)",
  "Aidant familial":                    "linear-gradient(180deg, rgba(168,85,247,0.12) 0%, transparent 100%)",
  "Parcours de transition":             "linear-gradient(180deg, rgba(14,165,233,0.12) 0%, transparent 100%)",
  "Manque de repères dans la ville":    "linear-gradient(180deg, rgba(168,162,158,0.12) 0%, transparent 100%)",
  "Manque de commerces de proximité":   "linear-gradient(180deg, rgba(168,162,158,0.12) 0%, transparent 100%)",
};

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

export function getBorderColor(badge: string): string {
  return BADGE_BORDER_COLOR[badge] || "border-l-slate-400";
}

export function getCardGradient(badge: string): React.CSSProperties {
  return { background: BADGE_GRADIENT[badge] || BADGE_GRADIENT[DEFAULT_BADGE] };
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
