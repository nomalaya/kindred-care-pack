/** Shared badge styling constants for beneficiary cards */

export const BADGE_STYLES: Record<string, string> = {
  // Proximity badges — primary color
  "Proche de chez vous": "border-primary/40 text-primary bg-primary/10",
  "Dans votre département": "border-primary/40 text-primary bg-primary/10",
  "Dans votre région": "border-primary/40 text-primary bg-primary/10",
  "Dans votre pays": "border-primary/40 text-primary bg-primary/10",
  // Each badge uses a distinct chromatic family with strong saturation
  "Nouveau bénéficiaire inscrit": "border-blue-300 text-blue-700 bg-blue-100",
  "Logement provisoire": "border-amber-300 text-amber-800 bg-amber-100",
  "Démarches juridiques en cours": "border-indigo-300 text-indigo-700 bg-indigo-100",
  "Démarches administratives en cours": "border-indigo-300 text-indigo-700 bg-indigo-100",
  "Très loin de sa famille": "border-fuchsia-300 text-fuchsia-700 bg-fuchsia-100",
  "Désert médical": "border-red-300 text-red-700 bg-red-100",
  "Zone rurale isolée": "border-teal-300 text-teal-700 bg-teal-100",
  "Impact de l'inflation": "border-slate-300 text-slate-700 bg-slate-100",
  "Apprend un nouveau métier": "border-cyan-300 text-cyan-700 bg-cyan-100",
  "1ère année universitaire": "border-violet-300 text-violet-700 bg-violet-100",
  "Nourrisson arrivé récemment": "border-pink-300 text-pink-700 bg-pink-100",
  "1ère grossesse": "border-pink-300 text-pink-700 bg-pink-100",
  "Difficile de vivre seul": "border-orange-300 text-orange-700 bg-orange-100",
  "Difficile de vivre seule": "border-orange-300 text-orange-700 bg-orange-100",
  "Difficile de vivre seul(e)": "border-orange-300 text-orange-700 bg-orange-100",
  "Début de vie active": "border-lime-300 text-lime-800 bg-lime-100",
  "Aidant familial": "border-purple-300 text-purple-700 bg-purple-100",
  "Parcours de transition": "border-sky-300 text-sky-700 bg-sky-100",
  "Manque de repères dans la ville": "border-stone-300 text-stone-700 bg-stone-100",
  "Manque de commerces de proximité": "border-stone-300 text-stone-700 bg-stone-100",
};

export const BADGE_CARD_BG: Record<string, string> = {
  "Proche de chez vous": "bg-primary/[0.05]",
  "Dans votre département": "bg-primary/[0.05]",
  "Dans votre région": "bg-primary/[0.05]",
  "Dans votre pays": "bg-primary/[0.05]",
  "Nouveau bénéficiaire inscrit": "bg-blue-50/60",
  "Logement provisoire": "bg-amber-50/60",
  "Démarches juridiques en cours": "bg-indigo-50/60",
  "Démarches administratives en cours": "bg-indigo-50/60",
  "Très loin de sa famille": "bg-fuchsia-50/60",
  "Désert médical": "bg-red-50/60",
  "Zone rurale isolée": "bg-teal-50/60",
  "Impact de l'inflation": "bg-slate-50/60",
  "Apprend un nouveau métier": "bg-cyan-50/60",
  "1ère année universitaire": "bg-violet-50/60",
  "Nourrisson arrivé récemment": "bg-pink-50/60",
  "1ère grossesse": "bg-pink-50/60",
  "Difficile de vivre seul": "bg-orange-50/60",
  "Difficile de vivre seule": "bg-orange-50/60",
  "Difficile de vivre seul(e)": "bg-orange-50/60",
  "Début de vie active": "bg-lime-50/60",
  "Aidant familial": "bg-purple-50/60",
  "Parcours de transition": "bg-sky-50/60",
  "Manque de repères dans la ville": "bg-stone-50/60",
  "Manque de commerces de proximité": "bg-stone-50/60",
};

export const DEFAULT_BADGE = "Impact de l'inflation";

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
