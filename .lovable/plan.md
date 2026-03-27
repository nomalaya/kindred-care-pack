

# Page showcase des 3 options visuelles — Déduction fiscale

## Objectif
Créer une page `/tax-showcase` affichant les 3 options côte à côte avec un slider de montant interactif (20€ → 150€) pour voir l'animation en temps réel. Respecte le design system (Inter, couleurs CSS variables, spacing 4px grid, ANIM presets, CARD_STYLES, SHADOWS).

## Fichiers à créer / modifier

### 1. `src/pages/TaxShowcase.tsx` — nouvelle page

Contient :
- Un slider interactif pour choisir le montant (20–150€)
- Les 3 options rendues en colonne, chacune dans une card (`CARD_STYLES.inner`)
- Titre de section avec `SECTION_HEADER` pattern

### 2. `src/components/TaxDeductionOptionA.tsx` — Cercles chevauchants

Fidèle au modèle image fourni :
- Cercle gauche (bordure `primary`, fond transparent) : "Je fais un don de **X€**"
- Cercle droit (fond `primary/10`, bordure `primary`) : "Mon don me coûte **Y€**"
- Badge rond positionné entre les deux (fond `cta`, texte `cta-foreground`) : "75%"
- Flèche SVG courbe reliant les deux cercles
- Mention "Loi Coluche" en `caption`
- Valeurs animées avec `AnimatePresence`

### 3. `src/components/TaxDeductionOptionB.tsx` — Barre de progression

- Barre horizontale pleine largeur, hauteur 40px, `rounded-lg`
- Segment gauche (75%) : fond `primary/20` avec texte "Récupéré : X€" en `primary`
- Segment droit (25%) : fond `cta` avec texte "Coût réel : Y€" en `cta-foreground`
- Au-dessus : "Votre don : Z€" centré, `font-bold`
- Badge "75%" en `primary` au-dessus de la jonction
- Animation de largeur avec `motion.div layout`

### 4. `src/components/TaxDeductionOptionC.tsx` — Carte avant/après

- Deux cartes côte à côte dans un `flex gap-6`
- Carte gauche : fond `card`, bordure `border`, titre "Votre don", montant grand `text-2xl font-bold`
- Carte droite : fond `primary/5`, bordure `primary/20`, titre "Coût réel après impôt", montant `text-2xl font-bold text-primary`
- Flèche animée entre les deux (icône `ArrowRight` de lucide)
- Badge "−75%" en overlay sur la flèche, fond `cta`, animation `scale` au mount
- Valeurs animées avec `AnimatePresence`

### 5. `src/App.tsx` — ajouter la route

```
<Route path="/tax-showcase" element={<TaxShowcase />} />
```

## Tokens design system utilisés
- Couleurs : `primary`, `cta`, `muted-foreground`, `foreground`, `card`, `background`
- Spacing : `p-6`, `p-8`, `gap-6`, `space-y-6`, `mb-4`, `mb-12`
- Radius : `rounded-2xl` (cards), `rounded-full` (badges/cercles)
- Shadows : `shadow-card`
- Typography : `TYPOGRAPHY.h2`, `TYPOGRAPHY.caption`, `TYPOGRAPHY.bodySmall`
- Animations : `ANIM.fadeInUp`, `ANIM.scaleButton`
- Font : Inter (hérité)

## Taux utilisé
75% (Loi Coluche) avec plafond 2000€. Calcul : `realCost = amount - Math.round(amount * 0.75)`.

