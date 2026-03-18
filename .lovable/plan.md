

# Remplacer les badges diététiques par des badges de valeurs et personnalisation culturelle

## Constat

- Le champ `labels[]` est **vide pour les 587 produits** — il faut le peupler
- Les `cultural_origin_tags` des produits (noms de pays : "Maroc", "Tunisie"...) ne matchent pas directement les `culture_tags` des bénéficiaires (codes régionaux : "maghreb", "asie"...) — il faut un mapping
- Le type `ProductRecord` dans `basketEngine.ts` ne contient pas `labels` ni `cultural_origin_tags`

## Changements

### 1. Migration SQL — Peupler `labels[]` sur les produits pertinents

Assigner des labels réalistes selon la catégorie et la sous-catégorie :

| Label | Produits concernés | Critère |
|---|---|---|
| `bio` | ~80 produits alimentaires (fruits secs, céréales, huile, légumineuses, lait, infusion, thé) | Sous-catégories naturelles |
| `equitable` | ~30 produits (chocolat, café, thé, fruits secs tropicaux) | Filières commerce équitable classiques |
| `made_in_france` | ~100 produits (savon, lessive, conserves, confiture, miel, biscuits) | Catégories de production française typique |
| `eco` | ~40 produits (entretien, hygiène réutilisable, coton) | Produits éco-responsables |

Pas tous les produits auront un label — c'est voulu. Seuls ~40% des articles en auront, rendant les badges significatifs.

### 2. `basketEngine.ts` — Ajouter les champs au type `ProductRecord`

Ajouter `labels: string[] | null` et `cultural_origin_tags: string[] | null` au type `ProductRecord`.

### 3. `DonationBasket.tsx` — Remplacer les badges diététiques

**Supprimer** : tout le système `DIET_BADGES` et `getProductDietBadges()`.

**Ajouter** : 

**Badges de valeurs** basés sur `product.labels[]` :
```text
🌿 Bio          — vert
🤝 Équitable    — ambre  
🇫🇷 France      — bleu
♻️ Éco          — teal
```

Affichés uniquement quand le label est présent (max 2 badges par produit pour ne pas surcharger).

**Indicateur de personnalisation culturelle** : un petit `✨` avec tooltip "Choisi pour [prénom]" quand un `cultural_origin_tag` du produit matche le `culture_tags` du bénéficiaire.

Mapping région → pays :
```text
maghreb    → Maroc, Tunisie, Algérie
asie       → Chine, Inde, Japon, Vietnam, Thaïlande, Sri Lanka, Corée du Sud
afrique_sub → Sénégal, Mali, Cameroun, Côte d'Ivoire, Guinée, Ghana, Burkina Faso
europe_est → Turquie
portugal   → Portugal
france     → France
```

### 4. Props du composant — Ajouter le contexte bénéficiaire

Le composant `DonationBasket` recevra 2 nouvelles props :
- `beneficiaryCultureTags: string[]` — pour le matching culturel
- `beneficiaryName: string` — pour le tooltip "Choisi pour X"

Mise à jour de l'appel dans `DonationFlow.tsx`.

### Fichiers modifiés
- **Migration SQL** : 1 migration pour peupler `labels[]`
- **`src/lib/basketEngine.ts`** : 2 champs ajoutés au type
- **`src/components/DonationBasket.tsx`** : refonte complète des badges
- **`src/pages/DonationFlow.tsx`** : passage des nouvelles props

