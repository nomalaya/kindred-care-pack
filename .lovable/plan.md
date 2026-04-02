

# Créer une route `/donation-preview` pour visualiser la confirmation

## Problème
Impossible d'accéder à la page de confirmation sans passer par Stripe. Il faut aussi corriger l'erreur `TaxShowcase is not defined` (route `/themes` référence encore `ThemeShowcase` qui n'existe peut-être plus).

## Solution
Créer une page `/donation-preview` qui affiche `DonationConfirmation` avec des données fictives (prénom "Aïcha", montant 35€, produits simulés).

## Fichiers

### 1. Créer `src/pages/DonationPreview.tsx`
- Importe `DonationConfirmation` et `Layout`
- Passe des props fictives : `beneficiaryName="Aïcha"`, `amount=35`, quelques produits simulés, un `emergencyPack` optionnel
- Enveloppé dans `<Layout>`

### 2. Modifier `src/App.tsx`
- Ajouter `import DonationPreview` + route `/donation-preview`
- Corriger l'erreur runtime : retirer l'import `ThemeShowcase` et la route `/themes` (le fichier a été supprimé précédemment)

## Accès
Naviguer vers `/donation-preview` pour voir directement le bloc post-don avec les icônes sociales, la preuve d'impact et la timeline.

