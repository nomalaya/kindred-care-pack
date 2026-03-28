

# Page "Avantage fiscal" — Page pédagogique orientée conversion

## Nouveau fichier : `src/pages/TaxAdvantage.tsx`

Page accessible via `/avantage-fiscal`, structurée en 8 sections verticales. Utilise Layout, les tokens du design system (ANIM, CARD_STYLES, SECTION_HEADER), le composant TaxDeductionOptionC existant, et le Slider pour le calculateur interactif. Taux strictement 66% (constante `TAX_DEDUCTION_RATE`).

---

## Structure des 8 sections

### 1. Hero
- Titre : **"Donner vous coûte moins que vous ne le pensez"**
- Sous-titre : "66% de votre don vous est remboursé sous forme de réduction d'impôt. Un don de 50€ ne vous coûte réellement que 17€."
- CTA : "Faire un don" → `/causes`
- Icône Heart animée

### 2. Combien ça vous coûte vraiment
- Slider interactif (20€–150€) réutilisant le pattern du TaxShowcase
- Composant `TaxDeductionOptionC` intégré sous le slider (cartes Don → Coût réel avec badge −66%)
- 3 exemples fixes en grille : 50€→17€ / 90€→30,60€ / 100€→34€
- Chaque exemple dans une carte `bg-primary/5` avec montants en gras

### 3. Pourquoi vous avez droit à cet avantage
- Carte avec icône ShieldCheck
- Texte court : CashForCause aide des personnes en difficulté dans un cadre reconnu par l'État français. La loi encourage la générosité en vous permettant de déduire 66% de vos dons de vos impôts, dans la limite de 20% de votre revenu imposable.
- Ton rassurant, pas de jargon

### 4. Comment ça marche — 3 étapes
- Pattern identique à HowItWorks (icône + titre + description)
- Étape 1 : Heart → "Vous faites un don" / "Choisissez une cause et un montant"
- Étape 2 : FileText → "Vous recevez votre reçu fiscal" / "Disponible dans votre espace donateur"
- Étape 3 : CheckCircle → "Vous le déclarez en ligne" / "Rien à joindre, conservez simplement votre reçu"

### 5. Quand déclarer — Timeline
- Pattern ImpactTimeline adapté avec 3 points :
  - Calendar → "Don effectué en 2026"
  - ClipboardList → "Déclaration au printemps 2027"
  - Wallet → "Remboursement été 2027"
- Note : "La réduction s'applique l'année suivant votre don"

### 6. Vos reçus fiscaux
- Carte avec icône Download
- 3 points : disponibles dans l'espace donateur / téléchargeables à tout moment / possibilité de reçu global annuel
- CTA secondaire : "Accéder à mon espace" → `/dashboard`

### 7. Section rassurance
- 3 colonnes (grille responsive) :
  - Lock → "Paiement 100% sécurisé"
  - ShieldCheck → "Organisme d'intérêt général reconnu"
  - Clock → "3 minutes pour déclarer"

### 8. CTA final
- Fond `bg-primary/5`, centré
- Titre : "Prêt à faire la différence ?"
- Sous-titre : "Chaque don compte. Et il vous coûte moins que vous ne le pensez."
- 2 boutons : "Faire un don" (CTA) + "Voir mon impact" (outline → `/dashboard`)

---

## Modifications complémentaires

### `src/App.tsx`
- Ajouter route `/avantage-fiscal` → TaxAdvantage

### `src/components/Navbar.tsx`
- Ajouter lien "Avantage fiscal" dans la navigation desktop et mobile, entre "Comment ça marche" et le bouton connexion

---

## Fichiers concernés
1. **Créer** `src/pages/TaxAdvantage.tsx`
2. **Modifier** `src/App.tsx` — 1 route
3. **Modifier** `src/components/Navbar.tsx` — 1 lien (desktop + mobile)

