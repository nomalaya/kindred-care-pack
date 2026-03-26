

# Nouveaux paliers de don + upsells dynamiques

## Matrice finale

| Don principal | U1 | Total | U2 | Total | U3 | Total |
|---|---|---|---|---|---|---|
| **20€** | 10€ | 30€ | 20€ | 40€ | — | — |
| **35€** | 5€ | 40€ | 15€ | 50€ | 25€ | 60€ |
| **50€** | 10€ | 60€ | 20€ | 70€ | 30€ | 80€ |
| **75€** | 5€ | 80€ | 15€ | 90€ | 25€ | 100€ |
| **100€** | 10€ | 110€ | 20€ | 120€ | 30€ | 130€ |

Au-dela de 100€ : incréments de 25€ (125€, 150€ max). Upsells calculés dynamiquement avec la même logique (montants finissant en 0/5, totaux en 0).

## Fichiers modifiés

### 1. `src/lib/constants.ts`
- `DONATION_STEPS` → `[20, 35, 50, 75, 100]`
- `DEFAULT_DONATION` → `35`
- `MIN_DONATION` → `20`
- `MAX_DONATION` → `150`
- Supprimer `EMERGENCY_PACKS` statiques
- Ajouter `UPSELL_MATRIX` : map don principal → tableau d'upsells `{amount, icon, description}`
- Ajouter `STEP_INCREMENT = 25`
- Mettre à jour `DONATION_TIERS` avec les nouveaux seuils (20/35/50/75)
- Adapter le type `EmergencyPack` pour supporter les montants dynamiques

### 2. `src/components/DonationAmountSelector.tsx`
- Importer les nouvelles constantes
- `STEP_INCREMENT` → 25 (au lieu de 15)
- Les fonctions `getPrevAmount`/`getNextAmount` s'adaptent automatiquement via `DONATION_STEPS`

### 3. `src/pages/UpsellDonation.tsx`
- Importer `UPSELL_MATRIX` au lieu de `EMERGENCY_PACKS`
- Lire `donationAmount` du state de navigation pour déterminer les upsells à afficher
- Pour 20€ : afficher seulement 2 options (grille `grid-cols-2`)
- Pour les autres : 3 options (grille `grid-cols-3`)
- Afficher sous chaque option : "Total de votre don : XX€"

### 4. `src/components/EmergencyUpsell.tsx`
- Même adaptation : recevoir `donationAmount` en prop, calculer les upsells via `UPSELL_MATRIX`
- Adapter la grille (2 ou 3 colonnes selon le nombre d'options)

### 5. `src/pages/Index.tsx`
- Ligne 123 : "À partir de 32€" → "Dès 20€"

### 6. `src/pages/DonationFlow.tsx`
- Le `DEFAULT_DONATION` importé passe automatiquement à 35€

