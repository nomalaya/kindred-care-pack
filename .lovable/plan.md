## Principe : trombinoscope d'entreprise
Dans un trombinoscope, l'homogénéité ne vient pas du fait de déformer les gens : elle vient d'un **studio unique** — même cadre, même distance, même hauteur d'objectif, même fond, même lumière. Chacun garde sa morphologie, sa coiffure, ses accessoires ; c'est le dispositif qui est constant.

On applique exactement cela : un « studio » commun côté affichage, plus une charte de prise de vue commune côté génération. Aucun étirement, aucun écrasement, aucun recadrage destructif.

## 1. Le contenant standard (le rond profil)
Un seul composant définit le rond donateur, avec des règles identiques pour tout le monde :
- Portrait entier affiché, proportions natives strictement conservées.
- Marge intérieure commune : les cheveux (afro, volume, voile, chapeau) restent contenus, jamais coupés par le bord.
- Buste visible dans le bas du cercle, fond neutre uniforme derrière le sujet.
- Les zooms/décalages mathématiques enregistrés en base ne sont plus appliqués dans ce rendu.
- Mêmes règles à toutes les tailles de rond (petit, moyen, grand), l'échelle seule change.

## 2. La charte de prise de vue (côté génération, pour les avatars à venir)
Comme une consigne donnée au photographe, pas une retouche après coup :
- Cadrage « portrait de buste, moyen rapproché », sujet de face, centré.
- Distance constante : la tête occupe la même part du cadre pour tous, cheveux et couvre-chefs inclus dans le cadre.
- Épaules complètes et haut de poitrine visibles, fond neutre uni.
- À interdire : gros plan visage serré, photo d'identité, épaules coupées, buste qui se dissout dans le fond.

Cette charte remplace les contraintes chiffrées cumulées (yeux à 38 %, menton à 50 %, tête à 44 %…) qui se contredisaient et provoquaient les déformations.

## 3. Ce qu'on arrête
- Plus de normalisation par zoom/translation forcés sur les portraits existants.
- Aucune régénération dans cette étape : les avatars actuels sont conservés tels quels.
- L'Avatar Studio et les outils internes restent disponibles pour les corrections au cas par cas.

## 4. Planche de contrôle trombinoscope
Une planche unique avec les ronds côte à côte, comme une page de trombinoscope :
- Léa, Kwame, plus deux morphologies/coiffures très différentes (volume capillaire, couvre-chef).
- Critères de validation : cheveux entièrement contenus, buste présent, tailles de visage visuellement cohérentes, aucune proportion abîmée.
- Si ça ne colle pas, on ajuste **la marge commune du studio**, jamais un individu.

## Détails techniques
- `src/components/BeneficiaryAvatar.tsx` : source unique de vérité du rond profil ; rendu contenu + masque circulaire + marge partagée, `avatar_scale` / `avatar_offset_x` / `avatar_offset_y` ignorés dans ce mode.
- Toutes les surfaces donateur consomment ce composant (sélection, tunnel de don, récapitulatif, confirmation, espace donateur) ; aucune ne fait son propre cadrage.
- `supabase/functions/_shared/avatarFramingSpec.ts` / `avatarArtDirection.ts` : la charte de prise de vue remplace les cibles chiffrées ; `avatarNormalize.ts` n'applique plus de transformation géométrique corrective.
- Base de données inchangée, aucune migration.