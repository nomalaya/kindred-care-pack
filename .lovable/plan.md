

# Nouvelles déclinaisons C5 avec couleurs secondaires du design system

## Couleurs disponibles (en plus du primary émeraude)
- **Secondary** : `hsl(107, 45%, 53%)` — vert clair / lime
- **Accent** : `hsl(44, 100%, 42%)` — doré / ambre
- **CTA** : `hsl(330, 65%, 52%)` — rose / magenta

## 3 nouvelles variantes à ajouter

### C6 — Émeraude + Doré (accent)
- Cercle actif : `bg-primary` avec pulse émeraude
- Cercles inactifs : `bg-accent/15 border-accent/30 text-accent`
- Barre de progression : dégradé `from-primary to-accent`
- Fond : `bg-gradient-to-r from-primary/5 to-accent/5`
- Bordure : `border-accent/15`

### C7 — Émeraude + Rose (cta)
- Cercle actif : `bg-primary` avec pulse émeraude
- Cercles inactifs : `bg-cta/10 border-cta/25 text-cta/60`
- Barre de progression : `bg-primary` puis dégradé vers `cta`
- Fond : `bg-card/80 backdrop-blur-sm` (glassmorphism conservé)
- Bordure : `border-cta/15`
- Ombre : `shadow-warm`

### C8 — Émeraude + Vert clair (secondary)
- Cercle actif : `bg-primary` avec pulse émeraude
- Cercles inactifs : `bg-secondary/15 border-secondary/30 text-secondary`
- Barre de progression : dégradé `from-primary to-secondary`
- Fond : `bg-gradient-to-r from-primary/5 to-secondary/5`
- Bordure : `border-secondary/15`

## Fichier modifié
- `src/pages/TimelineShowcase.tsx` — ajouter C6, C7, C8 après les 5 variantes existantes

