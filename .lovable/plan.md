## Confirmation — l'ancrage stylistique est bien actif

Vérifié dans le code, la génération repartira bien de tout le travail d'homogénéité stylistique :

- `_shared/avatarStyleAnchors.ts` : références = **Léa, Nguyen, Fatima** uniquement (copies figées dans `avatars/style-anchors/`, Amadou explicitement exclu).
- `generate-avatar/index.ts` : `STYLE_ANCHOR_URLS` est chargé et envoyé comme **images de référence à chaque génération**.
- `_shared/avatarArtDirection.ts` : `STYLE_ANCHOR_BLOCK` (texte→image) et `STYLE_ANCHOR_BLOCK_EDIT` (édition) sont injectés dans les prompts, avec l'autorisation explicite des contours d'encre et le rejet du rendu vectoriel lisse côté QA.

Aucune de ces briques n'est modifiée par ce plan.

## Ce qui change par rapport au plan précédent

Le retraitement des 131 avatars depuis les originaux archivés est **abandonné** : ces originaux ne correspondent plus au style de référence. Le cadrage sera désormais validé sur de **nouvelles générations**, style anchors compris.

## 1. Cadrage calé sur le visage (au lieu des épaules)

La normalisation actuelle cale l'échelle sur la largeur des épaules — repère instable (vêtement, coiffure volumineuse, pose), d'où les tailles de tête et lignes de regard hétérogènes.

Nouvelle règle unique, appliquée à la génération :

```text
hauteur de tête  -> 46 % de la hauteur du canvas   (échelle)
ligne des yeux   -> 38 % de la hauteur du canvas   (position verticale)
centre du visage -> 50 % de la largeur             (position horizontale)
```

Détection déterministe (zéro crédit IA), plus robuste :
- haut du crâne = première ligne non vide ;
- bas de la tête = **cou** détecté comme la ligne la plus étroite entre 25 % et 70 % de la silhouette (remplace le « saut de largeur » qui se déclenche trop tôt sur les coiffures volumineuses) ;
- centre horizontal = centre de la bande du visage autour de la ligne des yeux ;
- **repli** sur le mode actuel si le cou n'est pas détectable — aucune erreur levée, aucun impact QA.

Garantie anti-coupure : si le bas de la silhouette retombe au-dessus du bord bas, l'image est descendue puis légèrement agrandie jusqu'à débordement franc. Plus de trait rectiligne ni de blanc sous le buste.

## 2. Test comparatif sur 3 nouveaux avatars

Sélection de 3 bénéficiaires dont l'avatar actuel est hors-style (générés avant l'ancrage, rendu vectoriel lisse), morphologies et coiffures volontairement différentes pour éprouver la détection (dont au moins une coiffure volumineuse et un profil âgé).

Pour chacun : génération complète via `generate-avatar` (prompts + ancres Léa/Nguyen/Fatima + QA existant), puis nouveau cadrage visage.

Livrables :
- avant / après par bénéficiaire ;
- rendu en rond profil (taille donateur réelle) côte à côte avec Léa, Nguyen et Fatima pour juger la cohérence de style **et** de cadrage ;
- métriques : hauteur de tête (%), ligne des yeux (%), centre horizontal (%), marge basse (%) ;
- score QA de chaque génération.

**Aucune généralisation** tant que ces 3 cas ne sont pas validés par vous.

## 3. Hors périmètre

Pas de modification du QA, des prompts artistiques, des ancres de style ni du parcours donateur. Pas de retraitement de masse. Les 55 avatars à fond opaque restent hors sujet. `BeneficiaryAvatar.tsx` reste en `object-cover` centré neutre.

## Détails techniques

- `supabase/functions/_shared/avatarNormalize.ts` : `SHOULDER_FILL` → `HEAD_FILL = 0.46`, réécriture de `detectLandmarks` (cou + centre facial), garantie de débordement bas, repli sûr.
- `supabase/functions/generate-avatar/index.ts` : la normalisation post-génération utilise le nouveau mode visage.
- Rapport de test : `.lovable/audit-coverage/framing-test-3.md`.
