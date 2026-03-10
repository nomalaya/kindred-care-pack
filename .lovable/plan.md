

# Modification du CTA DonationFlow

## Changement

**Fichier** : `src/pages/DonationFlow.tsx` ligne 285

**Actuel** :
```
Aider {beneficiary.alias_first_name} avec ce colis ({totalAmount}€)
```

**Nouveau** :
```
Aider {beneficiary.alias_first_name} avec ce colis — {totalAmount}€
```

- Remplacer les parenthèses `()` par un tiret long `—` (em dash) pour une meilleure lisibilité
- Garder le montant dynamique `{totalAmount}€`
- La navigation vers `/upsell/:beneficiaryId` est déjà en place (ligne 274)

## Vérification

La page UpsellDonation est bien :
- Définie dans les routes (`App.tsx` ligne 37)
- Reçoit les données via `location.state` ({ donationAmount, beneficiaryName })
- Le flux existe déjà : DonationFlow → UpsellDonation → CheckoutFlow

