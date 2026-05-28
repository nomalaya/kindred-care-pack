## Objectif

Aligner le fond des avatars sur l'image de référence : **blanc pur dominant au centre (autour du visage)**, **3 blobs de couleur douce mais saturée**, très flous, déposés sur les bords et **dépassant en fond perdu** sur les 4 côtés. Aucune lecture sociale, variation déterministe par bénéficiaire.

## Lecture de la référence

- Centre du cadre = blanc pur (#FFFFFF), zone de respiration autour de la tête et des épaules → le contour du visage ne touche jamais une couleur.
- 3 halos colorés disposés sur les bords (ex : vert haut-gauche, orange droite, rose-rouge bas-gauche), chacun coupé par le bord du cadre (fond perdu).
- Flou gaussien très marqué → pas de contour net, transition douce vers le blanc.
- Couleurs douces mais **pas fades** : pastels saturés, pas de gris poudré.

## Direction visuelle cible

- **Base** : aplat blanc pur `#FFFFFF`. Pas de crème, pas d'ivoire, pas de off-white.
- **3 blobs flous** par avatar, disposés sur 3 zones distinctes du bord (ex : top-left + right + bottom-left), chacun en fond perdu (le centre du blob est hors cadre ou collé au bord).
- **Zone de sécurité centrale** : un disque blanc d'environ 55-65 % de la largeur, centré sur le visage, où aucune couleur ne pénètre. Le contour du visage et des cheveux ressort sur du blanc.
- **Palette de teintes** (douces mais vives, jamais ternes) : vert printemps, corail, rose tendre, ocre solaire, bleu ciel, lavande, menthe, pêche. ~8 teintes.
- Flou très prononcé, pas de bord net, pas de second motif, pas de texture papier.

## Variation par seed (déterministe)

- `seed → triplet de 3 teintes` choisi parmi un set de combinaisons harmonieuses pré-validées (évite les associations criardes type rouge+vert pur).
- `seed → triplet de positions` parmi 6 configurations (TL+R+BL, TR+L+BR, T+BL+BR, …).
- `seed → variation de taille / intensité` (3 niveaux).
→ Plusieurs centaines de combinaisons, mais cohérence visuelle totale.

## Changements de code

Un seul fichier modifié : `supabase/functions/_shared/avatarArtDirection.ts`.

1. **Réécrire le bloc `BACKGROUND`** dans `ART_DIRECTION_INVARIANTS` :
   - Décrire le fond comme « pure white background (#FFFFFF) dominant the frame, with three very soft, heavily blurred organic color blobs placed at the edges, bleeding off the canvas ».
   - Préciser **safe zone centrale blanche** autour du visage → le visage ne touche aucune couleur.
   - Interdire explicitement : crème, beige, off-white, ivoire, deuxième forme nette, motif, texture papier, objets, intérieur, paysage.

2. **Remplacer la fonction `pickBackgroundDirective(seed)`** (créée à l'étape précédente) :
   - Retourne une phrase décrivant **les 3 teintes nommées + leurs 3 positions au bord** + intensité du flou.
   - Exemple : _« Background: pure white (#FFFFFF) canvas, with three heavily blurred soft organic color blobs bleeding off the edges — a <teinte1> blob in the <position1> corner, a <teinte2> blob on the <position2> edge, a <teinte3> blob in the <position3> corner. The center of the frame around the subject's face stays fully white, no color touches the face or hair. Soft pastel tones, gentle but not dull, very strong gaussian blur, no hard edges. »_
   - Palette codée : 8 teintes pastel saturées (spring green, coral, soft pink, sunny ochre, sky blue, lavender, mint, peach).
   - Set de ~10 trios harmonieux pré-validés (analogues ou complémentaires doux) sélectionnés par seed.
   - 6 configurations de positions (toujours 3 bords différents pour préserver la safe zone).

3. **Brancher** dans `buildAvatarPrompt` juste après `FRAMING_BLOCK` (déjà fait, à conserver).

4. **Mettre à jour `NEGATIVE_PROMPT`** :
   - Ajouter : `no cream background`, `no beige background`, `no off-white background`, `no ivory background`, `no color touching the face`, `no color halo around the head`, `no hard edged blob`, `no gradient covering the whole frame`.
   - Conserver les interdictions existantes (scène domestique, paysage, motif, etc.).

5. **Aucune migration BDD**, aucun changement UI, aucun changement de modèle Gemini.

## Hors scope

- Pas de re-génération automatique des avatars existants (relance manuelle depuis `/avatar-studio`).
- Pas d'édition admin de la palette (figée dans le code).

## Validation

Après déploiement automatique de l'edge function, régénérer 3-4 avatars test depuis `/avatar-studio` et vérifier :
- fond blanc pur au centre (pas de crème),
- visage entouré uniquement de blanc,
- 3 blobs distincts visibles sur les bords, en fond perdu,
- flou très doux, aucun bord net,
- couleurs vives mais pas criardes,
- variation visible entre bénéficiaires.
