

# Plan de correction complet — Alignement produits, impacts et parcours donateur

## Diagnostic synthétique

| Problème | Données | Conséquence |
|---|---|---|
| **cause_relevance non filtrant** | 537/722 produits tagués sur les 6 causes. `women_recovery` couvre 672 produits (93%) | Un étudiant et un bébé reçoivent le même colis |
| **situation_relevance vide** | 722/722 produits = `{}` | Le boost +2 du basket engine est inactif. Zéro priorisation par situation |
| **labels vide** | 580/722 produits sans labels | Les badges Bio/Équitable/France n'apparaissent jamais |
| **cultural_origin_tags vide** | 392/722 produits sans tags culturels | L'indicateur ✨ "Choisi pour X" est rare |
| **Tiers déséquilibrés** | Tier 1 = 565 produits (78%), Tier 4 = 5 produits | Aucune progression visible quand le don augmente — le basket prend les mêmes produits à 3€ |
| **Survie surreprésentée** | `survival` = 251 produits, avg 5.49€. `autonomy` = 70, avg 12.19€ | À 36€ on met ~6 produits survival à 3€ = 18€ dépensés, le reste en survival aussi |
| **Impact = compteur abstrait** | Les impact_units multiplient `impact_value × quantity` sans lien visible avec le contenu du colis | Le donateur voit "7 jours de repas" mais ne comprend pas d'où ça vient |
| **Pas de différenciation de colis** | Les 24 profile_mappings existent mais 14/24 ont `survival` en tier1 avec la même logique | Le colis pour "femme seule" ≈ "travailleur précaire" ≈ "retraité" |

---

## Plan en 5 étapes

### Étape 1 — Remplacer les impacts abstraits par un comptage direct (P0)

**Principe** : Abandonner `impact_units` côté affichage. Compter directement les produits du panier par catégorie, en utilisant l'`impact_profile` pour choisir quelles catégories afficher.

**Mapping catégorie → impact_type** :
| impact_type | Catégories comptées | Label affiché |
|---|---|---|
| meals | alimentaire (hors snacks) | "X produits alimentaires" |
| breakfasts | alimentaire + subcategory 'petit_dejeuner' | "X petits-déjeuners" |
| quick_meals | alimentaire + subcategory 'plat_rapide' | "X repas rapides" |
| kids_snacks | alimentaire + subcategory 'gouter' | "X goûters enfants" |
| hygiene_corps | hygiène | "X produits d'hygiène" |
| entretien_maison | entretien | "X produits ménagers" |
| daily_products | autonomie, santé | "X produits du quotidien" |
| baby_care | bébé | "X produits bébé" |
| wellbeing | bien-être, boissons | "X produits bien-être" |
| vetements | vêtements | "X vêtements" |

**Fichier modifié** : `src/components/DonationImpactCard.tsx`
- Supprimer le fetch de `impact_units`
- Calculer les lignes en comptant `basket.filter(item => item.product.category in categoryMapping).reduce(sum, quantity)`
- Garder le fetch de `impact_profiles` pour savoir quels 3-4 types afficher

**Résultat** : L'impact est vérifiable par le donateur (il voit le colis et les chiffres correspondent).

### Étape 2 — Resserrer cause_relevance (P0)

Appliquer des exclusions strictes par catégorie via UPDATE SQL :

| Catégorie | Causes autorisées |
|---|---|
| bébé | `child_family`, `women_recovery` uniquement |
| enfant | `child_family`, `working_poor` uniquement |
| bien-être | toutes sauf `child_family` |
| autonomie | `student`, `working_poor`, `health_disability` |
| alimentaire, hygiène, entretien, santé, boissons | toutes (universel) |
| vêtements | toutes sauf `student` (sauf vêtements basiques) |

**Outil** : insert tool (UPDATEs sur `products.cause_relevance`)

### Étape 3 — Peupler situation_relevance (P1)

Taguer les produits avec les situation_ids pertinents pour activer le boost +2 dans le basket engine.

Règles :
- Produits bébé → situations avec `children_count > 0` (mère célibataire, jeune mère, famille réfugiée, SMIC famille)
- Produits rapides (plats préparés, snacks) → situations étudiant
- Produits confort/bien-être → situations personne âgée, convalescence, troubles psychiques
- Produits entretien → situations famille (SMIC, perte emploi, mère célibataire)
- Produits autonomie → situations handicap, étudiant travailleur

**Outil** : insert tool (UPDATEs sur `products.situation_relevance`)

### Étape 4 — Redistribuer les tiers produits (P1)

L'objectif est de créer une progression visible quand le don passe de 18€ à 36€ à 60€.

Cibles :
| Tier | Cible | Prix moyen | Rôle |
|---|---|---|---|
| 1 | ~350 produits | 3-6€ | Base accessible à 18€ |
| 2 | ~220 produits | 7-12€ | Apparaît à 36€ (hygiène premium, alimentaire varié) |
| 3 | ~120 produits | 13-20€ | Apparaît à 60€ (confort, bien-être) |
| 4 | ~30 produits | 21-26€ | Apparaît à 80€+ (vêtements, autonomie) |

Règle simple : `UPDATE products SET tier = 2 WHERE price >= 7 AND price < 13 AND tier = 1` etc.

**Outil** : insert tool

### Étape 5 — Peupler labels et cultural_origin_tags (P2)

**Labels** (~300 produits à taguer) :
- Produits alimentaire bio → `{bio}`
- Produits français locaux → `{made_in_france}`
- Produits équitables (café, chocolat, thé) → `{equitable}`
- Produits éco (recharges, recyclé) → `{eco}`

**cultural_origin_tags** (~200 produits supplémentaires) :
- Couscous, harissa, menthe → `{Maroc, Tunisie, Algérie}`
- Mafé, attiéké → `{Sénégal, Côte d'Ivoire}`
- Nems, riz parfumé → `{Vietnam}`
- etc. selon les produits existants

**Outil** : insert tool

---

## Fichiers code modifiés

| Fichier | Changement |
|---|---|
| `src/components/DonationImpactCard.tsx` | Remplacer le calcul impact_units par un comptage direct des produits du panier par catégorie |

Aucun changement au basket engine, aux edge functions, ni à la structure des tables (respect de la contrainte core-logic-integrity).

## Ordre d'exécution

1. **Étape 1** — Impact par comptage direct (effet immédiat, crédibilité)
2. **Étape 2** — Resserrer cause_relevance (différenciation des colis)
3. **Étape 4** — Redistribuer les tiers (progression visible)
4. **Étape 3** — Peupler situation_relevance (priorisation fine)
5. **Étape 5** — Labels et tags culturels (polish UX)

