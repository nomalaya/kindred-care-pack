## Ce qui ne va pas

Le cadrage actuel cale un seul repère : la « hauteur de tête » estimée à partir de la silhouette (haut des cheveux → point le plus étroit du cou). Ce repère est instable :

- une coiffure volumineuse, un voile ou un chignon rallongent la « tête » mesurée ;
- quand le cou n'est pas détectable, la hauteur est estimée par un ratio.

Résultat : deux avatars affichés à « 62 % de tête » n'ont pas du tout le même visage à l'écran, et la ligne des yeux calculée dérive avec eux. C'est exactement ce que vous voyez sur la planche.

Votre critère est plus simple et plus juste : **chez Léa, la tête occupe à peu près la même hauteur que ce qu'on voit du corps en dessous.** Autrement dit, le menton tombe à peu près à mi-hauteur du cadre.

## La règle cible

Deux repères anatomiques réels, mesurés sur Léa, appliqués à tous :

```text
  ┌──────────────────────┐  0 %
  │        cheveux       │
  │   ●──────────●  yeux │  ← ligne des yeux : hauteur mesurée chez Léa
  │        visage        │
  │─────── menton ───────│  ← ~50 % : tête = corps visible
  │   épaules / bras     │
  └──────────────────────┘  100 %  (vêtement sortant par le bas)
```

- **Menton à la hauteur mesurée chez Léa** (attendu ≈ 50 %) → la tête fait la même hauteur que le corps visible.
- **Yeux à la hauteur mesurée chez Léa** → même regard, même inclinaison de cadre.

Ces deux points fixent à la fois l'échelle et la position verticale, sans jamais dépendre des cheveux, d'un voile ou de la largeur d'épaules. La contrainte « aucun blanc en bas » reste appliquée en dernier recours.

## Étapes

1. **Re-mesurer Léa** avec détection menton + yeux, et publier les valeurs exactes lues (pas de constantes devinées).
2. **Remplacer l'ancrage** dans `avatarNormalize.ts` : les cibles `HEAD_FILL` / cou disparaissent au profit de `CHIN_LINE` et `EYE_LINE`. L'échelle découle de la distance yeux→menton, la translation cale le menton.
3. **Fiabiliser la détection du menton** : bas de la zone visage (peau/traits) au-dessus du cou, indépendante de la chevelure ; si le visage n'est pas lisible, l'avatar est signalé plutôt que recadré au hasard.
4. **Aligner le prompt de génération** sur la même grammaire : menton à mi-hauteur, épaules et haut des bras remplissant la base.
5. **Planche de contrôle** : Léa + Kwame + Marius + Aïcha + Nguyen, avec deux lignes tracées (yeux et menton) et le rond profil, pour valider à l'œil nu avant toute généralisation.

Aucun crédit IA : recadrage déterministe à partir des avatars publiés.

## Détails techniques

- `supabase/functions/_shared/avatarNormalize.ts` : `HEAD_FILL`, `HEAD_FILL_MAX` et l'estimation par ratio de cou sont retirés ; nouvelles constantes `EYE_LINE` et `CHIN_LINE` calibrées sur la mesure réelle de Léa. Facteur d'échelle = `(CHIN_LINE − EYE_LINE) × H ⁄ (chin_px − eye_px)`.
- Ordre d'arbitrage : (1) menton, (2) yeux, (3) zéro blanc en bas ; si le vêtement source est trop court, l'avatar est marqué `needs_regeneration` avec sa raison, sans écraser les deux premiers repères.
- `supabase/functions/_shared/avatarArtDirection.ts` : `FRAMING_BLOCK` reformulé sur les mêmes proportions.
- `supabase/functions/normalize-avatar-framing/index.ts` : rapport enrichi (`chinLine`, `eyeLine`, écart à la référence Léa).
- Rapport et planche mis à jour dans `.lovable/audit-coverage/framing-ref-lea.md`.
