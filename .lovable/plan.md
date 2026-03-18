

# Plan : Refonte complète de la base produits (600 produits)

## Situation actuelle

- 536 produits avec des catégories incohérentes (doublons majuscules/minuscules : `alimentaire` vs `Alimentaire_sec`, `hygiène` vs `Hygiène`, `bébé` vs `Bébé`)
- Pas de colonnes pour : `display_name`, `labels`, `cultural_origin_tags`, `territory_usage`, `climate_tags`, `usage_context`
- 6 profile_mappings existants utilisant 5 familles émotionnelles : `survival`, `dignity`, `childhood`, `autonomy`, `comfort`
- 6 causes : `child_family`, `women_recovery`, `student`, `elderly`, `working_poor`, `health_disability`

## Étape 1 : Migration de schéma (ajout de colonnes)

Ajouter les colonnes manquantes à la table `products` :

```sql
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS labels text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cultural_origin_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS territory_usage text[] DEFAULT '{metropole}',
  ADD COLUMN IF NOT EXISTS climate_tags text[] DEFAULT '{tempere}',
  ADD COLUMN IF NOT EXISTS usage_context text DEFAULT 'quotidien';
```

## Étape 2 : Supprimer les anciens produits et impact_units

Vider les tables `impact_units` puis `products` pour repartir sur une base propre de 600 produits.

## Étape 3 : Insérer 600 produits

Répartition cible par catégorie et emotional_family :

| Catégorie | emotional_family | Nb | Exemples |
|---|---|---|---|
| alimentaire | survival | 120 | Riz, pâtes, semoule, couscous, lentilles, conserves légumes, thon, sardines, huile, sucre, farine, sel |
| alimentaire | comfort | 80 | Biscuits, chocolat, confiture, miel, café, thé, céréales petit-déj, fruits secs, barres céréales |
| boissons | comfort | 40 | Jus longue conservation, infusions, chicorée, sirop, lait UHT |
| hygiène | dignity | 100 | Savon, shampoing, dentifrice, brosse à dents, déodorant, protections hygiéniques, rasoirs, crème hydratante |
| entretien | dignity | 50 | Lessive, liquide vaisselle, éponges, nettoyant multi-usage, sacs poubelle, lavettes |
| bébé | childhood | 50 | Couches, lingettes, lait infantile poudre, petit pot, body, bavoirs, biberon |
| enfant | childhood | 30 | Cahier, crayons, cartable, livres enfant, jeux éducatifs |
| santé | survival | 30 | Pansements, antiseptique, doliprane, thermomètre, masques, gel hydroalcoolique |
| vêtements | autonomy | 50 | Chaussettes, sous-vêtements, t-shirt basique, pantalon, pull, veste imperméable |
| bien-être | comfort | 30 | Bougie parfumée, tisane relaxante, huile essentielle, cahier écriture, coloriage adulte |
| autonomie | autonomy | 20 | Ticket transport, carte téléphonique prépayée, trousse toilette, sac isotherme |

**Total : 600 produits**

### Règles de prix et tiers

| Tier | Prix | Débloqué à |
|---|---|---|
| 1 | 0.50€ – 5€ | 18€ |
| 2 | 5€ – 10€ | 36€ |
| 3 | 10€ – 15€ | 60€ |
| 4 | 15€ – 25€ | 80€ |

### Produits culturellement spécifiques (intégrés dans les catégories)

- **Maghreb** : semoule fine, harissa, eau de rose, savon noir beldi, henné, huile d'argan, dattes, loukoums
- **Afrique subsaharienne** : riz cassé, sauce arachide, beurre de karité, pâte de piment, bouillon cube africain
- **Asie** : riz jasmin, nouilles instantanées, sauce soja, huile de sésame, thé vert
- **DOM** : anti-moustique tropical, crème solaire haute protection, absorbeur d'humidité
- **Europe** : pâtes classiques, savon de Marseille, huile d'olive

### display_name

Chaque produit aura un `display_name` générique sans marque (ex: "Semoule de blé fine 1kg" au lieu de "Semoule Dari 1kg").

### cause_relevance

Tous les produits alimentaires/hygiène/entretien → toutes les 6 causes. Produits bébé/enfant → `child_family` + `women_recovery`. Produits autonomie → `student`, `working_poor`.

## Étape 4 : Générer les impact_units

Chaque produit alimentaire génère des `meals` ou `breakfasts` ou `kids_snacks`. Chaque produit hygiène/entretien génère des `hygiene_days` ou `daily_products`. Valeurs calibrées pour produire un impact croissant de 18€ à 90€ avec des seuils psychologiques (1 semaine, 2 semaines, kit complet).

## Étape 5 : Mise à jour frontend

Modifier les composants qui affichent `product.name` pour utiliser `product.display_name || product.name` :
- `DonationBasket.tsx`
- `CartSummary.tsx`
- `OrderConfirmation.tsx`
- `DonationConfirmation.tsx`
- `Admin.tsx`

## Ce qui ne change PAS

- `composeBasket()` engine
- `get_empathy_beneficiaries()` RPC
- `matching_rules` table
- Système de badges
- `profile_mappings`

## Exécution

Le script sera exécuté via `lov-exec` (psql + script Python/SQL) pour générer et insérer les 600 produits par lots, puis les impact_units correspondants.

