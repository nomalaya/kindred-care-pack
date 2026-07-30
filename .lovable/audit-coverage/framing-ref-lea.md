# Cadrage — référence Léa (mesures visage)

## Pourquoi les planches précédentes ne correspondaient pas

Les repères étaient calculés sur la **silhouette** (haut des cheveux → point le plus
étroit du cou). Sur ces illustrations, ce point n'existe presque jamais (col, écharpe,
cheveux longs) : la hauteur de tête était alors estimée par un ratio. Deux avatars
annoncés « 62 % de tête » n'avaient donc pas du tout la même tête à l'écran.

Nouvelle mesure, faite avec un détecteur de visage (repères réels : yeux, boîte du
visage), hors ligne, sans crédit IA :

| Avatar | Hauteur du visage | Ligne des yeux | Menton | Zoom requis pour égaler Léa |
| --- | --- | --- | --- | --- |
| **Léa (référence)** | **39,8 %** | **38,0 %** | **62 %** | 1,00 |
| Kwame | 68,1 % | 48,4 % | 89 % | 0,58 |
| Marius | 55,2 % | 44,2 % | 78 % | 0,72 |
| Nguyen | 53,1 % | 39,8 % | 70 % | 0,75 |
| Aïcha | 53,5 % | 43,4 % | 76 % | 0,74 |

Les quatre avatars ont un visage **1,3 à 1,7 fois plus grand** que Léa dans le cadre.
C'est exactement l'hétérogénéité visible à l'œil nu.

## La règle cible (mesurée sur Léa)

- Ligne des yeux à **38 %** de la hauteur.
- Menton à **~50 %** : la tête fait la même hauteur que le corps visible.
- Tête (cheveux compris) ≈ **44 %** de la hauteur.
- Épaules + haut des bras remplissent toute la moitié basse, vêtement sortant par le bas.

## Ce qu'un recadrage ne peut pas faire

Pour ramener Kwame à la proportion de Léa il faudrait dézoomer à 0,58 : il manque alors
**32 % de hauteur de corps qui n'a jamais été dessinée**. Les deux seuls bouchages
possibles (répétition de la dernière ligne, miroir du bas) donnent des traînées et des
reflets grotesques — voir `framing-recrop-impossible.png`.

**Conclusion : ces avatars doivent être régénérés**, pas recadrés.

## Code livré

- `_shared/avatarNormalize.ts` : cibles remplacées par `EYE_LINE = 0.38`,
  `CHIN_LINE = 0.50`, `HEAD_FILL = 0.44`. Ajout de `MIN_ZOOM = 0.9` : au-delà, le
  recadrage est refusé et l'avatar est marqué `needsRegeneration` avec sa raison,
  au lieu d'être déformé.
- `_shared/avatarArtDirection.ts` : `FRAMING_BLOCK` impose désormais les proportions
  chiffrées (yeux 38 %, menton à mi-hauteur, tête ≤ 50 % du cadre) et interdit
  explicitement le gros plan visage.
- Fonctions `normalize-avatar-framing` et `generate-avatar` déployées.

## Étape suivante

Régénérer Kwame, Marius, Nguyen et Aïcha avec le nouveau `FRAMING_BLOCK` (ancres de
style Léa / Nguyen / Fatima inchangées), puis étendre au reste du catalogue signalé
`needsRegeneration`.
