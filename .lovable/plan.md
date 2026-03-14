

# Plan : Design System UI/UX complet pour CashForCause

Ce plan couvre trois volets : (1) un fichier de référence centralisé avec tous les tokens, (2) l'enrichissement de la page /design comme documentation vivante, (3) la normalisation des composants existants.

---

## 1. Fichier de référence centralisé — `src/lib/designSystem.ts`

Créer un fichier unique exportant tous les tokens et conventions du projet :

**Tokens exportés :**
- **Typography** : `FONT_FAMILY`, échelle de tailles (`xs` à `5xl`), poids (`light` à `extrabold`), classes prédéfinies (`heading1`, `heading2`, `heading3`, `body`, `bodySmall`, `caption`, `label`)
- **Spacing** : échelle de base (4px grid : `1` = 4px, `2` = 8px… jusqu'à `20` = 80px), espaces sémantiques (`sectionGap`, `cardPadding`, `cardPaddingMobile`, `stackGap`, `inlineGap`)
- **Radius** : `sm`, `md`, `lg`, `xl`, `2xl`, `full` (reprend `--radius` et ses dérivés)
- **Shadows** : `card`, `cardHover`, `warm`, `warmLg` (reprend les shadows custom du tailwind.config)
- **Animation presets** : `fadeInUp`, `staggerChildren`, `scaleButton`, `badgeFadeIn` — objets `{ initial, animate, transition }` réutilisables avec framer-motion
- **Color roles** : documentation des rôles sémantiques (primary = confiance, secondary = nature, cta = action, accent = chaleur, destructive = danger)
- **Breakpoints** : `sm`, `md`, `lg`, `xl`, `2xl` (repris de Tailwind)
- **Component tokens** : `CARD_STYLES` (classes communes aux cartes : `rounded-2xl p-8 shadow-card border`), `BADGE_SIZES` (`sm`, `md`, `lg`), `BUTTON_PRESETS` (CTA, primary, outline, ghost)

**Extraction des badges :** Déplacer `BADGE_STYLES`, `BADGE_CARD_BG`, `getBadgeStyle`, `getCardBg`, `genderizeBadge`, `getDisplayBadge`, `deduplicateBadges` depuis `BeneficiarySelection.tsx` dans `src/lib/badgeStyles.ts`. Importer dans BeneficiarySelection et DonationFlow.

---

## 2. Page /design enrichie — `ThemeShowcase.tsx`

Enrichir la page existante avec les sections manquantes pour couvrir 100% du design system. Nouvelles sections ajoutées :

### 2.1 Typographie
Afficher l'échelle typographique complète avec chaque niveau (h1→caption) en rendu réel + nom de la classe + taille.

### 2.2 Espacement
Grille visuelle montrant les espacements sémantiques (section gap, card padding, stack gap) avec des blocs colorés.

### 2.3 Rayon de bordure
Blocs carrés montrant chaque valeur de radius appliquée.

### 2.4 Ombres
Cartes côte à côte avec chaque shadow (`card`, `card-hover`, `warm`, `warm-lg`).

### 2.5 Animations
Boutons déclencheurs montrant chaque preset d'animation (fadeInUp, scale, stagger, badge fade).

### 2.6 Avatars
Les 3 tailles (`sm`, `md`, `lg`) avec les variantes SVG (genres, tons de peau, types de cheveux).

### 2.7 Sélecteur de montant
Remplacer le `SliderPreview` existant par le nouveau `DonationAmountSelector` avec les boutons `[-]` `[+]`.

### 2.8 Timeline
Afficher le composant `ImpactTimeline` réel.

### 2.9 Carte Impact
Afficher `DonationImpactCard` avec des données de démonstration.

### 2.10 Formulaires
Input, Label, Checkbox, Select — avec les états (default, focus, disabled, error).

### 2.11 Carte bénéficiaire complète
Afficher une carte de démonstration avec badge, fond coloré, avatar, hiérarchie prénom/âge/région, citation — pour servir de référence.

### 2.12 États interactifs
Montrer les effets hover sur les cartes (`shadow-lg`, `-translate-y-1`), les effets sur les badges (`brightness-110`).

---

## 3. Normalisation des composants existants

### 3.1 Classes de cartes uniformes
Actuellement, les cartes utilisent des classes incohérentes :
- `bg-card rounded-2xl p-8 shadow-card border` (BeneficiarySelection, DonationFlow)
- `bg-card rounded-2xl p-6 border shadow-card` (DonationBasket, ImpactTimeline, EmergencyUpsell)

Standardiser le padding : `p-6` pour les composants internes (basket, impact, timeline), `p-8` pour les cartes de page (bénéficiaire, cause, situation). Importer `CARD_STYLES.inner` / `CARD_STYLES.page` depuis le design system.

### 3.2 Effets hover uniformes
Appliquer partout le même pattern : `hover:shadow-lg hover:-translate-y-1 transition-all duration-300` + `group` sur la carte + `group-hover:text-primary` sur le titre.

Pages à aligner : `CauseSelection`, `SituationSelection`, `BeneficiarySelection` (déjà fait), `HowItWorks` (cartes étapes).

### 3.3 Back button uniforme
Extraire le bouton "Retour" (utilisé dans BeneficiarySelection, SituationSelection, DonationFlow) dans un composant `BackButton.tsx` réutilisable.

### 3.4 Titres de section uniformes
Standardiser le pattern titre + sous-titre des pages :
```
h1: text-3xl md:text-4xl font-bold text-foreground mb-4
p:  text-lg text-muted-foreground
```
Déjà cohérent entre CauseSelection, SituationSelection, BeneficiarySelection — vérifier et aligner HowItWorks et Index.

### 3.5 Badge styles centralisés
Comme décrit en section 1 : extraire dans `src/lib/badgeStyles.ts`, importer dans les 2 fichiers qui les utilisent.

### 3.6 Loading skeletons uniformes
Standardiser les placeholders de chargement : tous en `bg-card rounded-2xl animate-pulse` avec une hauteur cohérente par type de contenu.

---

## Fichiers modifiés / créés

| Action | Fichier |
|--------|---------|
| Créer | `src/lib/designSystem.ts` |
| Créer | `src/lib/badgeStyles.ts` |
| Créer | `src/components/BackButton.tsx` |
| Modifier | `src/pages/ThemeShowcase.tsx` (sections enrichies) |
| Modifier | `src/pages/BeneficiarySelection.tsx` (importer depuis badgeStyles) |
| Modifier | `src/pages/DonationFlow.tsx` (importer depuis badgeStyles, BackButton) |
| Modifier | `src/pages/CauseSelection.tsx` (hover uniforme) |
| Modifier | `src/pages/SituationSelection.tsx` (BackButton) |
| Modifier | `src/pages/HowItWorks.tsx` (alignement titre) |

## Ce qui ne change PAS
- Base de données, matching, edge functions, paiement
- Palette de couleurs (CSS variables inchangées)
- Structure des routes
- Composants UI shadcn (button, card, badge, input...)

