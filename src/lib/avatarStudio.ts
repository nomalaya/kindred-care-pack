/**
 * AVATAR STUDIO — "trombinoscope d'entreprise".
 *
 * L'homogénéité des ronds profils ne vient PAS de la déformation des personnes,
 * mais d'un dispositif constant : même contenant, même marge, même fond.
 * Chacun garde sa morphologie, sa coiffure, ses accessoires.
 *
 * Ce module est la source unique de vérité du rendu « rond profil donateur ».
 * Aucun zoom ni décalage individuel (avatar_scale / avatar_offset_*) n'est
 * appliqué dans ce mode : le portrait est affiché entier, proportions natives.
 */
import type { CSSProperties } from "react";

/** Marge intérieure commune du cercle, en % du diamètre. Garantit que les
 *  cheveux (afro, volume, voile, chapeau) ne touchent jamais le bord. */
export const STUDIO_PADDING_PCT = 6;

export type AvatarDisplayMode = "studio" | "framed";

/** Style du conteneur circulaire (le « studio » : fond neutre commun). */
export function studioContainerStyle(dim: number, bgUrl?: string | null): CSSProperties {
  return {
    width: dim,
    height: dim,
    backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
    backgroundColor: bgUrl ? undefined : "#ffffff",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

/**
 * Style de l'image en mode studio : portrait entier, proportions strictement
 * conservées (`contain`), marge intérieure commune en haut et sur les côtés, et
 * bas EXACTEMENT au ras du bord inférieur — les fichiers étant normalisés avec
 * le buste au ras du bas (voir `avatarFramingSpec.STUDIO_TOP_HEADROOM`), le
 * buste est coupé par l'arc du cercle sans jamais laisser d'espace vide.
 */
export function studioImageStyle(): CSSProperties {
  const pad = STUDIO_PADDING_PCT;
  return {
    position: "absolute",
    top: `${pad}%`,
    left: `${pad}%`,
    width: `${100 - pad * 2}%`,
    height: `${100 - pad}%`,
    objectFit: "contain",
    objectPosition: "center bottom",
  };
}

