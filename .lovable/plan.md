# Lot test « Diversifier » — 20 profils, coût IA nul

## Pourquoi le coût est nul
Le remix n'écrit que des attributs texte en base (`avatar_skin_tone`, `avatar_nose`, `avatar_face_shape`, coiffure, morphologie, vêtements, expression, posture). Aucune image n'est appelée : ni Lovable AI, ni Google AI Studio. Le seul coût éventuel viendrait d'une régénération d'image, qui n'est **pas** dans ce lot.

## Composition du lot test (20 profils)
Échantillon représentatif plutôt qu'aléatoire, pour couvrir tous les risques phénotypiques :
- 2 profils par groupe phénotypique × 6 groupes = 12 (1 homme + 1 femme quand disponible)
- 4 profils portant un couvre-chef (voile/foulard) — cas le plus sensible
- 2 profils actuellement en incohérence détectée (parmi les 144)
- 2 profils sans groupe identifiable (fallback neutre)

Exclusions : profils `locked`, et aucun changement des champs verrouillés (genre, tranche d'âge, couvre-chef, culture_tags, aides mobilité, niveaux psychosociaux, pilosité/calvitie).

## Étapes
1. Sélection du lot via requête lecture seule, sur les 200 profils actifs, selon les critères ci-dessus.
2. Simulation `remixAttributes` sur ces 20 profils et production d'un tableau AVANT / APRÈS champ par champ, plus contrôle « 0 incohérence ».
3. Écriture en base des 20 patchs. `avatar_status` / `avatar_workflow_status` **inchangés** : les images publiées actuelles restent servies telles quelles.
4. Rapport final : dominance des traits sur le lot avant/après, liste des champs protégés non touchés, et diff complet lisible.

## Ce qui n'est pas fait dans ce lot
- Aucune régénération d'image, donc l'apparence visible ne change pas encore. Les nouveaux attributs ne se traduiront en visuels que lors d'une régénération ultérieure, que vous validerez séparément (c'est là que le coût Google AI Studio apparaîtra, ~20 images).
- Les 180 autres profils sont laissés intacts jusqu'à votre feu vert.

## Détails techniques
- Moteur : `src/lib/avatarRemix.ts` (déterministe, graine = hash de l'id → même résultat à chaque exécution).
- Garde-fous : `src/lib/phenotypeRanges.ts` via `enforcePhenotypeCoherence`, appliqué après tirage.
- Rapport : réutilisation de la logique de `scripts/remix-report.ts`, restreinte aux 20 ids du lot.
- Écriture : `update` par id sur `beneficiaries`, uniquement les clés présentes dans le patch.