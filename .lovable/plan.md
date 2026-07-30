## Cible : l'homogénéité de la planche de référence

Sur votre image de référence, ce qui rend la série homogène (indépendamment du style) tient à quatre invariants stricts, identiques sur les 6 portraits :

```text
ligne des yeux   -> même hauteur pour tous
taille de tête   -> même hauteur pour tous
centre du visage -> milieu de la largeur
bas du cadre     -> épaules + haut des bras, vêtement plein bord à bord
```

Aucun portrait ne montre de blanc sous le buste : le vêtement touche les deux bords latéraux et sort par le bas.

## 1. Cadrage : ligne des yeux de Léa comme ancre unique

Dans `supabase/functions/_shared/avatarNormalize.ts` :

- `EYE_LINE = 0.315` (mesure réelle de Léa) devient la contrainte prioritaire et non négociable : la ligne des yeux est calée là pour tous, sans exception.
- La hauteur de tête reste calée sur Léa (`HEAD_FILL = 0.62`) pour l'uniformité de la série, mais devient une cible souple : elle cède quand elle empêche de remplir le bas du cadre.
- Priorité d'arbitrage explicite en cas de conflit : (1) yeux à 31,5 %, (2) aucun blanc en bas, (3) taille de tête.
- Le centre du visage reste à 50 % de la largeur.

## 2. Quand l'image ne suffit pas : régénérer plus bas

Si, une fois les yeux calés, la matière disponible sous le menton ne remplit pas le bas du cadre, on ne fabrique pas un compromis en zoomant à l'excès : l'avatar est marqué comme à régénérer, avec un cadrage source plus large.

Le rapport de normalisation renvoie `needs_regeneration: true` + la raison. Pas d'erreur bloquante, pas de couche QA supplémentaire.

## 3. Génération : épaules + haut des bras

Le `FRAMING_BLOCK` de `supabase/functions/_shared/avatarArtDirection.ts` demande aujourd'hui une coupe « juste sous le haut du buste » — trop court, d'où le blanc résiduel. Nouvelle consigne, calquée sur Léa et sur votre référence :

- tête + cou + **épaules entières** + **haut des bras** (jusqu'au biceps), vêtement intégralement dessiné ;
- le bord bas coupe au niveau de la poitrine haute, sous les emmanchures — plus bas qu'aujourd'hui ;
- épaules atteignant les bords gauche et droit, vêtement opaque jusqu'au bord bas ;
- interdits conservés : taille, hanches, torse complet, bras pendants, fondu aquarelle, bande blanche sous le buste, ligne dessinée sous les épaules.

L'ancrage de style Léa / Nguyen / Fatima et le QA restent strictement inchangés — c'est bien l'homogénéité de cadrage qui est visée, pas le style.

## 4. Vérification

- Re-normalisation des 4 avatars déjà traités (Kwame, Marius, Aïcha, Nguyen) depuis leur version publiée, sans crédit IA.
- Régénération uniquement des cas signalés `needs_regeneration` (Aïcha probable : foulard + cheveux longs).
- Planche finale au format de votre référence : Léa + les 4, ligne des yeux tracée, plus le tableau des métriques (yeux %, tête %, centre %, marge basse %).

## Hors périmètre

Pas de retraitement des 131 avatars, pas de modification du style, du QA ni du parcours donateur.

## Détails techniques

- `_shared/avatarNormalize.ts` : arbitrage yeux > débordement bas > taille de tête, ajout de `needsRegeneration` au `NormalizeReport`.
- `_shared/avatarArtDirection.ts` : réécriture du `FRAMING_BLOCK` et ajustement des tokens négatifs liés.
- Rapport : `.lovable/audit-coverage/framing-ref-lea.md`.
