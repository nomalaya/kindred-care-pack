

# Plan : Indicateurs d'impact dynamiques basés sur le contenu du colis

## Résumé

Remplacer la section "Votre aide pour (prénom)" par une section "Impact de votre aide" affichant 3 indicateurs calculés dynamiquement à partir des produits du colis et adaptés à la situation du bénéficiaire.

## 1. Création de deux tables en base de données

### Table `impact_units`

Associe chaque produit à un type d'impact et une valeur.

```sql
CREATE TABLE public.impact_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  impact_type text NOT NULL,
  impact_value numeric NOT NULL DEFAULT 1
);
ALTER TABLE public.impact_units ENABLE ROW LEVEL SECURITY;
-- Lecture publique, gestion admin
```

Types d'impact prévus : `meals`, `breakfasts`, `kids_snacks`, `hygiene_days`, `daily_products`, `quick_meals`

Exemples de peuplement (via insert tool après création) :

| Produit | impact_type | impact_value |
|---------|------------|-------------|
| Riz 1kg | meals | 4 |
| Pâtes 500g | meals | 3 |
| Lentilles 500g | meals | 2 |
| Céréales petit-déjeuner | breakfasts | 5 |
| Lait UHT 1L | breakfasts | 3 |
| Compote | kids_snacks | 3 |
| Goûter enfant | kids_snacks | 4 |
| Biscuits famille | kids_snacks | 5 |
| Savon solide | hygiene_days | 14 |
| Dentifrice | hygiene_days | 10 |
| Gel douche | hygiene_days | 7 |
| Shampooing | hygiene_days | 10 |
| Lessive liquide | daily_products | 1 |
| Liquide vaisselle | daily_products | 1 |
| Sardines | quick_meals | 1 |
| Thon conserve | quick_meals | 1 |
| Conserves légumes | meals | 2 |
| etc. | | |

Tous les ~300 produits actifs recevront une entrée.

### Table `impact_profiles`

Définit les 3 types d'impact à afficher par situation (24 situations).

```sql
CREATE TABLE public.impact_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id uuid NOT NULL REFERENCES public.situations(id) ON DELETE CASCADE,
  impact_type_1 text NOT NULL,
  impact_type_2 text NOT NULL,
  impact_type_3 text NOT NULL,
  UNIQUE(situation_id)
);
ALTER TABLE public.impact_profiles ENABLE ROW LEVEL SECURITY;
```

Exemples de mapping :

| Situation | type_1 | type_2 | type_3 |
|-----------|--------|--------|--------|
| Mère célibataire | meals | kids_snacks | hygiene_days |
| Personne âgée vivant seule | meals | breakfasts | hygiene_days |
| Étudiant travaillant... | quick_meals | breakfasts | hygiene_days |
| Femme fuyant violences | meals | hygiene_days | daily_products |
| Famille avec enfant handicapé | meals | kids_snacks | hygiene_days |
| Travailleur au SMIC | meals | breakfasts | daily_products |
| Personne atteinte maladie | meals | hygiene_days | daily_products |

Les 24 situations seront couvertes.

## 2. Labels et emojis par impact_type

Définition dans le composant (constante statique, pas en base) :

```typescript
const IMPACT_LABELS: Record<string, { emoji: string; unit: string; label: (v: number) => string }> = {
  meals:          { emoji: "🍽️", unit: "jour",     label: v => `${v} jour${v>1?'s':''} de repas essentiels` },
  breakfasts:     { emoji: "☕",  unit: "jour",     label: v => `${v} petit${v>1?'s':''}-déjeuner${v>1?'s':''}` },
  kids_snacks:    { emoji: "🧒", unit: "goûter",   label: v => `${v} goûter${v>1?'s':''} pour les enfants` },
  hygiene_days:   { emoji: "🧼", unit: "jour",     label: v => formatDuration(v) + ` d'hygiène` },
  daily_products: { emoji: "🧹", unit: "produit",  label: v => `${v} produit${v>1?'s':''} du quotidien` },
  quick_meals:    { emoji: "🥫", unit: "repas",    label: v => `${v} repas rapide${v>1?'s':''}` },
};
```

`formatDuration` : 1-6 → "X jours", 7 → "1 semaine", 8-13 → "X jours", 14 → "2 semaines", etc. Toujours arrondir vers le bas.

## 3. Modification du composant `DonationImpactCard`

**Supprimer** tout le contenu actuel (calcul basé sur catégories, "Votre aide pour", picto famille).

**Nouveau composant** :

Props : `basket: BasketItem[]`, `situationId: string`

Logique :
1. Fetch `impact_profiles` pour `situationId` → obtenir les 3 `impact_type`
2. Fetch `impact_units` pour tous les `product_id` du panier
3. Pour chaque `impact_type` du profil, sommer `impact_value × quantity` des produits correspondants
4. Arrondir vers le bas (`Math.floor`)
5. Afficher max 3 lignes avec animation `AnimatedNum` existante

Titre : **"Impact de votre aide"** (sans prénom)

Fallback si pas de profil d'impact : ne rien afficher (return null)

## 4. Modification de `DonationFlow.tsx`

Ligne 282-286 : remplacer l'appel à `DonationImpactCard` :

```tsx
{/* 3. Impact card */}
<DonationImpactCard
  basket={basket}
  situationId={beneficiary.situation_id}
/>
```

Supprimer les props `beneficiaryName` et `hasFamily`.

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| Migration SQL | Créer tables `impact_units` et `impact_profiles` avec RLS |
| Insert SQL | Peupler les deux tables pour ~300 produits et 24 situations |
| `src/components/DonationImpactCard.tsx` | Réécriture complète — fetch impact data, calcul dynamique |
| `src/pages/DonationFlow.tsx` | Mise à jour props du composant (lignes 282-286) |

## Ce qui ne change PAS

- Matching / basket engine
- Génération du colis
- Tunnel de paiement
- Tous les autres composants de la page

