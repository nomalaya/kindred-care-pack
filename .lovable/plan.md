## Réponse à vos 2 questions (vérifié avant tout appel IA)

**1. L'ancrage de style est-il réellement pris en compte ?** Oui, côté code : les 3 références (Léa, Nguyen, Fatima) sont bien servies (HTTP 200 sur `avatars/style-anchors/`), injectées dans le prompt (`STYLE_ANCHOR_BLOCK`) **et** envoyées comme images au modèle dans les deux chemins (`generateImage` texte→image et `generateEditedImage` image→image). En revanche l'effet n'a **jamais été validé visuellement** : le test de contrôle s'est arrêté sur le 429 Google. Les avatars actuels (Olga et les autres du lot) ont été générés **avant** l'ancrage — leur incohérence stylistique est donc attendue et ne prouve rien.

**2. Pourquoi les avatars sont coupés / petits dans le rond ?** Cause trouvée, et c'est bien une consigne qui traîne. Dans `FRAMING_BLOCK` (`avatarArtDirection.ts`) :

```text
SUBJECT SIZE — TARGET: the subject occupies approximately 70% of the canvas.
AT LEAST 12% of pure white margin MUST remain visible on EACH of the four sides.
The subject must NEVER touch any edge of the canvas.
```

Mesure réelle des marges transparentes sur 5 avatars publiés (1024×1024) :

```text
Jean-Pierre  marges G/H/D/B : 9 / 13 / 10 / 9 %
Léa         19 / 16 / 18 / 16 %
Fatima      15 / 14 / 18 / 15 %
Maria       18 / 14 / 17 / 14 %
Irina       24 / 17 / 24 / 18 %
```

Conséquences exactes de ce que vous voyez : le sujet ne remplit que 50–70 % du carré, avec un vide en bas → dans le rond (crop circulaire d'un carré) il paraît minuscule et « flottant », et le bas du buste ne dépasse pas. La variabilité (9 % à 24 %) explique l'incohérence d'un profil à l'autre. Le cadrage stocké est neutre partout (`avatar_scale=1, offset=0/0`), il ne compense rien.

## Plan de correction

### Étape 1 — Cadrage cible unique (prompt)
Réécrire `FRAMING_BLOCK` : suppression des consignes de marges de 12 %, de « 70 % du canvas » et de « never touch any edge » (et retrait de `edge-to-edge subject` des interdits). Nouvelle règle unique : buste cadré serré, **les épaules sortent par les bords gauche et droit**, le bas du buste **sort par le bord bas** (pas de blanc sous le buste), seule une petite marge blanche au-dessus de la tête (~5–8 %). Le blanc reste uniquement en fond autour de la tête/épaules.

### Étape 2 — Normalisation déterministe, zéro crédit IA
Ajouter une normalisation géométrique appliquée après génération **et** rétroactivement à tous les avatars existants : détection de la boîte englobante alpha, puis recomposition dans un carré 1024×1024 selon une règle fixe (haut du crâne à ~6 % du haut, largeur du sujet cadrée pour remplir, bas du sujet au ras du bord bas). Résultat : tous les avatars actuels deviennent cohérents et remplissent le rond **sans aucune régénération**. Aucun avatar n'est écrasé sans sauvegarde de l'original.

### Étape 3 — QA bloquant sur le cadrage
Dans `qa-avatar` : remplacer les critères de marge par un critère `framing_fill` bloquant — rejet si marge blanche en bas, si le sujet flotte au centre, si coupe circulaire ou ligne de coupe rectiligne dessinée. Le critère `background_quality` (blanc uni plein cadre) est conservé.

### Étape 4 — Rendu du rond profil (frontend)
`BeneficiaryAvatar` : garantir un remplissage identique pour tous (image normalisée + `object-cover`, ancrage haut), afin que le rond donateur soit visuellement homogène partout (sélection, panier, dashboard, studio).

### Étape 5 — Validation économe en crédits Google
1. Normalisation rétroactive et vérification visuelle **sans aucun crédit**.
2. Puis **1 seul avatar** généré pour valider l'ancrage de style + le nouveau cadrage.
3. Validation par vous, puis seulement ensuite le lot complet des bénéficiaires sans avatar.

## Détails techniques
- `supabase/functions/_shared/avatarArtDirection.ts` : `FRAMING_BLOCK` réécrit, listes négatives ajustées.
- `supabase/functions/clean-avatar-background/index.ts` (imagescript) : ajout de l'étape bbox + recomposition ; réutilisée par un mode `normalize-only` pour le rattrapage rétroactif.
- `supabase/functions/qa-avatar/index.ts` : dimension `framing_fill` avec seuil de rejet dur.
- `src/components/BeneficiaryAvatar.tsx` : cohérence du crop circulaire.
- Le moteur de matching, de panier et le tunnel de don ne sont pas touchés.
