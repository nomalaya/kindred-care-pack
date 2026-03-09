
# Plan de remplacement du logo CashForCause

## Analyse
L'utilisateur souhaite remplacer le logo actuel (cœur rose de Lucide React) par son SVG personnalisé uniquement dans les zones de marque, et résoudre une erreur de migration de base de données.

### Emplacements du logo de marque identifiés :
1. **Navbar** : `src/components/Navbar.tsx` - ligne 22
2. **Page Auth** : `src/pages/Auth.tsx` - ligne 60  
3. **Page ThemeShowcase** : `src/pages/ThemeShowcase.tsx` - ligne 183
4. **Favicon** : `index.html` (actuellement `favicon.ico`)

Les icônes Heart dans les boutons/étapes (DonationFlow, HowItWorks, EmergencyUpsell, etc.) resteront inchangées.

## Étapes d'implémentation

### 1. Analyser le fichier SVG fourni
- Vérifier les dimensions et structure du SVG
- S'assurer qu'il est optimisé pour différentes tailles

### 2. Préparer les assets
- Copier le SVG vers `src/assets/logo.svg`
- Créer une version favicon si nécessaire

### 3. Créer un composant Logo réutilisable
**Fichier**: `src/components/Logo.tsx`
```typescript
interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}
```
- Props pour taille et classes CSS
- Import direct du SVG pour préserver la qualité vectorielle

### 4. Remplacer dans les composants
**Modifications** :
- `src/components/Navbar.tsx` : remplacer `<Heart>` par `<Logo>`
- `src/pages/Auth.tsx` : remplacer `<Heart>` par `<Logo>`  
- `src/pages/ThemeShowcase.tsx` : remplacer `<Heart>` par `<Logo>`

### 5. Mettre à jour le favicon
- Exporter une version PNG/ICO depuis le SVG
- Modifier `index.html` pour référencer le nouveau favicon

### 6. Tests de rendu
- Vérifier l'affichage sur desktop/mobile
- Contrôler les proportions dans différents contextes
- S'assurer de la netteté sur tous les écrans

## Contraintes respectées
- **SVG vectoriel** : Pas de rasterisation, import direct
- **Fond transparent** : Préservé par défaut SVG
- **Responsive** : Tailles adaptatives via props
- **Qualité** : Netteté garantie sur tous écrans
- **Scope limité** : Seulement logo de marque, pas les icônes décoratives

## Architecture technique
```
src/assets/logo.svg          // Fichier SVG source
src/components/Logo.tsx      // Composant réutilisable
public/favicon.png          // Favicon généré
```

Le composant Logo encapsulera le SVG avec des props pour la taille et les styles, garantissant une implémentation cohérente dans toute l'application.
