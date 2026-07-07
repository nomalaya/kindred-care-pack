## Problèmes

1. **Cadre (ring) de l'avatar actif coupé en haut et à gauche**
   - La vignette utilise `ring-2 ring-primary ring-offset-2` → le contour s'étend d'environ **4 px à l'extérieur** de la vignette.
   - Le conteneur scrollable parent (`src/pages/AvatarStudio.tsx` ligne 1206) n'a **aucun padding** côté haut/gauche (`pr-1` uniquement) et applique `overflow-y-auto`, qui coupe tout ce qui dépasse.
   - Résultat : sur la vignette de la 1re ligne / 1re colonne, seuls les côtés droit et bas du cadre restent visibles.

2. **Badge « Actif » trop chargé**
   - L'icône `CheckCircle2` précédant le texte « Actif » réduit l'espace disponible dans le badge et alourdit visuellement la petite vignette.

## Correctifs (UI uniquement, `src/pages/AvatarStudio.tsx`)

### 1. Padding autour de la grille pour éviter de couper le ring

Ligne 1206, remplacer :

```tsx
<div className="flex-1 min-h-0 max-h-[46vh] lg:max-h-full overflow-y-auto overscroll-contain pr-1">
```

par :

```tsx
<div className="flex-1 min-h-0 max-h-[46vh] lg:max-h-full overflow-y-auto overscroll-contain p-1">
```

Effet : 4 px de padding sur les 4 côtés du conteneur scrollable → le ring de 2 px + offset 2 px de la vignette active en bord de grille est intégralement visible sur desktop, tablette et mobile.

### 2. Supprimer l'icône du badge « Actif »

Lignes 1236-1244, remplacer le bloc actuel :

```tsx
{isActive && (
  <span
    className="absolute top-0 left-0 text-[10px] leading-none whitespace-nowrap px-1.5 py-0.5 rounded-br pointer-events-none font-semibold flex items-center gap-0.5 bg-primary text-primary-foreground"
    title="C'est l'avatar affiché publiquement. Les prochaines retouches partiront de cette image."
  >
    <CheckCircle2 className="h-2.5 w-2.5" />
    Actif
  </span>
)}
```

par :

```tsx
{isActive && (
  <span
    className="absolute top-0 left-0 text-[10px] leading-none whitespace-nowrap px-1.5 py-0.5 rounded-br pointer-events-none font-semibold bg-primary text-primary-foreground"
    title="C'est l'avatar affiché publiquement. Les prochaines retouches partiront de cette image."
  >
    Actif
  </span>
)}
```

Effet : le badge affiche uniquement le texte « Actif », plus lisible et moins encombré sur les petites vignettes.

## Vérification

Playwright sur `/avatar-studio` à 1440×900, 820×1180, 375×800 → capture de la zone Versions, confirmer :
- le cadre de l'avatar actif est visible sur les 4 côtés (même en 1re ligne / 1re colonne) ;
- le badge « Actif » n'affiche plus l'icône ronde avec coche.

## Hors périmètre

Aucune modification : génération IA, prompts, modèles, attributs, fonds, cadrage, SQL, RPC, edge functions, autres pages.
