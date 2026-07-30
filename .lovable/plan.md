## Objectif corrigé
On ne cherche **pas** à donner la même taille de tête à tout le monde — ce serait justement incohérent (une personne corpulente a un visage plus large, une autre un visage allongé). On cherche à donner à tous **la même « prise de vue »** : même distance de caméra, même hauteur de regard. Les morphologies restent visibles, mais rien ne saute à l'œil quand le donateur fait défiler les profils.

## La règle unique
Un seul repère anatomique stable, identique pour tous : **la largeur des épaules** (donne l'échelle) et **la ligne des yeux** (donne la hauteur).

```text
canvas 1024 x 1024
largeur des épaules   -> 95 % de la largeur du canvas   (échelle)
ligne des yeux        -> 38 % de la hauteur du canvas    (position verticale)
centre horizontal     -> milieu des épaules
bas du buste          -> déborde par le bord bas (inchangé)
```

Conséquence : deux personnes cadrées à la même distance ; un visage plein reste plein, un visage allongé reste allongé. Aucune déformation, aucun redimensionnement du visage entre bénéficiaires.

Détection sans IA, sur la silhouette déjà calculée (bbox alpha) :
- largeur des épaules = largeur maximale de la silhouette dans sa moitié haute ;
- ligne des yeux ≈ 40 % de la hauteur de la tête, la tête s'arrêtant là où la largeur augmente brusquement (naissance des épaules).

Si l'un des deux repères n'est pas détectable, on garde exactement le comportement actuel — jamais d'erreur, jamais de rejet.

## Ce qui change (3 points, rien de plus)
1. `supabase/functions/_shared/avatarNormalize.ts` : la cible « hauteur du buste » devient « épaules à 95 % / yeux à 38 % », avec repli sur la logique actuelle. Même fonction, même signature : aucun appelant à modifier.
2. Rejouer `normalize-avatar-framing` sur les **131 avatars détourés uniquement**, en repartant des originaux archivés dans `pre-normalize/` (pas de double recadrage). Les nouveaux avatars passent automatiquement par la même règle à la génération.
3. `src/components/BeneficiaryAvatar.tsx` : le cadrage étant dans les pixels, l'affichage passe en `object-cover` centré neutre, pour que le rond profil montre la même zone partout.

## Ce qui ne change pas
- Aucun nouveau critère QA, aucun seuil, aucun hard-fail : `qa-avatar` n'est pas touché.
- Aucun appel IA, aucun crédit consommé (Lovable comme Google).
- Les 55 avatars à fond opaque ne sont pas traités.
- Matching, panier, tunnel de don : intacts. Originaux toujours archivés.

## Contrôle avant/après
Dry-run sur un échantillon (Léa + 5 profils de morphologies différentes) affichant largeur d'épaules et hauteur de regard avant/après, puis vérification visuelle de plusieurs ronds profil côte à côte, avant de lancer les 131.
