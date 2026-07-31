# Cadrage ancré sur la ligne des yeux (fin du sur-calcul géométrique)

Objectif : un seul ancrage de position (les yeux à 38 %) + une seule règle d'échelle (le vêtement remplit le bas). Plus aucune contrainte sur la hauteur de tête, le menton ou le sommet des cheveux — c'est ce cumul qui écrasait les épaules de Kwame.

## 1. Spécification (`_shared/avatarFramingSpec.ts`)

Ne garder que :
- `EYE_LINE = 0.38` — ligne des yeux, seul ancrage vertical.
- `BOTTOM_WIDTH_FILL = 1.0` — le vêtement couvre 100 % de la largeur du bord bas.
- `MIN_ZOOM = 0.9` — garde-fou : en dessous, la source manque de buste → `needsRegeneration` au lieu d'une déformation.

Suppression de `HAIR_TOP_LINE`, `HEAD_FILL`, `HEAD_FILL_MAX`, `CHIN_LINE`, `FACE_FILL` et de tous leurs usages.

## 2. Détection de la ligne des yeux

Le sommet des cheveux et la détection du cou par silhouette ne sont pas fiables sur afro, calvitie, voile, chapeau : on arrête de les utiliser. À la place, mesure de la ligne des yeux par vision Gemini (via Google AI Studio, donc 0 crédit Lovable), une seule requête par avatar, qui renvoie `eye_y` normalisé (0–1) et le centre horizontal du visage. Réponse en tool-call structuré, jamais de texte libre.

- Cache : la mesure est stockée sur le bénéficiaire (`avatar_eye_y`, `avatar_face_center_x`) pour ne jamais la refaire sur une image inchangée.
- Repli si la mesure échoue : on ne recadre pas, on renvoie `needsRegeneration` avec la raison — jamais de recadrage à l'aveugle.

## 3. Normalisation (`_shared/avatarNormalize.ts`)

Suppression complète de `detectLandmarks`, `EYE_IN_HEAD`, `HEAD_ASPECT`, de la recherche du cou et de l'arbitrage tête/menton. Nouvel algorithme, deux étapes indépendantes :

1. **Échelle** — plus petite valeur telle que la largeur du sujet sur la ligne qui atterrit sur le bord bas du canvas atteigne 100 % de la largeur (recherche dichotomique, relation monotone, bornée par `MIN_ZOOM`). Aucune contrainte de taille de tête : une carrure large reste large.
2. **Translation** — la fenêtre est positionnée pour que la ligne des yeux mesurée tombe exactement à 38 % de la hauteur, et le centre du visage à 50 % de la largeur.

Le filtre anti-bruit (lignes < 2 % de largeur) est conservé, il corrigeait un vrai défaut. Rapport renvoyé : `scale`, `eyeYPct` (attendu 38), `bottomWidthFillPct`, `sideGapBottomPct`, `needsRegeneration` + raison. Les champs `landmarks`/`headHPct`/`chin` disparaissent, ainsi que leurs lectures dans `normalize-avatar-framing/index.ts` et l'affichage du studio.

## 4. Prompt de génération (`FRAMING_BLOCK`)

Bloc court, sans chiffres contradictoires :
- « Medium close-up portrait, chest up ».
- « Full shoulders extending 100% to the left and right canvas borders, upper chest fully visible » — le buste descend jusqu'au milieu de la poitrine, pour qu'il y ait assez de vêtement en bas.
- Le vêtement touche et remplit toute la ligne inférieure du cadre, aucun blanc dans les coins bas.
- Interdits ajoutés au prompt négatif : `tight face crop`, `passport photo`, `sloped narrow shoulders`, `cropped shoulders`.
- Plus aucune mention de yeux à 38 %, menton à mi-hauteur, hauteur de tête ou marge haute chiffrée : la position est désormais garantie par le code, pas par le modèle.

## 5. QA (`qa-avatar/index.ts`)

Critères de cadrage réduits à deux, bloquants :
- `bottom_fill` : vêtement sur 100 % de la largeur du bord bas.
- `no_gap_under_shoulders` : zéro fond visible sous les épaules (ni bande, ni coin).

`framing`, `framing_fill`, `shoulder_width`, `bust_completeness` sont fusionnés dedans. Le critère de marge haute est supprimé (variable par construction avec un ancrage yeux). Style, anonymat, dignité, artefacts, chaleur humaine, filigrane, visage unique : inchangés.

## 6. Vérification demandée

Déploiement, puis régénération de **Kwame** et renormalisation de **Léa** avec la nouvelle logique, et livraison d'une planche comparative : rendu carré 1:1 et rendu dans le masque rond côte à côte, avec la ligne des yeux tracée et les mesures réelles (yeux %, remplissage du bord bas %, vide latéral bas %) — pour vérifier que les deux visages ont bien la même taille dans le rond.

## Détails techniques

- Fichiers modifiés : `_shared/avatarFramingSpec.ts`, `_shared/avatarNormalize.ts`, `_shared/avatarArtDirection.ts`, `qa-avatar/index.ts`, `normalize-avatar-framing/index.ts`, `generate-avatar/index.ts` (passage de la mesure yeux au normaliseur), + affichage cadrage du studio.
- Migration : ajout de `avatar_eye_y` et `avatar_face_center_x` (numeric, nullable) sur `beneficiaries`, avec les GRANT et policies existantes inchangées.
- Le pixel recadré reste la source de vérité (comme aujourd'hui) et `avatar_scale`/`offset_x`/`offset_y` sont remis à zéro après normalisation.
- Aucune modification de la logique de matching, du panier ou du tunnel de don.
- Une fois Kwame et Léa validés, passage en lot sur le reste du catalogue (200 avatars) avec la même fonction, sans crédit Lovable.
