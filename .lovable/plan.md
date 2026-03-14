

# Plan : Couleurs badges distinctes, position droite, badge sur page don

## 1. Couleurs plus contrastées entre badges

Le problème actuel : beaucoup de couleurs proches (indigo/violet, cyan/teal/sky, rose/pink, orange/amber, stone/slate). On réduit à **7 familles chromatiques bien distinctes** avec des saturations plus fortes.

Nouvelles couleurs dans `BADGE_STYLES` et `BADGE_CARD_BG` (fichier `BeneficiarySelection.tsx`) :

| Badge | Couleur badge | Fond carte |
|-------|--------------|------------|
| Proximité | emerald-600/emerald-100 | emerald-50/50 |
| Nouveau bénéficiaire | blue-600/blue-100 | blue-50/50 |
| Logement provisoire | amber-700/amber-100 | amber-50/50 |
| Démarches juridiques/admin | indigo-700/indigo-100 | indigo-50/50 |
| Très loin de sa famille | fuchsia-600/fuchsia-100 | fuchsia-50/50 |
| Désert médical | red-600/red-100 | red-50/50 |
| Zone rurale isolée | teal-700/teal-100 | teal-50/50 |
| Impact de l'inflation | slate-600/slate-100 | slate-50/50 |
| Apprend un nouveau métier | cyan-700/cyan-100 | cyan-50/50 |
| 1ère année universitaire | violet-600/violet-100 | violet-50/50 |
| Nourrisson / grossesse | pink-600/pink-100 | pink-50/50 |
| Difficile de vivre seul(e) | orange-600/orange-100 | orange-50/50 |
| Début de vie active | lime-700/lime-100 | lime-50/50 |
| Aidant familial | purple-700/purple-100 | purple-50/50 |
| Parcours de transition | sky-600/sky-100 | sky-50/50 |
| Manque de commerces/repères | stone-600/stone-100 | stone-50/50 |

Les fonds de badges passent de `-50` (très pâle) à `-100` (plus visible), et les textes sont plus saturés (ex: `text-red-600` au lieu de `text-rose-600`). Les fonds de cartes passent de `/40` à `/50` pour être plus perceptibles.

## 2. Badge en haut à droite

**Fichier** : `src/pages/BeneficiarySelection.tsx`
- Changer `absolute top-4 left-4` → `absolute top-4 right-4`

## 3. Badge + fond coloré sur la carte DonationFlow

**Fichier** : `src/pages/DonationFlow.tsx`
- Importer les maps `BADGE_STYLES`, `BADGE_CARD_BG`, `getBadgeStyle` depuis BeneficiarySelection (ou les extraire dans un fichier partagé `src/lib/badgeStyles.ts`)
- Récupérer le `context_badge` du bénéficiaire (déjà dans les données chargées via `beneficiaries_public`)
- Appliquer le fond coloré à la carte bénéficiaire : `bg-card` → `cardBg`
- Ajouter le badge en `absolute top-4 right-4` (même style que sur BeneficiarySelection)

### Extraction dans un fichier partagé

Créer `src/lib/badgeStyles.ts` contenant :
- `BADGE_STYLES`
- `BADGE_CARD_BG`
- `getBadgeStyle()`
- `getCardBg()`
- `genderizeBadge()`

Importer depuis ce fichier dans `BeneficiarySelection.tsx` et `DonationFlow.tsx`.

## Fichiers modifiés / créés

| Action | Fichier |
|--------|---------|
| Créer | `src/lib/badgeStyles.ts` |
| Modifier | `src/pages/BeneficiarySelection.tsx` (importer depuis badgeStyles, badge top-right) |
| Modifier | `src/pages/DonationFlow.tsx` (ajouter badge + fond coloré sur carte bénéficiaire) |

## Ce qui ne change PAS
- Matching, base de données, panier, paiement, edge functions
- Logique de sélection des badges (priorité, déduplication)
- Structure des cartes, hiérarchie prénom/âge/région

