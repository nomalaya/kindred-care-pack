

# Corriger l'affichage des impacts

## Problèmes identifiés

### P1 — 135 produits sans impact_units (19% du catalogue)
Les produits ajoutés lors de l'expansion du catalogue n'ont jamais reçu d'entrées dans `impact_units`. Quand le basket engine les sélectionne, l'impact card ne peut rien calculer.

Exemple concret — panier de Fatima à 35€ :
- Henné neutre → **0 impact_units**
- Savon de Marseille → **0 impact_units**
- Concentré de tomates → **0 impact_units**
- Haricots rouges secs → **0 impact_units**
- Ghassoul → **0 impact_units**
- Gant exfoliant traditionnel → 3 impact_units ✓

Résultat : seul 1 produit sur 6 contribue aux impacts → valeurs très basses, indicateur "meals" absent.

### P2 — Fallback basket avec anciens seuils
`DonationFlow.tsx` ligne 148 utilise `>= 36` (ancien palier) au lieu de `>= 35` (nouveau). À 35€ le tier calculé est trop bas.

### P3 — Impact_units incohérents
Des produits d'hygiène ont un impact_type `meals` (ex: Gant exfoliant → meals: 0.75). Des produits alimentaires ont `hygiene_corps`. Ces associations faussent les résultats.

## Plan de correction

### 1. Migration SQL : peupler les 135 produits manquants
Générer automatiquement des impact_units basés sur la catégorie du produit :

| Catégorie | impact_type principal | impact_value | impact_type secondaire | impact_value |
|---|---|---|---|---|
| alimentaire | meals | 1.5 | breakfasts | 1.0 |
| hygiène | hygiene_corps | 2.0 | wellbeing | 1.5 |
| entretien | entretien_maison | 2.0 | daily_products | 1.5 |
| bébé | baby_care | 2.0 | — | — |
| vêtements | vetements | 1.5 | — | — |
| enfants | kids_snacks | 1.5 | — | — |
| confort | wellbeing | 1.5 | — | — |
| beauté | wellbeing | 2.0 | hygiene_corps | 1.0 |
| maison | daily_products | 2.0 | entretien_maison | 1.0 |

### 2. Migration SQL : nettoyer les impact_units incohérents
- Supprimer `meals` des produits non-alimentaires
- Supprimer `hygiene_corps` des produits alimentaires
- Supprimer `breakfasts` des produits non-alimentaires
- Conserver uniquement les associations logiques catégorie → impact_type

### 3. Corriger le fallback dans DonationFlow.tsx
Ligne 148 : aligner les seuils sur les nouveaux paliers (20, 35, 50, 75).

```
Avant : donationAmount >= 75 ? 3 : donationAmount >= 60 ? 2 : donationAmount >= 36 ? 1 : 0
Après : donationAmount >= 75 ? 3 : donationAmount >= 50 ? 2 : donationAmount >= 35 ? 1 : 0
```

### Fichiers modifiés
- **1 migration SQL** : peuplement des 135 produits + nettoyage des associations incohérentes
- **`src/pages/DonationFlow.tsx`** : correction seuils ligne 148

