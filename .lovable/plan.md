## Objectif

Faire de l'avatar de **Léa** la référence unique de cadrage et de centrage, puis appliquer exactement ce cadrage à **Kwame, Marius, Aïcha et Nguyen**. Aucun crédit IA : uniquement de la recomposition déterministe des pixels existants.

## 1. Mesurer Léa (calibration)

Les constantes actuelles (`HEAD_FILL = 0.46`, `EYE_LINE = 0.38`) ont été choisies à la main, pas déduites de Léa. Première étape : passer l'avatar publié de Léa dans le détecteur existant (`detectLandmarks`) et relever ses valeurs réelles :

```text
hauteur de tête  (% du canvas)
ligne des yeux   (% du canvas)
centre du visage (% de la largeur)
marge basse      (% du canvas)
```

Ces quatre valeurs deviennent la cible officielle. Rien n'est écrit à cette étape — les chiffres mesurés sont affichés avant application.

## 2. Recalibrer les constantes sur Léa

Dans `supabase/functions/_shared/avatarNormalize.ts` : `HEAD_FILL` et `EYE_LINE` prennent les valeurs mesurées sur Léa (au lieu des valeurs arbitraires actuelles), avec un commentaire indiquant explicitement que la référence est Léa. La logique de détection (cou, repli sur ratio tête, garantie de débordement bas) reste inchangée.

## 3. Appliquer aux 4 bénéficiaires

Normalisation déterministe de Kwame, Marius, Aïcha et Nguyen à partir de leur avatar **actuellement publié** (pas des originaux archivés, dont le style est obsolète) via la fonction `normalize-avatar-framing`, en ciblant uniquement ces 4 identifiants.

Chaque avatar est archivé avant écrasement, et `avatar_scale` / `avatar_offset_x` / `avatar_offset_y` sont remis à neutre.

Note : Léa elle-même est déjà à la cible par définition — elle n'est pas retraitée.

## 4. Vérification

Livrable visuel : planche avant/après des 4 avatars, plus un rendu en rond profil (taille donateur réelle) des 5 (Léa incluse) côte à côte, accompagné du tableau des métriques mesurées pour prouver l'alignement sur Léa.

Aucune généralisation aux autres avatars du catalogue tant que ce comparatif n'est pas validé.

## Hors périmètre

Pas de nouvelle génération d'image, pas de modification du QA, des prompts, des ancres de style ni du parcours donateur. `BeneficiaryAvatar.tsx` reste inchangé.

## Détails techniques

- Script de mesure en lecture seule sur l'avatar de Léa, réutilisant `detectLandmarks` / `normalizeAvatarFraming` en mode dry-run.
- `_shared/avatarNormalize.ts` : mise à jour des seules constantes `HEAD_FILL` et `EYE_LINE`.
- `normalize-avatar-framing/index.ts` : ajout d'une option pour forcer la source « avatar actuel » plutôt que l'archive `pre-normalize/`.
- Rapport : `.lovable/audit-coverage/framing-ref-lea.md`.
