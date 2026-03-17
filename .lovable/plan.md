

# Plan : Ajouter l'effet hover sur le badge dans la page de don

## Problème

Dans `DonationFlow.tsx`, la carte bénéficiaire :
1. N'a pas la classe `group` sur le conteneur (ligne 225)
2. N'a pas `group-hover:brightness-110 transition-all` sur le Badge (ligne 235)

Alors que `BeneficiarySelection.tsx` les a bien (lignes 175 et 195).

## Modifications — `src/pages/DonationFlow.tsx`

**Ligne 225** : Ajouter `group` à la classe du conteneur card :
```tsx
className={`group rounded-2xl p-8 shadow-card border text-center relative`}
```

**Ligne 235** : Ajouter `group-hover:brightness-110 transition-all` au Badge :
```tsx
className={`py-1.5 px-3 rounded-2xl text-xs font-semibold group-hover:brightness-110 transition-all ${badgeStyle}`}
```

Un seul fichier modifié, deux lignes changées.

