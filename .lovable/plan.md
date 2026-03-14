

# Plan : Badges en haut à gauche, tranches d'âge, texte "aider concrètement"

## 1. Badges — repositionner en haut à gauche des cartes

Déplacer le badge de sa position actuelle (centré sous le nom) vers le coin **haut gauche** de la carte en `absolute`. Le badge garde ses couleurs actuelles (déjà harmonisées avec la palette du site dans le code existant).

**Fichier** : `src/pages/BeneficiarySelection.tsx`
- Supprimer le bloc badge centré (lignes 260-266)
- Ajouter le badge en `position: absolute top-4 left-4` dans la carte (qui a déjà `relative`)

## 2. Tranches d'âge — remplacer l'âge exact

Créer une fonction utilitaire `getAgeRange(age: number): string` avec des tranches cohérentes :

| Tranche | Affichage |
|---------|-----------|
| 18-24 | "18-25 ans" |
| 25-34 | "25-35 ans" |
| 35-44 | "35-45 ans" |
| 45-54 | "45-55 ans" |
| 55-64 | "55-65 ans" |
| 65-74 | "65-75 ans" |
| 75+ | "75+ ans" |

Remplacer `{b.approx_age} ans` par `getAgeRange(b.approx_age)` dans :
- `src/pages/BeneficiarySelection.tsx` (carte bénéficiaire)
- `src/pages/DonationFlow.tsx` (page de don)
- `src/components/checkout/OrderConfirmation.tsx` (confirmation)
- `src/pages/Admin.tsx` reste inchangé (admin = données exactes)

## 3. Texte "aider concrètement" → "aider"

Remplacer dans **2 fichiers** :
- `src/pages/Index.tsx` ligne 43 : `aider concrètement.` → `aider.`
- `src/pages/ThemeShowcase.tsx` ligne 206 : `aider concrètement.` → `aider.`

## Ce qui ne change PAS
- Matching, RPC, edge functions, checkout, paiement
- Couleurs des badges (déjà implémentées)
- Structure des pages
- Admin (conserve l'âge exact)

