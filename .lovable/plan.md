

# Plan de correction — Alignement impacts, profils et produits

## Diagnostic résumé

| Problème | État actuel | Impact |
|---|---|---|
| **Impact profiles uniformes** | Les 24 situations utilisent seulement 5 combinaisons d'impact_types. `meals` est systématiquement en type_1 pour tout le monde | Un étudiant et une personne âgée en établissement voient les mêmes impacts |
| **Profile mappings : 6 au lieu de 24** | Tous les bénéficiaires d'une cause partagent le même profil de colis | Aucune différenciation entre "mère célibataire" et "famille réfugiée" |
| **cause_relevance trop large** | 718 produits sur 722 sont tagués `women_recovery`, 703 pour `child_family` | Le filtre par cause ne filtre quasiment rien |
| **situation_relevance vide** | 0/722 produits — le boost +2 du basket engine tourne à vide | Aucune priorisation par situation |
| **target_groups pauvre** | Seulement 80 produits tagués, uniquement "bébé", "enfant", "famille_enfants" | Impossible d'exclure les produits enfants pour un étudiant ou une personne âgée |
| **Impact values trop élevées** | `hygiene_corps` avg 5.7, `daily_products` avg 10.4 | Affichage irréaliste (ex: "34 jours de soins" pour 36€) |

---

## Plan de correction en 4 étapes

### Étape 1 — Différencier les 24 impact_profiles

Mettre à jour les `impact_profiles` pour que chaque situation ait ses propres types d'impact alignés avec le cahier des charges fourni.

Exemples de changements clés :

| Situation | Actuel | Cible |
|---|---|---|
| 1.1 Mère célibataire | meals, kids_snacks, baby_care, vetements | meals, kids_snacks, hygiene_corps, baby_care |
| 1.2 Enfant handicapé | meals, kids_snacks, baby_care, vetements | meals, hygiene_corps, daily_products, — |
| 2.1 Violences conjugales | meals, hygiene_corps, entretien, wellbeing | meals, hygiene_corps, wellbeing, — |
| 3.1 Étudiant travailleur | meals, breakfasts, hygiene_corps, vetements | quick_meals, breakfasts, hygiene_corps, — |
| 4.3 Personne en établissement | meals, breakfasts, hygiene_corps, wellbeing | wellbeing, hygiene_corps, daily_products, — |
| 6.4 Handicap | meals, breakfasts, hygiene_corps, wellbeing | daily_products, hygiene_corps, entretien, — |

Les situations "Interdit" du cahier seront gérées par le filtrage `cause_relevance` (étape 2).

### Étape 2 — Resserrer cause_relevance et peupler target_groups

**cause_relevance** : Réduire drastiquement le nombre de causes par produit. Un produit bébé ne doit PAS être tagué `student` ou `elderly`.

Règles de nettoyage :
- Catégorie `bébé` → uniquement `child_family`, `women_recovery`
- Catégorie `enfant` → uniquement `child_family`, `working_poor`
- Catégorie `bien-être` → toutes causes sauf `child_family`
- Catégorie `autonomie` → uniquement `student`, `working_poor`, `health_disability`

**target_groups** : Enrichir avec les valeurs manquantes : `senior`, `adulte_isolé`, `étudiant`, `travailleur`, `femme`.

### Étape 3 — Créer 24 profile_mappings (au lieu de 6)

Chaque situation reçoit son propre `profile_type` avec des priorités de familles émotionnelles et des minimums distincts.

Exemples :

| Situation | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Min survival | Min childhood |
|---|---|---|---|---|---|---|
| 1.1 Mère célibataire | survival | childhood | dignity | comfort | 3 | 2 |
| 1.3 Famille réfugiée | survival | childhood | dignity | — | 4 | 2 |
| 2.1 Violences conjugales | dignity | survival | comfort | autonomy | 2 | 0 |
| 3.1 Étudiant travailleur | survival | autonomy | comfort | — | 3 | 0 |
| 4.3 En établissement | comfort | dignity | — | — | 1 | 0 |
| 6.4 Handicap | autonomy | dignity | survival | — | 2 | 0 |

Les `beneficiaries` devront être mis à jour pour pointer vers le nouveau `profile_type` correspondant à leur situation.

### Étape 4 — Recalibrer les impact_values pour la crédibilité

Appliquer des facteurs de correction aux `impact_units` pour que les chiffres affichés soient réalistes à chaque palier :

| Impact type | Avg actuel | Facteur | Avg cible | Résultat à 36€ (~5 produits) |
|---|---|---|---|---|
| meals | 2.88 | ÷2 | ~1.4 | ~7 repas |
| breakfasts | 2.73 | ÷2 | ~1.4 | ~4 petits-déj |
| hygiene_corps | 5.72 | ÷4 | ~1.4 | ~5 jours soins |
| entretien_maison | 7.07 | ÷5 | ~1.4 | ~4 produits |
| daily_products | 10.39 | ÷7 | ~1.5 | ~5 produits |
| baby_care | 6.89 | ÷3 | ~2.3 | ~5 jours |
| kids_snacks | 3.39 | ÷2 | ~1.7 | ~5 goûters |
| wellbeing | 3.34 | ÷2 | ~1.7 | ~5 moments |
| vetements | 7.69 | ÷5 | ~1.5 | ~2 vêtements |
| quick_meals | 4.46 | ÷3 | ~1.5 | ~5 repas rapides |

---

## Fichiers impactés

- **4 migrations SQL** (données uniquement, via l'outil insert) :
  1. UPDATE `impact_profiles` — 24 lignes
  2. UPDATE `products.cause_relevance` et `products.target_groups` — par catégorie
  3. INSERT/UPDATE `profile_mappings` — 24 lignes (remplace les 6 existantes)
  4. UPDATE `impact_units.impact_value` — 10 UPDATEs par type

- **`src/pages/DonationFlow.tsx`** : Passer `situation_id` au composant pour que le bon profil soit récupéré
- **Aucun changement** au basket engine ni aux edge functions (respect de la contrainte core-logic-integrity)

## Ordre d'exécution

1. Étape 4 (impact_values) — effet immédiat sur l'affichage
2. Étape 1 (impact_profiles) — différenciation visible
3. Étape 2 (cause_relevance + target_groups) — filtrage produits
4. Étape 3 (profile_mappings) — composition colis personnalisée + update beneficiaries.profile_type

