

# Amélioration du design de la page Causes

## Constat actuel
- Les cartes sont fonctionnelles mais plates : photo + texte + badges + bouton CTA
- Le bouton "Choisir cette cause →" est redondant car toute la carte est déjà cliquable (Link)
- Les compteurs de bénéficiaires sont utiles mais pourraient être mieux intégrés visuellement
- Le header est minimaliste, le social proof peu visible

## Modifications prévues

### 1. Supprimer les boutons CTA
Retirer le `<Button>` "Choisir cette cause →" de chaque carte. La carte entière reste cliquable via le `<Link>`.

### 2. Améliorer les cartes visuellement
- **Photo plus grande** : passer de `h-40` à `h-48` pour donner plus de présence aux photos documentaires
- **Titre sur la photo** : positionner le titre en overlay sur le gradient bas de la photo (blanc sur fond sombre) pour un effet éditorial plus impactant
- **Badges repositionnés** : placer les compteurs (bénéficiaires + proximité) en overlay semi-transparent en haut à gauche de la photo
- **Description plus aérée** : seule la description reste dans la zone blanche sous la photo
- **Hover amélioré** : ajouter un léger `ring` primaire au hover + translation Y `-2px` pour un effet de lift

### 3. Améliorer le header
- Ajouter un sous-titre plus émotionnel et engageant
- Rendre le social proof plus visible avec une taille légèrement plus grande

### Rendu visuel attendu

```text
┌──────────────────────────────┐
│  [32 bénéficiaires]     photo│
│                              │
│                              │
│  ▓▓▓ gradient ▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  Aider un enfant en aidant   │
│  sa famille                  │
├──────────────────────────────┤
│  Soutenez les familles qui   │
│  peinent à subvenir aux...   │
│                              │
│  📍 7 proches de chez vous   │
└──────────────────────────────┘
```

### Fichier modifié
- `src/pages/CauseSelection.tsx` — suppression du CTA, repositionnement du titre en overlay, badges en haut de la photo, hover amélioré

