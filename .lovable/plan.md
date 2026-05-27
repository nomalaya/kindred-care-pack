## Objectif

Remplacer le fond actuel des avatars générés (scène domestique contextuelle) par un **fond abstrait minimaliste type « blob organique »** : une grande zone blanche/crème dominante + **3 teintes douces** posées en formes organiques floues derrière le sujet. Aucune lecture sociale, variation déterministe par bénéficiaire.

## Direction visuelle

- **Base** : aplat blanc cassé / crème très clair (≥ 55 % de la surface visible, donne l'impression d'espace et de lumière).
- **3 blobs organiques** flous, désaxés, dispersés derrière la tête et les épaules — l'un dominant (plus grand, derrière la tête), deux secondaires plus petits qui ponctuent l'arrière-plan.
- **3 teintes** par avatar, harmonieuses, désaturées, basse opacité (~25-40 %), tirées d'une palette restreinte de ~7 tons (terracotta poudré, sauge, ocre doux, bleu brume, prune fanée, rose argile, sable).
- Pas de motif, pas de halo radial superposé, pas de texture marquée — juste les 3 blobs + un très léger grain papier.
- Bords toujours full-bleed jusqu'aux 4 côtés (contrainte anti « bord papier / cadre » conservée).

## Variation par seed

Sélection déterministe à partir de `avatar_seed` (déjà présent sur `AvatarTraits`) :
- `seed → tripletter de teintes` : 3 couleurs distinctes tirées de la palette, garanties harmonieuses (jamais 2 fois la même, jamais 2 voisines trop proches en chroma).
- `seed → disposition` : 4 dispositions possibles (blob principal en haut-gauche / haut-droite / centre-gauche / centre-droite, les 2 secondaires placés sur les côtés opposés).
- `seed → taille du blob principal` : 3 tailles (medium / large / xl), les 2 secondaires restant plus petits.

→ Variation visible dans une grille de bénéficiaires, mais cohérence totale de style.

## Changements de code

Un seul fichier touché : `supabase/functions/_shared/avatarArtDirection.ts`.

1. **Réécrire le bloc `BACKGROUND`** dans `ART_DIRECTION_INVARIANTS` (déjà partiellement fait, à mettre à jour pour 3 blobs au lieu de 1) :
   - « Large off-white / warm cream canvas dominating the frame, with three soft organic blob shapes in three different muted tints, low opacity, gently blurred, no hard edges, scattered behind the subject. »
   - Interdire explicitement : objets domestiques, meubles, fenêtres, plantes, paysage, intérieur, rue, atelier, motifs décoratifs, plus de 3 couleurs, blobs nets/géométriques.

2. **Ajouter une fonction `pickBackgroundDirective(seed)`** déterministe qui retourne une phrase précise, par ex. :
   _« Background composition: off-white cream canvas covering most of the frame. Behind the subject, three soft organic blob shapes, gently blurred, low opacity: a <size> <tint A> blob <position A>, a smaller <tint B> blob <position B>, and a smaller <tint C> blob <position C>. No other elements, no objects, no scene. »_
   - Palette : 7 teintes nommées (`dusty terracotta`, `soft sage`, `warm ochre`, `misty blue`, `faded plum`, `clay rose`, `sand beige`).
   - Triplet tiré du seed avec un offset (i, i+2, i+4 mod 7) pour garantir l'harmonie et éviter les voisins.
   - 4 dispositions × 3 tailles × 7 points de départ palette = ~84 combinaisons distinctes.

3. **Brancher `pickBackgroundDirective(t.avatar_seed)`** dans `buildAvatarPrompt`, injecté juste après `FRAMING_BLOCK` (avant les invariants), pour qu'il prenne le pas sur la description générique.

4. **Mettre à jour `NEGATIVE_PROMPT`** : ajouter `no domestic scene`, `no interior`, `no furniture`, `no window`, `no plants`, `no landscape`, `no decorative pattern`, `no more than three background colors`, `no geometric shapes in background`.

5. **Aucune migration BDD**, aucun changement UI Avatar Studio, aucun changement de modèle Gemini.

## Hors scope

- Pas de re-génération automatique des avatars existants — l'utilisateur relancera depuis le studio les bénéficiaires qu'il veut rafraîchir.
- Pas de panneau admin pour éditer la palette (palette figée dans le code, fidèle au design system « Soleil Émeraude »).

## Validation

Après déploiement automatique de l'edge function `generate-avatar`, régénérer 3-4 avatars test (genre/âge/cause variés) depuis `/avatar-studio` et vérifier : fond crème dominant, 3 teintes douces clairement distinctes, blobs bien flous, aucun objet narratif, variation visible entre bénéficiaires.
