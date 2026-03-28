

# Implémenter l'Option C partout où le montant du don est dimensionnable

## Endroits identifiés

1. **`DonationAmountSelector.tsx`** — le sélecteur [ - ] / [ + ] avec l'affichage fiscal inline (lignes 76-111)
2. **`CartSummary.tsx`** — le récapitulatif panier qui utilise `<TaxDeduction>` (ligne 138)
3. **`UpsellDonation.tsx`** — la page upsell (pas d'affichage fiscal actuellement, mais le total y est dimensionnable)

## Corrections préalables sur TaxDeductionOptionC

Le composant utilise actuellement un taux hardcodé de **0.75** et mentionne "Loi Coluche 75%". Il faut :
- Importer `TAX_DEDUCTION_RATE` depuis `constants.ts` (= 0.66)
- Badge : "−75%" → "−66%"
- Mention légale : "Réduction d'impôt de 66% pour les dons aux associations d'intérêt général"

## Changements par fichier

### 1. `src/components/TaxDeductionOptionC.tsx`
- Importer `TAX_DEDUCTION_RATE` depuis `@/lib/constants`
- Remplacer `amount * 0.75` par `amount * TAX_DEDUCTION_RATE`
- Badge "−75%" → "−66%"
- Mention légale corrigée

### 2. `src/components/DonationAmountSelector.tsx`
- Supprimer le bloc fiscal inline (lignes 76-111 : les 2 colonnes "Déduction fiscale" / "Coût réel" + mention légale)
- Ajouter `<TaxDeductionOptionC amount={value} />` en dessous du sélecteur +/-, dans la même card
- Import du composant

### 3. `src/components/checkout/CartSummary.tsx`
- Remplacer `<TaxDeduction amount={checkoutData.totalAmount} />` par `<TaxDeductionOptionC amount={checkoutData.totalAmount} />`
- Mettre à jour l'import

### 4. `src/pages/UpsellDonation.tsx`
- Ajouter `<TaxDeductionOptionC amount={totalAmount} />` entre les options d'upsell et les boutons d'action
- Le composant s'anime automatiquement quand le total change (sélection/désélection d'un upsell)

### Fichiers modifiés
- `src/components/TaxDeductionOptionC.tsx` — correction taux 66%
- `src/components/DonationAmountSelector.tsx` — remplacement fiscal inline → OptionC
- `src/components/checkout/CartSummary.tsx` — remplacement TaxDeduction → OptionC
- `src/pages/UpsellDonation.tsx` — ajout OptionC

