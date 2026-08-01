// sync
// Plages phénotypiques autorisées par groupe + règles de cohérence croisées.
// Objectif : autoriser la diversité visuelle (anti-clonage) SANS produire de
// combinaisons impossibles dans la vraie vie (ex. peau noire + yeux bleus,
// femme voilée rousse à la peau claire, asiatique aux cheveux blonds…).
//
// Ces plages complètent PHENOTYPE_DEFAULTS (src/lib/countryPhenotypes.ts) :
// les defaults donnent UNE valeur, les plages donnent l'ensemble des valeurs
// crédibles dans lesquelles le remix peut piocher.

import type { GroupKey } from "./countryPhenotypes.ts";

export interface PhenotypeRange {
  skin_tone: string[];
  eye_color: string[];
  eye_shape: string[];
  hair_type: string[];
  hair_color: string[];
  hair_volume: string[];
  nose: string[];
  face_shape: string[];
}

// Ordre de clarté croissante → décroissante (sert au décalage ±1 cran).
export const SKIN_TONE_SCALE = [
  "fair", "light", "medium", "olive", "tan", "medium_dark", "dark", "deep",
] as const;

export const PHENOTYPE_RANGES: Record<GroupKey, PhenotypeRange> = {
  north_european: {
    skin_tone: ["fair", "light", "medium"],
    eye_color: ["blue", "gray", "green", "hazel", "brown"],
    eye_shape: ["round", "almond", "soft", "hooded", "deep_set"],
    hair_type: ["straight", "wavy", "curly"],
    hair_color: ["blonde", "light_brown", "brown", "dark_brown", "red", "auburn"],
    hair_volume: ["fine", "natural", "light", "thick"],
    nose: ["narrow", "straight", "upturned", "rounded", "aquiline"],
    face_shape: ["oval", "long", "square_soft", "heart", "round"],
  },
  mediterranean: {
    skin_tone: ["light", "medium", "olive", "tan"],
    eye_color: ["brown", "dark_brown", "hazel", "green"],
    eye_shape: ["almond", "round", "soft", "deep_set", "hooded"],
    hair_type: ["straight", "wavy", "curly"],
    hair_color: ["black", "dark_brown", "brown", "auburn"],
    hair_volume: ["natural", "light", "thick"],
    nose: ["aquiline", "straight", "narrow", "rounded"],
    face_shape: ["oval", "square_soft", "heart", "round", "long"],
  },
  mena: {
    skin_tone: ["light", "medium", "olive", "tan", "medium_dark"],
    eye_color: ["dark_brown", "brown", "hazel"],
    eye_shape: ["almond", "deep_set", "soft", "hooded", "round"],
    hair_type: ["wavy", "curly", "straight"],
    hair_color: ["black", "dark_brown", "brown"],
    hair_volume: ["natural", "thick", "light"],
    nose: ["aquiline", "straight", "rounded", "narrow"],
    face_shape: ["oval", "square_soft", "long", "round", "heart"],
  },
  sub_saharan_africa: {
    skin_tone: ["medium_dark", "dark", "deep"],
    eye_color: ["dark_brown", "brown"],
    eye_shape: ["almond", "round", "soft", "deep_set"],
    hair_type: ["coily", "curly"],
    hair_color: ["black", "dark_brown"],
    hair_volume: ["natural", "thick"],
    nose: ["wide", "rounded", "flat_bridge"],
    face_shape: ["oval", "round", "square_soft", "heart", "long"],
  },
  east_asian: {
    skin_tone: ["fair", "light", "medium", "olive"],
    eye_color: ["dark_brown", "brown"],
    eye_shape: ["narrow", "almond", "hooded", "soft"],
    hair_type: ["straight"],
    hair_color: ["black", "dark_brown"],
    hair_volume: ["fine", "natural", "thick"],
    nose: ["flat_bridge", "rounded", "straight", "upturned"],
    face_shape: ["round", "square_soft", "oval", "heart"],
  },
  south_asian: {
    skin_tone: ["medium", "olive", "tan", "medium_dark", "dark"],
    eye_color: ["dark_brown", "brown", "hazel"],
    eye_shape: ["almond", "round", "deep_set", "soft"],
    hair_type: ["wavy", "straight", "curly"],
    hair_color: ["black", "dark_brown"],
    hair_volume: ["natural", "thick"],
    nose: ["straight", "rounded", "wide", "aquiline"],
    face_shape: ["oval", "round", "heart", "long", "square_soft"],
  },
};

// Coiffures crédibles selon la texture de cheveux.
export const HAIR_STYLE_BY_TYPE: Record<string, string[]> = {
  straight: ["clean_cut", "tousled", "side_parted", "loose", "softly_tied", "half_up", "bun"],
  wavy: ["tousled", "side_parted", "loose", "softly_tied", "half_up", "natural_waves", "bun"],
  curly: ["tousled", "loose", "softly_tied", "natural_waves", "bun", "braided_simple", "cornrows"],
  coily: ["clean_cut", "braided_simple", "cornrows", "box_braids", "braided_updo", "bun"],
};

/** Coiffures culturellement plausibles par groupe (tresses/cornrows réservées
 *  aux textures et cultures où elles existent réellement). */
export const HAIR_STYLE_BY_GROUP: Record<GroupKey, string[]> = {
  north_european: ["clean_cut", "tousled", "side_parted", "loose", "softly_tied", "half_up", "bun", "natural_waves"],
  mediterranean: ["clean_cut", "tousled", "side_parted", "loose", "softly_tied", "half_up", "bun", "natural_waves"],
  mena: ["clean_cut", "tousled", "side_parted", "loose", "softly_tied", "half_up", "bun", "natural_waves"],
  sub_saharan_africa: ["clean_cut", "braided_simple", "cornrows", "box_braids", "braided_updo", "bun", "softly_tied", "natural_waves"],
  east_asian: ["clean_cut", "tousled", "side_parted", "loose", "softly_tied", "half_up", "bun"],
  south_asian: ["clean_cut", "loose", "softly_tied", "half_up", "bun", "braided_simple", "natural_waves"],
};

/** Textures de cheveux qui portent une information non phénotypique
 *  (couvre-chef, calvitie, crâne rasé) : le remix ne doit jamais les écraser. */
export const HAIR_TYPE_LOCKED_VALUES = ["covered", "bald", "shaved", "thinning"];


export const COVERING_VISIBLE_STYLES = ["softly_tied", "bun", "braided_updo", "clean_cut"];

const FORBIDDEN_WITH_COVERING = {
  skin_tone: ["fair", "light"],
  hair_color: ["blonde", "red", "auburn", "light_brown"],
  eye_color: ["blue", "gray", "green"],
};

const GRAY_MIN_AGE_RANGES = ["55-65", "65-75", "75-85"];

export interface CoherenceContext {
  head_covering?: string | null;
  age_range?: string | null;
  group?: GroupKey | null;
}

const pickFallback = (allowed: string[], current: string | undefined, seedIdx: number) =>
  allowed.length ? allowed[seedIdx % allowed.length] : current;

/**
 * Corrige un jeu d'attributs pour qu'il reste crédible.
 * Ne renvoie que les champs corrigés (patch).
 */
export function enforcePhenotypeCoherence(
  values: Record<string, any>,
  ctx: CoherenceContext,
  seedIdx = 0,
): Record<string, any> {
  const out = { ...values };
  const group = ctx.group ?? null;
  const range = group ? PHENOTYPE_RANGES[group] : null;

  // 1. Toute valeur hors plage du groupe est ramenée dans la plage.
  if (range) {
    const fields: Array<[string, keyof PhenotypeRange]> = [
      ["avatar_skin_tone", "skin_tone"],
      ["avatar_eye_color", "eye_color"],
      ["avatar_eye_shape", "eye_shape"],
      ["avatar_hair_type", "hair_type"],
      ["avatar_hair_color", "hair_color"],
      ["avatar_hair_volume", "hair_volume"],
      ["avatar_nose", "nose"],
      ["avatar_face_shape", "face_shape"],
    ];
    for (const [field, key] of fields) {
      const v = out[field];
      if (!v) continue;
      // cheveux gris/blancs : exception d'âge traitée plus bas
      if (field === "avatar_hair_color" && (v === "gray" || v === "white")) continue;
      if (!range[key].includes(v)) out[field] = pickFallback(range[key], v, seedIdx);
    }
  }

  // 2. Couvre-chef → interdit les combinaisons invraisemblables.
  const covering = ctx.head_covering ?? out.avatar_head_covering;
  const hasCovering = !!covering && !["none", ""].includes(covering);
  if (hasCovering) {
    for (const [key, forbidden] of Object.entries(FORBIDDEN_WITH_COVERING)) {
      const field = `avatar_${key}`;
      if (forbidden.includes(out[field])) {
        const allowed = (range?.[key as keyof PhenotypeRange] ?? []).filter(
          v => !forbidden.includes(v),
        );
        out[field] = pickFallback(allowed, out[field], seedIdx) ?? out[field];
      }
    }
    if (out.avatar_hair_style && !COVERING_VISIBLE_STYLES.includes(out.avatar_hair_style)) {
      out.avatar_hair_style = COVERING_VISIBLE_STYLES[seedIdx % COVERING_VISIBLE_STYLES.length];
    }
    if (out.avatar_hair_length === "long") out.avatar_hair_length = "shoulder";
  }

  // 3. Coiffure cohérente avec la texture.
  const hairType = out.avatar_hair_type;
  if (hairType && out.avatar_hair_style) {
    const styles = HAIR_STYLE_BY_TYPE[hairType];
    if (styles && !styles.includes(out.avatar_hair_style)) {
      out.avatar_hair_style = styles[seedIdx % styles.length];
    }
  }

  // 4. Taches de rousseur seulement sur peau claire.
  if (Array.isArray(out.avatar_facial_features)) {
    const skin = out.avatar_skin_tone;
    if (!["fair", "light"].includes(skin)) {
      out.avatar_facial_features = out.avatar_facial_features.filter(
        (f: string) => f !== "light_freckles",
      );
    }
  }

  // 5. Cheveux gris/blancs réservés aux tranches d'âge élevées.
  if (["gray", "white"].includes(out.avatar_hair_color)) {
    const ar = ctx.age_range ?? out.avatar_age_range;
    if (!ar || !GRAY_MIN_AGE_RANGES.includes(ar)) {
      out.avatar_hair_color = pickFallback(
        range?.hair_color ?? ["dark_brown"],
        "dark_brown",
        seedIdx,
      );
    }
  }

  // 6. Cheveux fins incompatibles avec une texture coily.
  if (out.avatar_hair_type === "coily" && out.avatar_hair_volume === "fine") {
    out.avatar_hair_volume = "natural";
  }

  return Object.fromEntries(
    Object.entries(out).filter(([k, v]) => v !== (values as any)[k] || k in values),
  );
}
