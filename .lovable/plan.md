# Recadrage avatars : couper au niveau des clavicules

## Problème

Les portraits actuels descendent jusqu'à la poitrine (« chest bleeding into bottom edge » dans le prompt). On devine la poitrine sous les vêtements (cas d'Irina), ce qui peut influencer émotionnellement la perception du donateur.

## Cadrage cible (validé)

Référence : exemple femme déjà généré — tête + cou + clavicules + tout début des épaules. Le bord inférieur de l'image coupe juste au niveau des clavicules, le haut du vêtement est à peine visible, la poitrine n'est jamais montrée.

## Modifications (backend prompt uniquement)

### 1. `supabase/functions/_shared/avatarArtDirection.ts`

Réécrire `FRAMING_BLOCK` :
- Remplacer « head + neck + shoulders + chest » par « head + neck + collarbone + very top of shoulders ».
- Supprimer « chest bleeding into bottom edge » et « character occupies ~80-90% of the frame vertically ».
- Imposer en majuscules : « the bottom edge of the canvas crops the body at the collarbone line, ABOVE the chest. The chest, bust, breasts and torso MUST NOT be visible. Only a thin sliver of the garment neckline may appear at the bottom edge. »
- Conserver le format carré 1:1, plein cadre, et le « no empty white below the subject » (le bord inférieur est rempli par les clavicules / haut du col).

Mettre à jour `NEGATIVE_PROMPT` :
- Retirer `"no cropped torso"` (devient l'effet voulu).
- Ajouter : `"no visible chest"`, `"no visible bust"`, `"no breasts visible"`, `"no cleavage"`, `"no torso shown"`, `"do not show below the collarbone"`.

### 2. `supabase/functions/qa-avatar/index.ts` (ligne 62)

Mettre à jour la règle de QA textuelle envoyée au modèle :
- Avant : « framing: chest-up bust, centered, ~70% frame coverage »
- Après : « framing: head + collarbone only, cropped just above the chest; no chest, bust or torso visible »

## Hors scope

- Pas de modification de la logique matching / basket / DB / RLS.
- Pas de garde QA programmatique supplémentaire (option 2 écartée) — on accepte le ~85 % de réussite du modèle ; les rares cas hors-cible se régénèrent depuis l'Avatar Studio.
- Les avatars existants gardent leur ancien cadrage tant qu'ils ne sont pas régénérés (action manuelle depuis l'Avatar Studio après déploiement).

## Détails techniques

Les deux flux de génération (`generate-avatar` Aperçu + `generate-avatar-batch` HD) utilisent `buildAvatarPrompt` depuis `_shared/avatarArtDirection.ts` — un seul fichier prompt à modifier couvre les deux. Le déploiement des edge functions est automatique.
