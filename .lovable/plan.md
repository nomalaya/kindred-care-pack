

# Stratégie réseaux sociaux — CashForCause

## Liens sociaux
- Instagram : `https://www.instagram.com/cashforcause_fr/`
- TikTok : `https://www.tiktok.com/@cashforcause`
- LinkedIn : `https://www.linkedin.com/company/cashforcause`

## Fichiers à créer

### 1. `src/lib/socialLinks.ts`
Constantes centralisées : URLs des 3 réseaux + composants SVG inline pour Instagram, TikTok, LinkedIn (Lucide n'a pas TikTok).

### 2. `src/components/SocialIcons.tsx`
Composant réutilisable avec deux variantes :
- **`subtle`** : icônes 16px, `opacity-40 hover:opacity-70`, transition douce, aucun texte — pour header/footer
- **`post-don`** : icônes 20px, opacité normale, avec labels "Voir l'impact" — pour confirmation

### 3. `src/components/PostDonSocialBlock.tsx`
Bloc post-don avec :
- Titre : "Vous venez d'aider {prénom}"
- Sous-texte : "Votre don permet l'envoi d'un colis alimentaire sous 48h."
- CTA principal : bouton "Partager mon action" (`navigator.share` ou copie lien)
- CTA secondaires : "Voir l'impact réel" (→ Instagram), "Suivre les actions CashForCause" (→ LinkedIn)
- Icônes Instagram / TikTok / LinkedIn en dessous
- Animation framer-motion, apparition avec delay 1.2s

### 4. `src/components/ImpactProofSection.tsx`
Section preuve sociale visuelle :
- Titre : "Voir l'impact réel"
- 3 blocs avec icônes (Package, Truck, Heart) + compteurs crédibles ("+2 847 colis financés cette semaine")
- CTA : "Voir les actions" → lien Instagram
- Style glassmorphism cohérent avec le design system

## Fichiers à modifier

### 5. `src/components/Navbar.tsx`
- Desktop uniquement (`hidden md:flex`) : ajouter les 3 icônes sociales variante `subtle` entre les liens de nav et le bouton "Je donne"
- Aucun texte, aucune animation, taille petite, faible contraste
- Correction du bug existant : double `<Link>` imbriqué ligne 69

### 6. `src/components/Layout.tsx` — Footer
- Ajouter les icônes sociales variante `subtle`
- Ajouter texte discret : "Suivez les histoires et l'impact des dons" en `text-muted-foreground/60`

### 7. `src/components/checkout/OrderConfirmation.tsx`
- Insérer `PostDonSocialBlock` après le bloc "Actions" (reçu/partager) ligne 220
- Insérer `ImpactProofSection` après le Social Proof existant ligne 309
- Props : `beneficiaryName={beneficiary.alias_first_name}`

### 8. `src/components/DonationConfirmation.tsx`
- Insérer `PostDonSocialBlock` après le Social Proof (ligne 164)
- Insérer `ImpactProofSection` en dessous
- Props : `beneficiaryName={beneficiaryName}`

## Vérifications de non-régression
- **Pages funnel** (BeneficiarySelection, DonationFlow, CauseSelection, UpsellDonation, CheckoutFlow) : aucune modification → zéro présence sociale
- Le composant `SocialProof` existant reste inchangé

## Résumé : 4 fichiers créés, 4 fichiers modifiés

