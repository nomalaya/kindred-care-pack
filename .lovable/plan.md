

# Impact = comptage réel du panier + phrases narratives par situation

## Partie 1 — Comptage direct (identique au plan précédent)

Compter les produits réels du panier par catégorie (`product.category`). Mapping catégorie → emoji + label pluriel/singulier.

## Partie 2 — Phrases narratives contextualisées par situation

Au lieu de 4 phrases génériques, stocker **une phrase par palier par situation** dans la table `impact_profiles` (24 situations × 4 paliers = 96 phrases).

### Nouvelle structure `impact_profiles`

Ajouter 4 colonnes à `impact_profiles` :

| Colonne | Type | Description |
|---|---|---|
| `narrative_tier1` | text | Phrase pour palier 20€ |
| `narrative_tier2` | text | Phrase pour palier 35€ |
| `narrative_tier3` | text | Phrase pour palier 50€ |
| `narrative_tier4` | text | Phrase pour palier 75€+ |

### Exemples de phrases par situation

| Situation | 20€ | 35€ | 50€ | 75€+ |
|---|---|---|---|---|
| 1.1 Mère célibataire | "Des repas pour elle et ses enfants" | "Repas et goûters pour toute la famille" | "Alimentation, hygiène et goûters enfants" | "Un colis familial complet, pensé pour chaque membre" |
| 1.3 Famille réfugiée | "L'essentiel pour nourrir les enfants" | "Alimentation et produits enfants au quotidien" | "Un colis complet avec repères du quotidien" | "Tout le nécessaire pour retrouver une stabilité" |
| 2.1 Femme violences | "Hygiène et alimentation de première nécessité" | "Alimentation simple et soins essentiels" | "Un colis de reconstruction personnelle" | "Dignité, alimentation et reconstruction au complet" |
| 2.2 Jeune mère sans logement | "Nourrir maman et bébé" | "Alimentation, hygiène et soins bébé" | "Un colis mère-enfant complet" | "Tout pour le quotidien de maman et bébé" |
| 3.1 Étudiant qui travaille | "Des repas rapides pour tenir la semaine" | "Repas et petits-déjeuners pour plusieurs jours" | "Alimentation complète et confort minimal" | "Un colis étudiant complet, pensé pour le quotidien" |
| 4.1 Personne âgée seule | "Des repas simples pour quelques jours" | "Repas et produits d'hygiène essentiels" | "Un colis complet pour le quotidien" | "Alimentation, hygiène et petits plaisirs" |
| 4.3 En établissement | "Petits plaisirs et confort personnel" | "Confort et douceurs du quotidien" | "Un colis de bien-être complet" | "Tout pour se sentir chez soi" |
| 5.1 SMIC avec famille | "Des repas pour toute la famille" | "Repas familiaux et goûters enfants" | "Alimentation, hygiène et quotidien familial" | "Un colis famille complet" |
| 6.1 Maladie chronique | "Une alimentation adaptée pour quelques jours" | "Repas adaptés et hygiène essentielle" | "Un colis adapté aux besoins de santé" | "Alimentation, hygiène et confort au complet" |
| 6.3 Troubles psychiques | "Des repas simples et des repères" | "Alimentation et repères du quotidien" | "Un colis apaisant et structurant" | "Tout pour retrouver un quotidien serein" |

Les 24 situations seront couvertes dans la migration SQL avec des phrases cohérentes avec les consignes (impacts principaux/secondaires/interdits).

## Partie 3 — Logique du composant `DonationImpactCard`

### Props
```text
basket: BasketItem[]
donationAmount: number
situationId?: string    ← conservé pour récupérer la phrase narrative
```

### Logique
1. **Comptage** : `useMemo` groupant `basket` par `product.category` → compteur par catégorie
2. **Phrase** : `useEffect` chargeant `impact_profiles.narrative_tier1..4` pour le `situationId`, puis sélection du palier selon `donationAmount`
3. **Aucune** dépendance à `impact_units` dans l'affichage

### Rendu
```text
┌──────────────────────────────────────┐
│  Votre colis contient                │
│                                      │
│  🍽️ 4 produits alimentaires          │
│  🧼 2 produits d'hygiène             │
│  👶 3 articles bébé                  │
│                                      │
│  "Repas et goûters pour toute        │
│   la famille"                        │
└──────────────────────────────────────┘
```

## Fichiers modifiés

1. **Migration SQL** : `ALTER TABLE impact_profiles ADD COLUMN narrative_tier1..4 text` + `UPDATE` des 24 lignes avec les phrases adaptées
2. **`src/components/DonationImpactCard.tsx`** : réécriture complète — comptage par catégorie + fetch narrative
3. **`src/pages/DonationFlow.tsx`** : passer `donationAmount` en plus de `situationId` au composant

