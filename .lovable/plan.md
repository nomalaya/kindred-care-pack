

# Plan : Badges intelligents basés sur l'analyse du contenu textuel

## Problème

Le badge est déterminé sans analyser `short_story` ni `emotional_sentence`. Résultat : 5 bénéficiaires avec enfants affichent "Difficile de vivre seule" (ex: Aïcha, 4 enfants ; Fatima, 3 enfants).

## Architecture

Tout se passe dans `src/lib/badgeStyles.ts`. Pas de migration SQL nécessaire — on corrige côté logique frontend.

## Modifications

### 1. `src/lib/badgeStyles.ts` — Refonte complète de la logique

**A. Enrichir `BeneficiaryBadgeInput`** avec les champs textuels et numériques :

```typescript
interface BeneficiaryBadgeInput {
  proximity_label?: string;
  created_at?: string;
  context_badge?: string;
  avatar_gender: string;
  children_count?: number;
  short_story?: string;
  emotional_sentence?: string;
}
```

**B. Nouvelle fonction `analyzeProfileContext(b)`** — détection par mots-clés dans `short_story + emotional_sentence` :

| Signal détecté | Mots-clés (exemples) | Badge retourné |
|---|---|---|
| Parentalité | enfant, enfants, adolescent, bébé, maman, papa, fils, fille, famille, élever | `Aidant familial` |
| Isolement | seul, seule, isolé, isolée, solitude, coupé du monde | `Difficile de vivre seul(e)` (genré) |
| Logement | logement, hébergement, SDF, sans domicile, relogement | `Logement provisoire` |
| Démarches | administratif, juridique, démarches, papiers, titre de séjour | `Démarches administratives en cours` |
| Santé / médical | médical, hôpital, traitement, maladie, diagnostic, médicaments | `Désert médical` |
| Formation / études | étudiant, formation, université, diplôme, apprentissage | `Apprend un nouveau métier` |
| Grossesse / nourrisson | grossesse, enceinte, nourrisson, naissance | `1ère grossesse` ou `Nourrisson arrivé récemment` |
| Rural | rural, isolée géographiquement, campagne | `Zone rurale isolée` |

Retourne le premier match trouvé (priorité dans l'ordre du tableau). Retourne `null` si aucun signal.

**C. Nouvelle fonction `isBadgeCoherent(badge, b)`** — garde-fou :

- `"Difficile de vivre seul(e)"` + `children_count > 0` → **incohérent**
- `"Aidant familial"` + `children_count === 0` et pas de mention famille dans le texte → **incohérent**
- `"1ère grossesse"` / `"Nourrisson arrivé récemment"` + `avatar_gender === "man"` → **incohérent**

Retourne `false` si incohérent.

**D. Nouvelle hiérarchie dans `getDisplayBadge`** :

```
1. proximity_label (inchangé)
2. analyzeProfileContext(b) — badge issu du texte, vérifié par isBadgeCoherent
3. context_badge (si cohérent avec isBadgeCoherent)
4. "Nouveau bénéficiaire inscrit" (si < 30 jours)
5. DEFAULT_BADGE
```

À chaque étape, le badge candidat passe par `isBadgeCoherent`. S'il échoue, on passe au suivant.

**E. Simplifier `deduplicateBadges`** :

- Autoriser les doublons si le badge est cohérent (plus de remplacement forcé absurde)
- Tenter une déduplication légère : si doublon, essayer `context_badge` ou analyse texte alternative
- Ne jamais forcer un badge aléatoire depuis `BADGE_STYLES`

```typescript
export function deduplicateBadges(beneficiaries: BeneficiaryBadgeInput[]): string[] {
  const result: string[] = [];
  const usedBadges = new Set<string>();

  for (const b of beneficiaries) {
    let badge = getDisplayBadge(b);
    if (usedBadges.has(badge)) {
      // Tenter context_badge comme alternative
      if (b.context_badge) {
        const alt = genderizeBadge(b.context_badge, b.avatar_gender);
        if (!usedBadges.has(alt) && isBadgeCoherent(alt, b)) badge = alt;
      }
      // Sinon, accepter le doublon plutôt qu'un badge absurde
    }
    usedBadges.add(badge);
    result.push(badge);
  }
  return result;
}
```

### 2. `src/pages/BeneficiarySelection.tsx`

Passer `short_story`, `emotional_sentence` et `children_count` dans les objets transmis à `deduplicateBadges` (ces champs sont déjà dans l'interface `Beneficiary` locale).

### 3. `src/pages/DonationFlow.tsx`

Passer `short_story`, `emotional_sentence` et `children_count` à `getDisplayBadge` pour le fallback (quand `navBadge` est absent).

### 4. Persistance (inchangée)

Le badge reste calculé une fois et passé via `location.state.displayBadge` entre les pages.

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/lib/badgeStyles.ts` | Ajout `analyzeProfileContext`, `isBadgeCoherent`, refonte `getDisplayBadge` et `deduplicateBadges` |
| `src/pages/BeneficiarySelection.tsx` | Passer champs textuels + `children_count` au calcul de badge |
| `src/pages/DonationFlow.tsx` | Idem pour le fallback |

## Résultat attendu

Aïcha (4 enfants) → texte mentionne "adolescents" → badge **"Aidant familial"** au lieu de "Difficile de vivre seule". Léa (1 enfant, short_story mentionne "petit") → **"Aidant familial"**. Mikhail (0 enfant, texte mentionne "solitude") → **"Difficile de vivre seul"** (cohérent).

