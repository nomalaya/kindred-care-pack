

# Plan : Refonte UX page don + badges bénéficiaires

Ce plan couvre deux grands axes demandés dans le même message :
1. **Refonte de la page "Choisissez votre don"** (DonationFlow)
2. **Amélioration des badges et cartes bénéficiaires** (BeneficiarySelection)

---

## A. Refonte DonationFlow

### A1. Nouveau sélecteur de montant (remplace DonationSlider)

Créer `src/components/DonationAmountSelector.tsx` :
- Boutons `[ − ]` **montant** `[ + ]` avec animation sur le montant
- Paliers : `[18, 24, 30, 36, 45, 60, 75, 90]` puis incréments de 15€ au-delà
- `−` descend au palier inférieur, `+` monte au suivant (ou +15 au-delà de 90)
- Montant par défaut : **36€**
- Pas de limite haute

**Supprimer** : `DonationSlider.tsx` (composant entier), l'import dans DonationFlow, et les constantes `MIN_DONATION` / `MAX_DONATION` de `constants.ts` (remplacées par le tableau de paliers).

### A2. Affichage fiscal intégré sous le montant

Directement sous le sélecteur de montant (dans DonationAmountSelector ou en dessous dans DonationFlow) :
- **Déduction fiscale** `−X€` + **Coût réel** `Y€` (gros, animés)
- En petit : "Réduction de 66% pour les dons aux associations d'intérêt général."

L'actuel `TaxDeduction` en version "3 colonnes" reste utilisable, mais on le simplifie pour n'afficher que déduction + coût réel (sans la colonne "Don" redondante).

### A3. Nouvelle carte impact (remplace DonationImpact)

**Supprimer** `DonationImpact.tsx` (la carte "Votre don permet" avec progress bars abstraites).

Créer `src/components/DonationImpactCard.tsx` :
- Titre : "Votre aide pour {prénom}"
- Lignes dynamiques calculées depuis le basket :
  - 🍽️ X repas essentiels (produits catégorie "alimentaire" avec subcategory liée aux repas)
  - 🥫 X produits alimentaires (total catégorie "alimentaire")
  - 🧴 X produits d'hygiène (catégorie "hygiene")
  - 👨‍👩‍👧 Soutien pour sa famille (affiché si children_count > 0 ou family_members > 1)
- Valeurs animées avec framer-motion

### A4. Carte contenu du colis (DonationBasket simplifié)

Modifier `DonationBasket.tsx` :
- **Supprimer** les headers de famille émotionnelle ("Survie & Alimentation", etc.)
- **Supprimer** les labels de variantes
- Afficher uniquement : nom du produit + badges alimentaires (halal, végan, végétarien)
- Conserver les badges diet existants (déjà implémentés avec tooltips)
- Le panier continue à évoluer dynamiquement sans limite

### A5. Supprimer SocialProof sur la page don

Retirer `<SocialProof variant="donation" />` de DonationFlow. Le composant SocialProof reste pour les autres pages.

### A6. Réorganisation verticale de la page

Passer de la grille 2+3 colonnes à une **colonne unique centrée** (`max-w-2xl mx-auto`) :

1. Carte bénéficiaire (avatar + nom + âge + région + histoire + citation)
2. Sélecteur de montant `[ − ] 36€ [ + ]` + fiscal
3. Carte impact "Votre aide pour {prénom}"
4. Contenu du colis
5. Timeline visuelle
6. CTA : "Envoyer ce colis à {prénom} — {montant}€"

### A7. Timeline visuelle améliorée

Modifier `ImpactTimeline.tsx` :
- ❤️ Votre don aujourd'hui
- 📦 Colis préparé demain
- 🎁 Colis distribué après-demain
- Ajouter des cercles colorés connectés par une ligne verticale pour un effet timeline plus visuel

### A8. Mise à jour des constantes

Dans `constants.ts` :
- Ajouter `DONATION_STEPS = [18, 24, 30, 36, 45, 60, 75, 90]`
- Garder `DONATION_TIERS` (utilisé par le basket engine) mais ajuster les seuils pour supporter les montants inférieurs à 30€
- Le basket engine fonctionne déjà sans limite haute (il remplit le budget restant)

### A9. Système de suivi bénéficiaire (coeur)

**DB** : Créer une table `followed_beneficiaries` :
```sql
CREATE TABLE followed_beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  beneficiary_id uuid REFERENCES beneficiaries(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, beneficiary_id)
);
ALTER TABLE followed_beneficiaries ENABLE ROW LEVEL SECURITY;
-- RLS: users can only see/manage their own follows
```

**Frontend** :
- Icône coeur (Heart outline / Heart filled) sur la carte bénéficiaire dans DonationFlow
- Toggle follow/unfollow via insert/delete dans `followed_beneficiaries`
- Sur BeneficiarySelection : afficher coeur plein si bénéficiaire est suivi
- Dashboard : ajouter section "Personnes suivies" (query joined avec beneficiaries_public)

---

## B. Amélioration badges et cartes bénéficiaires (BeneficiarySelection)

### B1. Badges plus grands et visibles

Modifier le badge dans BeneficiarySelection :
- Height : 28-32px (`py-1.5 px-3`)
- Border radius : 16px (`rounded-2xl`)
- Font : `text-xs font-semibold` (au lieu de `text-xs`)
- Garde `absolute top-4 left-4`

### B2. Micro-animation au chargement

Ajouter au badge une animation framer-motion :
```tsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 + 0.3, duration: 0.3 }}>
```

### B3. Effet hover sur carte et badge

- Carte : `hover:shadow-lg hover:-translate-y-1 transition-all duration-300`
- Badge : `group-hover:brightness-110` (carte avec className `group`)

### B4. Hiérarchie prénom / âge / région

Remplacer `{b.alias_first_name} – {getAgeRange(b.approx_age)}` par :
```tsx
<h3 className="text-lg font-semibold text-foreground">{b.alias_first_name}</h3>
<p className="text-sm text-muted-foreground/80">{getAgeRange(b.approx_age)}</p>
<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
  <MapPin className="h-3 w-3" /> {b.region}
</div>
```

Appliquer aussi dans DonationFlow et OrderConfirmation.

### B5. Fond coloré par badge

Extraire la couleur de fond du badge (ex: `bg-amber-50`) et l'appliquer comme fond de la carte entière en version encore plus claire :
```tsx
const cardBg = BADGE_CARD_BG[badge] || "bg-card";
// Map: "Logement provisoire" → "bg-amber-50/30", "Désert médical" → "bg-rose-50/30", etc.
```

---

## Fichiers modifiés / créés / supprimés

| Action | Fichier |
|--------|---------|
| Créer | `src/components/DonationAmountSelector.tsx` |
| Créer | `src/components/DonationImpactCard.tsx` |
| Supprimer | `src/components/DonationSlider.tsx` |
| Supprimer | `src/components/DonationImpact.tsx` |
| Modifier | `src/pages/DonationFlow.tsx` (layout vertical, nouveaux composants, coeur) |
| Modifier | `src/components/DonationBasket.tsx` (supprimer headers famille) |
| Modifier | `src/components/ImpactTimeline.tsx` (textes + style timeline) |
| Modifier | `src/components/TaxDeduction.tsx` (simplifier version sans extra) |
| Modifier | `src/lib/constants.ts` (DONATION_STEPS, ajuster MIN) |
| Modifier | `src/pages/BeneficiarySelection.tsx` (badges, hiérarchie, fond coloré, hover, coeur) |
| Modifier | `src/pages/Dashboard.tsx` (section "Personnes suivies") |
| Migration | Table `followed_beneficiaries` + RLS |

## Ce qui ne change PAS
- `basketEngine.ts`, matching RPC, edge functions, checkout flow, paiement
- Tables existantes (sauf ajout `followed_beneficiaries`)
- `SocialProof` (reste pour homepage/confirmation, retiré uniquement de DonationFlow)

