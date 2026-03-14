

# Plan : Différenciation visuelle renforcée des cartes bénéficiaires

## Modifications

### 1. `src/lib/badgeStyles.ts` — Nouveaux maps + saturation badges

**Ajouter** deux nouvelles maps :

- `BADGE_BORDER_COLOR` : couleur CSS pour la bordure gauche 3px (ex: `"border-l-emerald-500"`, `"border-l-amber-500"`, etc.)
- `BADGE_GRADIENT` : inline style gradient pour le fond de carte (ex: `"linear-gradient(180deg, rgba(16,185,129,0.12) 0%, transparent 100%)"` pour emerald)

**Augmenter la saturation des badges** : passer les textes de `-700` à `-800` et les borders de `-500/40` à `-500/60` pour plus de visibilité.

**Ajouter helpers** :
- `getBorderColor(badge)` → retourne la classe Tailwind `border-l-*`
- `getCardGradient(badge)` → retourne un objet `style` avec le `background` gradient

Mapping des 16 familles :
| Famille | Bordure | Gradient top (12% opacity) |
|---------|---------|---------------------------|
| emerald | `border-l-emerald-500` | `rgba(16,185,129,0.12)` |
| blue | `border-l-blue-500` | `rgba(59,130,246,0.12)` |
| amber | `border-l-amber-500` | `rgba(245,158,11,0.12)` |
| indigo | `border-l-indigo-500` | `rgba(99,102,241,0.12)` |
| fuchsia | `border-l-fuchsia-500` | `rgba(217,70,239,0.12)` |
| red | `border-l-red-500` | `rgba(239,68,68,0.12)` |
| teal | `border-l-teal-500` | `rgba(20,184,166,0.12)` |
| slate | `border-l-slate-400` | `rgba(148,163,184,0.12)` |
| cyan | `border-l-cyan-500` | `rgba(6,182,212,0.12)` |
| violet | `border-l-violet-500` | `rgba(139,92,246,0.12)` |
| pink | `border-l-pink-500` | `rgba(236,72,153,0.12)` |
| orange | `border-l-orange-500` | `rgba(249,115,22,0.12)` |
| lime | `border-l-lime-500` | `rgba(132,204,22,0.12)` |
| purple | `border-l-purple-500` | `rgba(168,85,247,0.12)` |
| sky | `border-l-sky-500` | `rgba(14,165,233,0.12)` |
| stone | `border-l-stone-400` | `rgba(168,162,158,0.12)` |

### 2. `src/pages/BeneficiarySelection.tsx` — Appliquer les 3 effets

Sur chaque carte `motion.div` :
- **Supprimer** `${cardBg}` (fond Tailwind statique)
- **Ajouter** `style={getCardGradient(badge)}` pour le dégradé vertical
- **Ajouter** `border-l-[3px] ${getBorderColor(badge)}` aux classes
- Badge reste en `absolute top-3 right-3` (ajuster de `top-4 right-4` à `top-3 right-3` = 12px)
- Hover : conserver `hover:shadow-lg hover:-translate-y-1` + `group-hover:brightness-110` sur le badge

### 3. `src/pages/DonationFlow.tsx` — Harmoniser la carte bénéficiaire

Appliquer exactement le même style sur la carte bénéficiaire :
- `style={getCardGradient(badge)}` au lieu de `${cardBg}`
- `border-l-[3px] ${getBorderColor(badge)}`
- Badge en `absolute top-3 right-3`

### Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/lib/badgeStyles.ts` | Ajouter `BADGE_BORDER_COLOR`, `BADGE_GRADIENT`, helpers, augmenter saturation |
| `src/pages/BeneficiarySelection.tsx` | Gradient fond, bordure gauche, position badge 12px |
| `src/pages/DonationFlow.tsx` | Même gradient + bordure sur carte bénéficiaire |

### Ce qui ne change PAS
- Palette CSS, base de données, matching, composants fonctionnels, checkout

