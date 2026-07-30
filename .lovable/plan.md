## Objectif

Verrouiller la direction artistique des avatars sur **trois références uniques : Léa, Nguyen, Fatima**. Amadou n'est jamais utilisé comme référence de style (ni image d'ancrage, ni exemple).

## État vérifié

- Aucun mécanisme d'ancrage stylistique n'existe aujourd'hui : `supabase/functions/generate-avatar/index.ts` génère les nouveaux avatars en pur texte-vers-image, sans image de référence (recherche sur `STYLE_REF`/`reference` : seules les branches d'édition image-to-image utilisent une image, celle du bénéficiaire lui-même).
- Le bloc `STYLE` de `supabase/functions/_shared/avatarArtDirection.ts` interdit explicitement traits d'encre, grain et texture — ce qui pousse vers le rendu vectoriel lisse observé sur Amadou, alors que Léa / Nguyen / Fatima ont un rendu dessiné-main.
- Les trois références retenues (identifiées en base sur leurs récits) :
  - Léa — `de8c19bc-8643-4af8-8bc0-31a57f79cd61`
  - Nguyen — `9d732054-631f-4bf7-9b95-8ec2bb39cf55`
  - Fatima — `74b5717d-d1e0-47df-bcab-eaf68904e4a9`

## Étapes

1. **Créer un registre de références de style** (nouveau fichier `supabase/functions/_shared/avatarStyleAnchors.ts`) : les 3 URLs d'images ci-dessus, figées (copie stable dans le bucket `avatars/style-anchors/` pour ne pas dépendre d'une régénération future de ces trois profils), avec un commentaire indiquant qu'Amadou est exclu.
2. **Réaligner le bloc `STYLE`** dans `avatarArtDirection.ts` sur le rendu réel des 3 références : illustration dessinée main, contours fins encrés lisibles, ombrage doux, léger grain, palette chaude désaturée, fond blanc. Suppression des interdictions contradictoires (« no ink strokes », « no visible texture »).
3. **Injecter les images d'ancrage dans la génération** : dans `generate-avatar/index.ts`, mode texte-vers-image → envoyer les 3 images de référence en entrée avec la consigne « reproduis ce style graphique, pas ces visages » (identité, phénotype et attributs viennent uniquement du prompt). Les modes édition conservent l'image du bénéficiaire comme base et reçoivent les ancrages comme référence de style secondaire.
4. **Aligner le QA** (`qa-avatar/index.ts`) : critère `style_match` reformulé sur le style dessiné-main des 3 références ; le rendu vectoriel lisse type Amadou devient un échec explicite.
5. **Test de contrôle** sur 3 bénéficiaires sans avatar : vérification visuelle de la cohérence avec Léa / Nguyen / Fatima et des scores QA, avant toute nouvelle vague.

## Détails techniques

- Aucun changement de schéma, d'UI, ni de logique de matching / panier.
- Le routage image reste inchangé (`imageProvider.ts`, clé Google directe) — pas de crédits Lovable pour la génération.
- Coût du test de contrôle : 3 images côté Google (~0,12 $).

## À noter

Si vous préférez d'autres versions précises de Léa, Nguyen ou Fatima que celles identifiées ci-dessus, indiquez-les et je fige ces images-là comme ancrages.
