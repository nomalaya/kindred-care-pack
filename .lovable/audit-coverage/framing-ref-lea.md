# Cadrage homogène — référence Léa

## Règle unique, ordre d'arbitrage

1. **Ligne des yeux à 31,5 %** de la hauteur du canvas — non négociable, identique pour tous.
2. **Aucun blanc sous le buste** — le vêtement sort par le bord bas.
3. **Hauteur de tête 62 %** (mesure de Léa) — cible souple, qui cède en premier, dans la limite de 72 %.

Au-delà de 72 % de hauteur de tête, on n'écrase plus l'image : l'avatar est marqué
`needs_regeneration` avec sa raison, pour être régénéré avec un cadrage source plus large.

Centre du visage : 50 % de la largeur.

## Génération : épaules + haut des bras

`FRAMING_BLOCK` demande désormais **tête + cou + épaules entières + haut des bras**
(jusqu'au biceps, manches visibles), coupe au niveau de la poitrine haute sous les
emmanchures, vêtement opaque touchant les bords gauche, droit et bas. Les yeux visés
à ~32 % et la tête à ~60 % sont explicitement écrits dans le prompt.

Style, ancres Léa/Nguyen/Fatima et QA : inchangés.

## Résultats (0 crédit IA, re-normalisation depuis la version publiée)

| Avatar | Zoom | Tête | Yeux | Centre | Marge basse | À régénérer |
| --- | --- | --- | --- | --- | --- | --- |
| Léa (réf.) | — | 62,1 % | 31,5 % | 50,7 % | 0 % | non |
| Kwame | ×1,001 | 62,0 % | 31,5 % | 50,0 % | 0 % | non |
| Marius | ×1,001 | 62,1 % | 31,5 % | 50,0 % | 0 % | non |
| Aïcha | ×1,062 | 62,0 % | 31,5 % | 50,0 % | 0 % | non |
| Nguyen | ×1,001 | 62,1 % | 31,5 % | 50,0 % | 0 % | non |

Aïcha, qui restait à 58,4 % au tour précédent, atteint désormais exactement la cible :
le plafond de zoom relevé lui permet de combler le bas sans casser la ligne des yeux.

Aucun des 4 n'est signalé `needs_regeneration`. Les prochaines générations produiront
directement des sources avec épaules + haut des bras, ce qui élargira la base du sujet
dans le rond profil.

Planche : `framing-homogeneite.png` (rangée haute = image avatar, rangée basse = rond
profil donateur, ligne rouge = ligne des yeux commune).
