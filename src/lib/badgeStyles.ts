import type React from "react";

/**
 * Badge styling system for beneficiary context badges.
 *
 * Centralized here so BeneficiarySelection and DonationFlow share
 * the same visual logic. Colors use high-contrast pairings.
 *
 * Badge determination now analyses short_story + emotional_sentence
 * to pick the most relevant badge, with coherence checks.
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

// ─── Defaults ────────────────────────────────────────────

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

// ─── Text Analysis ───────────────────────────────────────

export interface BeneficiaryBadgeInput {
  proximity_label?: string;
  created_at?: string;
  context_badge?: string;
  avatar_gender: string;
  children_count?: number;
  short_story?: string;
  emotional_sentence?: string;
}

/** Keyword groups ordered by detection priority */
const TEXT_SIGNALS: { keywords: RegExp; badge: string | ((b: BeneficiaryBadgeInput) => string) }[] = [
  {
    // Parentalité / famille
    keywords: /\b(enfants?|adolescents?|bébé|maman|papa|fils|fille|famille|élever|mère|père|maternel|paternel|maternité)\b/i,
    badge: "Aidant familial",
  },
  {
    // Grossesse / nourrisson
    keywords: /\b(grossesse|enceinte|nourrisson|naissance|accouchement)\b/i,
    badge: (b) => b.avatar_gender === "man" ? "Aidant familial" : "1ère grossesse",
  },
  {
    // Isolement
    keywords: /\b(seule?|isolée?|solitude|coupée? du monde)\b/i,
    badge: (b) => genderizeBadge("Difficile de vivre seul(e)", b.avatar_gender),
  },
  {
    // Logement
    keywords: /\b(logement|hébergement|SDF|sans.?domicile|relogement|expulsée?|sans.?abri)\b/i,
    badge: "Logement provisoire",
  },
  {
    // Démarches admin / juridique
    keywords: /\b(administratif|juridique|démarches|papiers|titre.?de.?séjour|régularisation|tribunal)\b/i,
    badge: "Démarches administratives en cours",
  },
  {
    // Santé / médical
    keywords: /\b(médical|hôpital|traitement|maladie|diagnostic|médicaments|santé|opération|chirurgie)\b/i,
    badge: "Désert médical",
  },
  {
    // Formation / études
    keywords: /\b(étudiant|formation|université|diplôme|apprentissage|reconversion|études)\b/i,
    badge: "Apprend un nouveau métier",
  },
  {
    // Rural
    keywords: /\b(rural|campagne|isolée?.géographiquement)\b/i,
    badge: "Zone rurale isolée",
  },
];

/**
 * Analyse `short_story` + `emotional_sentence` to infer a contextual badge.
 * Returns the first matching badge or null.
 */
export function analyzeProfileContext(b: BeneficiaryBadgeInput): string | null {
  const text = `${b.short_story || ""} ${b.emotional_sentence || ""}`;
  if (!text.trim()) return null;

  for (const signal of TEXT_SIGNALS) {
    if (signal.keywords.test(text)) {
      const candidate = typeof signal.badge === "function" ? signal.badge(b) : signal.badge;
      if (isBadgeCoherent(candidate, b)) return candidate;
    }
  }
  return null;
}

// ─── Coherence Guard ─────────────────────────────────────

/**
 * Returns false if the badge contradicts hard profile facts.
 */
export function isBadgeCoherent(badge: string, b: BeneficiaryBadgeInput): boolean {
  const children = b.children_count ?? 0;
  const text = `${b.short_story || ""} ${b.emotional_sentence || ""}`;

  // "Living alone" is incoherent if the person has children
  if (badge.startsWith("Difficile de vivre seul") && children > 0) return false;

  // "Family carer" without children AND no family mention in text
  if (badge === "Aidant familial" && children === 0 && !/\b(famille|enfant|fils|fille|mère|père|parent)\b/i.test(text)) {
    return false;
  }

  // Pregnancy / baby badges incoherent for men (unless text explicitly mentions it)
  if ((badge === "1ère grossesse" || badge === "Nourrisson arrivé récemment") && b.avatar_gender === "man") {
    return false;
  }

  return true;
}

// ─── Main Badge Determination ────────────────────────────

/**
 * New priority:
 * 1. proximity_label (geographic)
 * 2. Text analysis (short_story + emotional_sentence)
 * 3. context_badge from DB (if coherent)
 * 4. "Nouveau bénéficiaire inscrit" (< 30 days)
 * 5. DEFAULT_BADGE fallback
 */
export function getDisplayBadge(b: BeneficiaryBadgeInput): string {
  // 1. Proximity — always takes priority
  if (b.proximity_label) return b.proximity_label;

  // 2. Text analysis — most relevant signal
  const textBadge = analyzeProfileContext(b);
  if (textBadge) return textBadge;

  // 3. context_badge from DB — only if coherent
  if (b.context_badge) {
    const gendered = genderizeBadge(b.context_badge, b.avatar_gender);
    if (isBadgeCoherent(gendered, b)) return gendered;
  }

  // 4. Recency
  if (isNewBeneficiary(b.created_at)) return "Nouveau bénéficiaire inscrit";

  // 5. Default
  return DEFAULT_BADGE;
}

// ─── Deduplication (soft) ────────────────────────────────

/**
 * Tries to give unique badges but NEVER forces an incoherent/random one.
 * Duplicates are accepted rather than showing absurd labels.
 */
export function deduplicateBadges(beneficiaries: BeneficiaryBadgeInput[]): string[] {
  const result: string[] = [];
  const usedBadges = new Set<string>();

  for (const b of beneficiaries) {
    let badge = getDisplayBadge(b);

    if (usedBadges.has(badge)) {
      // Try context_badge as alternative
      if (b.context_badge) {
        const alt = genderizeBadge(b.context_badge, b.avatar_gender);
        if (!usedBadges.has(alt) && isBadgeCoherent(alt, b)) {
          badge = alt;
        }
      }
      // If still a duplicate, try "Nouveau bénéficiaire" as last resort
      if (usedBadges.has(badge) && isNewBeneficiary(b.created_at) && !usedBadges.has("Nouveau bénéficiaire inscrit")) {
        badge = "Nouveau bénéficiaire inscrit";
      }
      // Accept the duplicate rather than picking a random badge
    }

    usedBadges.add(badge);
    result.push(badge);
  }

  return result;
}
