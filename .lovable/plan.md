

# Corrections du parcours donateur CashForCause

## Bugs identifiés

1. **CheckoutFlow ignore `location.state`** : `totalAmount` hardcodé à 30, `emergencyPack` toujours null → déduction fiscale à 0€, montant upsell non ajouté
2. **Doublon upsell** : `CartSummary` affiche `EmergencyUpsell` alors que l'upsell a déjà été choisi sur la page `UpsellDonation`
3. **Carte bénéficiaire sur CartSummary** : la fiche complète (avatar+profil) apparaît sur la page panier alors qu'elle devrait uniquement apparaître en confirmation
4. **DonationBasket** : les badges culturels ont été supprimés, ils doivent revenir ; la gamification bar et le hint "débloquer" ajoutent du bruit
5. **CTA DonationFlow** : texte encore avec parenthèses au lieu du format demandé

## Corrections par fichier

### `src/components/checkout/CheckoutFlow.tsx`
- Importer `useLocation`
- Lire `location.state` : `{ donationAmount, emergencyPack, beneficiaryName }`
- Initialiser `totalAmount = donationAmount + (emergencyPack?.amount || 0)`
- Initialiser `emergencyPack` depuis le state
- Utiliser `donationAmount` (pas le total) pour `composeBasket` (ligne 95)

### `src/components/checkout/CartSummary.tsx`
- **Supprimer** l'import et le rendu de `EmergencyUpsell` (lignes 7, 155-158)
- **Supprimer** la carte bénéficiaire complète (col gauche, lignes 71-93) — remplacer par un layout full-width
- **Ajouter** un résumé simplifié en haut du panier :
  - Ligne 1 : `Envoi du colis à {prénom} — {donationAmount}€`
  - Ligne 2 (si emergencyPack) : `{emergencyPack.name} — {emergencyPack.amount}€`
- **Passer** `donationAmount` en prop depuis CheckoutFlow (via checkoutData ou dérivé)
- Garder `TaxDeduction` avec `amount={checkoutData.totalAmount}` (corrigé par le fix CheckoutFlow)

### `src/components/DonationBasket.tsx`
- **Restaurer les badges culturels** : réactiver `getProductDietBadges` et afficher les badges sur chaque ligne produit (halal, kosher, vegan, vegetarian, sans_porc, sans_alcool)
- **Supprimer** la gamification bar (lignes 104-150, FAMILY_ORDER/FAMILY_ICONS/completedFamilies)
- **Supprimer** le hint "débloquer" (lignes 201-209)
- **Garder** : groupement par famille émotionnelle, nom produit, quantité, progress bar, total articles

### `src/pages/DonationFlow.tsx`
- Ligne 285 : changer le CTA en `Envoyer ce colis à {beneficiary.alias_first_name} — {totalAmount}€` (tiret long, sans parenthèses)

## Ce qui ne change PAS
- `composeBasket`, `matching_rules`, edge functions, DB schema
- `UpsellDonation.tsx` (déjà correct)
- `PaymentMethods.tsx` (lit `checkoutData.totalAmount`)
- `OrderConfirmation.tsx` (lit `checkoutData.totalAmount`, affiche déjà la carte bénéficiaire — correct)
- `TaxDeduction.tsx` (calcul correct, le bug vient du fait que `totalAmount` était 0)

