

# Plan : Badge unique cohérent + strictement différents entre les 4 cartes

## Problème

1. `getDisplayBadge` place "Nouveau bénéficiaire inscrit" avant `context_badge`, écrasant un badge plus pertinent
2. `deduplicateBadges` ne garantit pas la stricte unicité — si tous les fallbacks sont épuisés, un doublon peut passer
3. `DonationFlow` recalcule le badge indépendamment, produisant un badge différent de celui affiché sur la page de sélection

## Modifications

### 1. `src/lib/badgeStyles.ts`

**Inverser la priorité dans `getDisplayBadge`** : `context_badge` avant "Nouveau bénéficiaire inscrit"

```typescript
export function getDisplayBadge(b: BeneficiaryBadgeInput): string {
  if (b.proximity_label) return b.proximity_label;
  if (b.context_badge) return genderizeBadge(b.context_badge, b.avatar_gender);
  if (isNewBeneficiary(b.created_at)) return "Nouveau bénéficiaire inscrit";
  return DEFAULT_BADGE;
}
```

**Renforcer `deduplicateBadges`** pour garantir que les 4 badges sont strictement différents. Quand un badge est en collision, tenter dans l'ordre : "Nouveau bénéficiaire inscrit" (si applicable), `DEFAULT_BADGE`, puis piocher dans la liste complète de `BADGE_STYLES` un badge non encore utilisé.

```typescript
export function deduplicateBadges(beneficiaries: BeneficiaryBadgeInput[]): string[] {
  const usedBadges = new Set<string>();
  const result: string[] = [];
  const allBadgeKeys = Object.keys(BADGE_STYLES);

  for (const b of beneficiaries) {
    let badge = getDisplayBadge(b);
    if (usedBadges.has(badge)) {
      const newLabel = isNewBeneficiary(b.created_at) ? "Nouveau bénéficiaire inscrit" : null;
      if (newLabel && !usedBadges.has(newLabel)) {
        badge = newLabel;
      } else if (!usedBadges.has(DEFAULT_BADGE)) {
        badge = DEFAULT_BADGE;
      } else {
        // Dernier recours : un badge non utilisé
        const fallback = allBadgeKeys.find(k => !usedBadges.has(k));
        if (fallback) badge = fallback;
      }
    }
    usedBadges.add(badge);
    result.push(badge);
  }
  return result;
}
```

### 2. `src/pages/BeneficiarySelection.tsx`

Passer le badge calculé dans le `state` du `Link` vers `/donate/:id` :

```tsx
<Link
  to={`/donate/${b.id}`}
  state={{ displayBadge: badge }}
  onClick={() => handleClickAider(b.id)}
>
```

### 3. `src/pages/DonationFlow.tsx`

Lire le badge depuis `location.state` pour réutiliser exactement celui de la page de sélection. Fallback sur `getDisplayBadge` si accès direct.

Ajouter `useLocation` à l'import de react-router-dom, puis :

```tsx
const location = useLocation();
const navBadge = (location.state as { displayBadge?: string } | null)?.displayBadge;
// Dans le render, utiliser navBadge || getDisplayBadge(beneficiary)
```

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/lib/badgeStyles.ts` | Inverser priorité `getDisplayBadge`, renforcer unicité stricte dans `deduplicateBadges` |
| `src/pages/BeneficiarySelection.tsx` | Passer `displayBadge` dans le state du Link |
| `src/pages/DonationFlow.tsx` | Lire badge depuis `location.state`, fallback `getDisplayBadge` |

