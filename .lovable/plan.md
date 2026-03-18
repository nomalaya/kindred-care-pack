

# Plan : Refonte impact_units pour 3+ impacts visibles à 36€

## Diagnostic

À 36€, les tiers 1 et 2 sont actifs (seuils : 18€, 36€, 60€, 80€). Le panier contient ~6 produits. Avec les impact_values actuelles (avg 0.2 à 0.5 par produit), le `Math.floor()` ramène la plupart des totaux à 0 — seul `meals` atteint parfois 1. Résultat : 1 à 2 impacts visibles au lieu de 3.

**Causes racines :**
- 397 produits n'ont qu'un seul impact_type (pas de cross-impact)
- Les valeurs sont trop basses : 2 produits childhood × 0.2 kids_snacks = 0.4 → floor = 0

## Solution en 2 étapes (données uniquement)

### Étape 1 : Multiplier toutes les impact_values par 3

| Type | Avg actuel | Après ×3 | Résultat à 36€ (~6 prod) |
|------|-----------|----------|--------------------------|
| meals | 0.46 | 1.38 | 4 prod × 1.38 = **5 jours** |
| kids_snacks | 0.57 | 1.71 | 2 prod × 0.6→1.8 = **3 goûters** |
| baby_care | 0.74 | 2.22 | 2 prod × 0.9→2.7 = **2 jours** |
| hygiene_corps | 0.72 | 2.16 | visible dès tier 2 |
| breakfasts | 0.43 | 1.29 | visible dès tier 1 |
| entretien_maison | 0.65 | 1.95 | visible dès tier 2 |

### Étape 2 : Ajouter des cross-impacts aux produits à impact unique

Pour garantir 3 types distincts dans chaque panier, ajouter des impacts secondaires :

**Produits survival (alimentaire) → ajouter `kids_snacks`** pour les aliments enfants :
- Biscuits, chocolat, confiserie, dessert, pâtes alphabet → kids_snacks 1.5

**Produits survival (alimentaire) → ajouter `breakfasts`** pour les produits petit-déjeuner :
- Céréales, confiture, lait, beurre, cacao → breakfasts (s'ils n'ont que `meals`)

**Produits dignity (hygiène) → ajouter `entretien_maison`** en secondaire :
- Savon, dentifrice, shampoing → entretien_maison 0.5 (ces produits sont aussi du "ménage domestique")

**Produits dignity (entretien) → ajouter `hygiene_corps`** en secondaire :
- Éponges, vinaigre blanc → hygiene_corps 0.5 (polyvalence corps/maison)

### Projections à 36€ par profil

| Profil | Impact 1 | Impact 2 | Impact 3 |
|--------|----------|----------|----------|
| Mère isolée | 🍽️ 5 jours repas | 🧒 3 goûters | 👶 2 jours soins bébé |
| Femme reconstruction | 🍽️ 4 jours repas | 🧼 3 jours hygiène | 🏠 2 produits entretien |
| Étudiant | 🥫 4 repas rapides | ☕ 3 petits-déj | 🧼 2 jours hygiène |
| Personne âgée | 🍽️ 4 jours repas | ☕ 3 petits-déj | 🧼 2 jours hygiène |
| Travailleur pauvre | 🍽️ 5 jours repas | 🧒 2 goûters | 🏠 2 produits entretien |
| Situation santé | 🍽️ 5 jours repas | 🧼 3 jours hygiène | 🧹 2 produits quotidien |

### Progression à 60€ et 90€

À 60€ (tier 3 actif) : tous les chiffres augmentent + un 4e impact apparait (vetements, wellbeing, jouets selon le profil).
À 90€ (tier 4 actif) : augmentation significative + le 4e impact se renforce.

## Exécution technique

1. **UPDATE** (insert tool) : `impact_units SET impact_value = ROUND(impact_value * 3, 1)`
2. **INSERT** (insert tool) : cross-impacts `kids_snacks` sur produits alimentaires enfants
3. **INSERT** (insert tool) : cross-impacts `breakfasts` sur produits petit-déjeuner sans ce type
4. **INSERT** (insert tool) : cross-impacts `entretien_maison` sur produits hygiène (dignity)
5. **INSERT** (insert tool) : cross-impacts `hygiene_corps` sur produits entretien (dignity)

## Ce qui ne change PAS

- Structure des tables, composeBasket(), frontend, prix produits
- impact_profiles (les 24 configurations situation ↔ types d'impact)
- La logique high-water mark et formatDuration

