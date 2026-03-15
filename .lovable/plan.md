

# Plan : Dégradé de fond unifié (primary) et fond d'avatar blanc

## Objectif
Remplacer les dégradés de fond colorés (spécifiques à chaque badge) par un dégradé unique basé sur la couleur primary, et rendre les avatars sur fond blanc pour qu'ils ressortent.

## Modifications

### 1. `src/lib/badgeStyles.ts` — Dégradé unifié primary

**Supprimer** la map `BADGE_GRADIENT` (lignes 88-113) qui définit des dégradés par badge.

**Modifier** `getCardGradient()` pour retourner un dégradé unique basé sur primary (HSL 157 68% 33% → #1F7A63) avec une opacité de 10% vers transparent :

```typescript
export function getCardGradient(): React.CSSProperties {
  return { 
    background: "linear-gradient(180deg, rgba(31, 122, 99, 0.10) 0%, transparent 100%)" 
  };
}
```

**Supprimer** `BADGE_CARD_BG` (lignes 57-82) qui n'est plus utilisé.

**Note** : La fonction `getCardGradient()` n'accepte plus de paramètre `badge` → mettre à jour les appels pour ne plus passer `badge`.

### 2. `src/components/BeneficiaryAvatar.tsx` — Fond blanc

**Modifier** le cercle de fond de l'avatar SVG (ligne 51) :

```tsx
// Avant
<circle cx="50" cy="50" r="50" fill="hsl(157, 68%, 93%)" />

// Après  
<circle cx="50" cy="50" r="50" fill="white" />
```

### 3. `src/pages/BeneficiarySelection.tsx` — Appel sans badge

**Modifier** l'appel à `getCardGradient()` (ligne 177) :

```tsx
// Avant
style={getCardGradient(badge)}

// Après
style={getCardGradient()}
```

### 4. `src/pages/DonationFlow.tsx` — Appel sans badge

**Modifier** l'appel à `getCardGradient()` (ligne 224) :

```tsx
// Avant
style={getCardGradient(badge)}

// Après
style={getCardGradient()}
```

## Résultat visuel attendu

- Toutes les cartes bénéficiaires ont le même dégradé vertical très léger (primary 10% → transparent)
- Les avatars ont un fond blanc pur et ressortent sur ce dégradé
- Les badges conservent leurs couleurs distinctes (pour la différenciation visuelle)
- Cohérence totale entre la page de sélection et la page de don

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/lib/badgeStyles.ts` | Supprimer BADGE_GRADIENT et BADGE_CARD_BG, modifier getCardGradient() pour dégradé primary unique |
| `src/components/BeneficiaryAvatar.tsx` | Changer fond avatar de vert clair à blanc |
| `src/pages/BeneficiarySelection.tsx` | Appeler getCardGradient() sans argument |
| `src/pages/DonationFlow.tsx` | Appeler getCardGradient() sans argument |

