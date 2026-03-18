

# Plan : Impact réaliste, progressif et différenciant à chaque palier

## Diagnostic actuel

| Problème | Cause | Exemple Aïcha à 36€ |
|---|---|---|
| Impact irréaliste ("10 semaines de repas") | Prix produits trop bas (avg 3,43€ tier 1) → ~10 produits dans le panier | 10 prod × 2,24 avg meals = 22 jours → "3 semaines" |
| Pas de différenciation entre paliers | Les 3 mêmes types affichés du début à la fin, valeurs trop proches | kids_snacks = 1, baby_care = 2, seul meals bouge |
| "Hygiène" mélange corps + entretien | Un seul type `hygiene_days` couvre savon ET lessive | Donateur ne comprend pas ce qu'il finance |
| Vêtements/jouets = "produits du quotidien" | `daily_products` est trop vague | Aucune lisibilité pour le donateur |
| Pas de nouvel impact à 60€ | `impact_profiles` n'a que 3 slots | Le donateur ne voit rien de nouveau en augmentant |

## Solution en 4 volets

### 1. Augmenter les prix produits (coût logistique réel)

Les prix actuels ne couvrent que l'achat brut. Le coût réel inclut sourcing, stockage, préparation, transport et distribution.

| Tier | Prix actuel | Nouveau prix | Effet sur panier à 36€ |
|------|------------|-------------|----------------------|
| 1 | 0,80-5€ (avg 3,43€) | 3-8€ (avg ~6€) | ~6 produits au lieu de ~10 |
| 2 | 5,50-10€ (avg 7,26€) | 8-15€ (avg ~11€) | Moins de produits tier 2 |
| 3 | 10,50-15€ (avg 12,88€) | 15-22€ (avg ~18€) | Accessible seulement à 60€+ |
| 4 | 18-20€ (avg 18,80€) | 22-30€ (avg ~25€) | Accessible seulement à 80€+ |

### 2. Créer des types d'impact compréhensibles

Remplacer les types vagues par des types concrets que le donateur comprend immédiatement :

| Ancien type | Produits concernés | Nouveau type | Label affiché |
|---|---|---|---|
| `hygiene_days` (hygiène) | Savon, shampoing, dentifrice | `hygiene_corps` | 🧼 X jours de soins corporels |
| `hygiene_days` (entretien) | Lessive, nettoyant, éponge | `entretien_maison` | 🏠 X produits d'entretien ménager |
| `daily_products` (vêtements) | T-shirt, chaussettes, etc. | `vetements` | 👕 X vêtement(s) |
| `daily_products` (enfant) | Jouets, cahiers, crayons | `jouets` | 🧸 X jouet(s) pour les enfants |

Types conservés tels quels : `meals`, `breakfasts`, `kids_snacks`, `baby_care`, `quick_meals`, `wellbeing`.

### 3. Ajouter un 4e impact qui apparait à 60€

Ajouter une colonne `impact_type_4` à la table `impact_profiles`. Ce 4e type correspond à un impact "bonus" qui n'apparait que lorsque le panier contient des produits de cette catégorie — naturellement à partir de 60€ quand les tiers supérieurs se débloquent.

Exemple pour Aïcha (situation bébé) :
- Types 1-3 : `meals`, `kids_snacks`, `baby_care`
- Type 4 : `vetements` (les vêtements bébé/enfant n'entrent dans le panier qu'à partir de 60€)

Le donateur voit une nouvelle ligne apparaitre à 60€, créant un effet "wow".

### 4. Recalibrer les impact_values

Objectif par palier (exemple Aïcha) :

| Palier | 🍽️ Repas | 🧒 Goûters | 👶 Soins bébé | 👕 Vêtements |
|--------|----------|------------|---------------|-------------|
| 18€ | 2 jours | 1 | 1 jour | — |
| 36€ | 4 jours | 3 | 2 jours | — |
| 45€ | 5 jours | 4 | 3 jours | — |
| 60€ | 7 jours | 5 | 4 jours | **1 vêtement** (nouveau !) |
| 90€ | 10 jours | 8 | 6 jours | **3 vêtements** |

Facteurs de division sur les impact_values actuelles :
- `meals` / `breakfasts` : ÷5
- `kids_snacks` : ÷8
- `baby_care` / `quick_meals` : ÷3
- `hygiene_corps` (ex hygiene_days hygiène) : ÷10
- `entretien_maison` (ex hygiene_days entretien) : ÷6
- `vetements` (ex daily_products vêtements) : ÷5
- `jouets` (ex daily_products enfant) : ÷3
- `wellbeing` : ÷4

### 5. Frontend : formatDuration toujours en jours + nouveaux labels

```typescript
function formatDuration(days: number): string {
  if (days <= 1) return "1 jour";
  return `${days} jours`;
}
```

Nouveaux labels dans `IMPACT_LABELS` :
```typescript
hygiene_corps: { emoji: "🧼", label: (v) => `${formatDuration(v)} de soins corporels` },
entretien_maison: { emoji: "🏠", label: (v) => `${v} produit${v > 1 ? "s" : ""} d'entretien ménager` },
vetements: { emoji: "👕", label: (v) => `${v} vêtement${v > 1 ? "s" : ""}` },
jouets: { emoji: "🧸", label: (v) => `${v} jouet${v > 1 ? "s" : ""} pour les enfants` },
```

Le composant lit aussi `impact_type_4` depuis le profil et l'affiche si le total > 0.

## Étapes d'exécution

1. **Migration** : ajouter colonne `impact_type_4` (nullable) à `impact_profiles`
2. **Data** : UPDATE prix produits par tier (×1.8 / ×1.5 / ×1.4 / ×1.3)
3. **Data** : Renommer impact_types (`hygiene_days` → split, `daily_products` → split) dans `impact_units`
4. **Data** : Diviser toutes les `impact_value` par les facteurs ci-dessus
5. **Data** : UPDATE `impact_profiles` — remplacer `hygiene_days` par `hygiene_corps`, `daily_products` par le type pertinent, et ajouter `impact_type_4`
6. **Code** : Modifier `DonationImpactCard.tsx` — `formatDuration` en jours, nouveaux labels, support `impact_type_4`

## Ce qui ne change PAS

- `composeBasket()`, matching, badges, edge functions
- Structure des tables `products`, `impact_units` (pas de nouvelles colonnes)
- Nombre de produits (587)

