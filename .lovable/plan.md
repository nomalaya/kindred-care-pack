

# Plan : Importer les produits DZ Store (alimentaire, hygiène, entretien, boissons, enfance)

## Périmètre d'import

J'ai analysé les 446 produits du CSV. Voici les produits éligibles, classés par catégorie existante :

| Catégorie existante | Famille émotionnelle | Produits DZ Store éligibles | Exemples |
|---|---|---|---|
| **Alimentaire_sec** | survival | ~100 produits | Couscous, pâtes, épices, chocolats, biscuits, confitures, huile d'olive, harissa, concentré tomate, dattes, bouillon, café |
| **Boissons** | comfort | ~70 produits | Jus (Rouiba, iFruit, Ramy, Slim), sodas (Hamoud, Selecto, Schweppes, Ifri), infusions (Kabir) |
| **Hygiène** | dignity | ~100 produits | Shampoings (Venus, Swalis), gels douche, savons (Lux, Abusaad), dentifrices (Dabur), déodorants, crèmes |
| **Entretien_maison** | dignity | ~50 produits | Lave-sol (Brilex, Amir Clean), liquide vaisselle, lessive, nettoyants, adoucissants |
| **Bébé** | childhood | 1 produit | Shampoing bébé hypoallergénique Venus |

**Exclus (~125 produits)** : coques iPhone, montres, drapeaux, vêtements (abayas), décoration, casquettes supporter, porte-clés, avion miniature, moules à pâtisserie, etc.

## Mapping technique

Chaque produit sera inséré dans la table `products` avec :

- **name** : titre du CSV
- **price** : prix du CSV (les prix DZ Store sont des prix réels, compatibles avec les paliers 18-90€)
- **category** / **subcategory** : mappés aux catégories existantes
- **emotional_family** : `survival`, `dignity`, `comfort`, `childhood` selon la catégorie
- **tier** : calculé selon le prix (1 si ≤5€, 2 si ≤10€, 3 si ≤15€, 4 si >15€)
- **cause_relevance** : toutes les causes `'{child_family,women_recovery,student,elderly,working_poor,health_disability}'` (produits universels)
- **target_groups** : `'{adult,family}'` par défaut, `'{baby,child}'` pour les produits bébé
- **halal_compatible** : `true` (tous les produits sont halal par nature — marques algériennes)
- **kosher_compatible** : `true` pour alimentaire simple
- **vegetarian/vegan** : `true` pour hygiène/entretien, adapté pour alimentaire
- **contains_pork/contains_alcohol** : `false` pour tous
- **stock_quantity** : `available=True` → 50, `available=False` → 0
- **priority_score** : 3 (défaut)
- **is_active_product** / **is_visible_public** : `true`
- **product_code** : handle du CSV (identifiant unique)

## Impact sur le matching

- Les produits seront immédiatement disponibles pour le `composeBasket` engine car ils auront les bons `cause_relevance` et `emotional_family`
- Les prix réels (2-30€) sont compatibles avec les paliers de don existants
- Il faudra aussi créer des entrées `impact_units` pour les nouveaux produits alimentaires afin que l'impact card fonctionne

## Étapes d'implémentation

1. **Insérer ~320 produits** via l'outil d'insertion SQL (par lots)
2. **Créer les impact_units** correspondants pour les produits alimentaires (type `meals`, `breakfasts`, `kids_snacks`) et hygiène (`hygiene_days`, `daily_products`)

## Aucune modification de code

Conformément à la règle d'intégrité, aucun fichier de code ne sera modifié. Les nouveaux produits s'intègrent via la base de données uniquement.

