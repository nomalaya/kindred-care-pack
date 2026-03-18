

# Plan : Corriger l'impact dynamique (types manquants + calibration)

## Diagnostic

Le problème est un **désalignement de données** entre deux tables, pas un bug de code :

| Table `impact_profiles` référence | Table `impact_units` contient | Résultat |
|---|---|---|
| `kids_snacks` | ~~`kids_care_days`~~ / ~~`kids_items`~~ | **0 match → impact = 0** |
| `quick_meals` | *(absent)* | **0 match → impact = 0** |
| `meals` | `meals` (160 entrées) | OK |
| `hygiene_days` | `hygiene_days` (147 entrées) | OK |
| `daily_products` | `daily_products` (130 entrées) | OK |
| `breakfasts` | `breakfasts` (70 entrées) | OK |

Quand un bénéficiaire a le profil `kids_snacks` ou `quick_meals`, l'impact affiché reste à 0 car aucun `impact_unit` ne correspond. Le code du composant (high-water mark, fetch unique) est correct.

## Corrections

### 1. Renommer les impact_units existants

```sql
-- kids_care_days + kids_items → kids_snacks
UPDATE impact_units SET impact_type = 'kids_snacks' WHERE impact_type IN ('kids_care_days', 'kids_items');
```

### 2. Ajouter les `quick_meals` manquants

Créer des entrées `quick_meals` pour les produits alimentaire/comfort (biscuits, barres, snacks) et boissons — ~100 produits qui correspondent à des repas rapides ou collations.

```sql
INSERT INTO impact_units (product_id, impact_type, impact_value)
SELECT id, 'quick_meals',
  CASE WHEN price <= 2 THEN 1 WHEN price <= 4 THEN 2 ELSE 3 END
FROM products
WHERE category IN ('alimentaire', 'boissons')
  AND emotional_family = 'comfort'
  AND is_active_product = true;
```

### 3. Calibrer les valeurs pour un impact croissant

Vérifier et ajuster les `impact_value` pour que la somme totale augmente de manière cohérente entre les paliers 18€ → 90€. Objectif :

| Palier | meals | kids_snacks | hygiene_days |
|---|---|---|---|
| 18€ | ~4 jours | ~3 | ~2 jours |
| 36€ | ~9 jours | ~6 | ~4 jours |
| 60€ | ~2 semaines | ~10 | ~1 semaine |
| 90€ | ~3 semaines | ~15 | ~2 semaines |

### 4. Ajouter `wellbeing` et `baby_care` au IMPACT_LABELS frontend

Le composant `DonationImpactCard.tsx` ne gère pas encore les types `wellbeing` et `baby_care` mentionnés dans la spec. Ajouter :

```typescript
wellbeing: { emoji: "🌿", label: (v) => `${v} moment${v > 1 ? "s" : ""} de bien-être` },
baby_care: { emoji: "👶", label: (v) => `${formatDuration(v)} de soins bébé` },
```

Et créer les impact_profiles et impact_units correspondants pour les situations bébé/bien-être.

## Ce qui ne change PAS

- `composeBasket()` — pas modifié
- `DonationImpactCard` logique (high-water mark, fetch unique) — déjà correcte
- Badges, matching_rules, profile_mappings

## Étapes d'exécution

1. SQL : renommer `kids_care_days`/`kids_items` → `kids_snacks`
2. SQL : insérer `quick_meals` pour produits comfort
3. SQL : insérer `wellbeing` pour produits bien-être, `baby_care` pour produits bébé
4. SQL : mettre à jour quelques `impact_profiles` pour utiliser `wellbeing`/`baby_care` sur les situations pertinentes
5. Code : ajouter `wellbeing` et `baby_care` dans `IMPACT_LABELS` du composant

