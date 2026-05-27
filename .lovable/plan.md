## Objectif

Remplacer le fond actuel des avatars générés (scène domestique contextuelle) par un **fond abstrait minimaliste type « blob organique »** : une grande zone blanche/crème dominante + **une seule teinte douce** posée en forme organique floue derrière le sujet. Aucune lecture sociale, variation déterministe par bénéficiaire.

## Direction visuelle

- **Base** : aplat blanc cassé / crème très clair (proche du fond app `Soleil Émeraude`).
- **Une seule forme blob** floue, désaxée derrière la tête/épaule, occupant ~30-45 % du cadre.
- **Une seule teinte** par avatar, désaturée, basse opacité (~25-40 %), parmi une palette restreinte de 6-7 tons (terracotta poudré, sauge, ocre doux, bleu brume, prune fanée, rose argile, sable).
- Pas de deuxième blob, pas de halo radial superposé, pas de motif, pas de texture marquée — juste le blob + un très léger grain pour rester dans le registre illustré.
- Bords toujours full-bleed jusqu'aux 4 côtés (la contrainte anti « bord papier / cadre » reste active).

## Variation par seed

Sélection déterministe à partir du `seed` du bénéficiaire (déjà utilisé pour les traits) :
- `seed → index teinte` (parmi ~7) — garantit que deux bénéficiaires voisins n'ont pas la même couleur.
- `seed → position blob` (4 positions : haut-gauche, haut-droite, derrière épaule gauche, derrière épaule droite).
- `seed → taille blob` (3 tailles : medium / large / xl).
→ Variété visible dans une grille, mais cohérence totale de style.

## Changements de code

Un seul fichier touché : `supabase/functions/_shared/avatarArtDirection.ts`.

1. **Réécrire le bloc `BACKGROUND`** dans `ART_DIRECTION_INVARIANTS` :
   - Décrire le fond comme « grande zone blanc cassé dominante + une unique forme organique floue d'une seule teinte douce derrière le sujet », socialement neutre.
   - Interdire explicitement : objets domestiques, meubles, fenêtres, plantes, paysage, intérieur, rue, atelier, motifs décoratifs, deuxième couleur de fond.

2. **Ajouter une petite fonction `pickBackgroundDirective(seed)`** (déterministe) qui retourne une phrase du type :
   _« Background: off-white cream canvas filling most of the frame, with a single soft <teinte> organic blob shape placed <position>, low opacity, gently blurred, no other elements. »_
   - Palette : 7 teintes nommées en anglais simple (`dusty terracotta`, `soft sage`, `warm ochre`, `misty blue`, `faded plum`, `clay rose`, `sand beige`).
   - 4 positions × 3 tailles → 84 combinaisons possibles via seed.

3. **Brancher `pickBackgroundDirective(t.seed)`** dans `buildAvatarPrompt`, injecté juste après `FRAMING_BLOCK` (avant les invariants), pour qu'il prenne le pas sur la description générique de fond.

4. **Mettre à jour `NEGATIVE_PROMPT`** : ajouter `no domestic scene`, `no interior`, `no furniture`, `no window`, `no plants`, `no landscape`, `no second background color`, `no decorative pattern`.

5. **Aucune migration BDD**, aucun changement UI Avatar Studio, aucun changement de modèle Gemini.

## Hors scope

- Pas de re-génération automatique des avatars existants — l'utilisateur relancera depuis le studio les bénéficiaires qu'il veut rafraîchir.
- Pas de touche admin pour éditer la palette (palette figée dans le code, fidèle au design system).

## Validation

Après déploiement automatique de l'edge function, régénérer 3-4 avatars test (genre/âge/cause variés) depuis `/avatar-studio` et vérifier : fond blanc dominant, une seule teinte douce, blob bien flou, aucun objet narratif, variation visible entre bénéficiaires.
