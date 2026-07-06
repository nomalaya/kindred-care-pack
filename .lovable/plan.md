## Objectif

Rendre la zone **Versions** de l'Avatar Studio cohérente et lisible en desktop, tablette et mobile, en prenant la taille des vignettes desktop (~96 px) comme référence, avec un scroll interne stable et au moins 9 vignettes visibles sans scroll excessif. Modifications UI uniquement dans `src/pages/AvatarStudio.tsx`. Aucune modification du back-end, des prompts, des modèles, des attributs, du cadrage, du SQL ou des RPC.

## Constat

- La colonne 2 fait `320px` en desktop (`lg`), mais en tablette/mobile la grille passe en pleine largeur : les vignettes en `grid-cols-2/3` deviennent énormes.
- Le scroll (`flex-1 min-h-[180px] overflow-y-auto`) ne s'active pas fiablement car la colonne n'a pas de hauteur stable en dessous de `lg`.
- Le bouton `Publier l'avatar` est en `flex-1` sans plafond → prend toute la largeur en tablette.
- Le badge « Actif » et le ring paraissent différents selon la taille de vignette (perception), pas selon le code.

## Plan (UI uniquement, un seul fichier)

### 1. Grille Versions à taille de vignette fixe (référence desktop ~96 px)

Dans `src/pages/AvatarStudio.tsx` (lignes ~1206-1207), remplacer la grille `grid-cols-2 min-[360px]:grid-cols-3` par une grille auto-fill qui garde la taille desktop comme référence sur les 3 modes :

```tsx
<div
  className="grid gap-1.5 pb-2"
  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))" }}
>
```

Effet :
- desktop (colonne 320 px) → 3 colonnes, vignettes ~96 px ;
- tablette (pleine largeur) → 6–8 colonnes de ~88–100 px ;
- mobile (~360 px) → 3–4 colonnes de ~88 px.

Plus jamais de vignettes géantes ou serrées.

### 2. Scroll interne fiable sur les 3 modes

- Sur le wrapper interne des vignettes (ligne 1206), utiliser `flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1` (au lieu de `min-h-[180px] max-h-full`).
- S'assurer que la chaîne `flex flex-col min-h-0` remonte bien jusqu'au `<section>` colonne 2, pour que la hauteur bornée par `h-[calc(100dvh-64px)]` (ligne 987) descende correctement en desktop.
- En dessous de `lg`, ajouter un plafond explicite `max-h-[46vh]` sur le wrapper scrollable pour garantir qu'au moins 9 vignettes (3×3 ≈ 280 px) tiennent sans pousser le footer sticky hors écran, et que le scroll interne s'active au lieu de scroller toute la page.

### 3. Bouton « Publier l'avatar » — largeur raisonnable en tablette

Ligne ~1299, remplacer `flex-1 …` par une largeur bornée à partir de `sm` :

```tsx
className={`flex-1 sm:flex-none sm:min-w-[180px] sm:max-w-[280px] ${
  isPublish ? "bg-cta hover:bg-cta/90 text-cta-foreground" : ""
}`}
```

Le bouton reste pleine largeur en mobile étroit, mais est plafonné dès `sm` (≥640 px) — plus de bouton « Publier » disproportionné en tablette.

### 4. Marqueur « avatar actif » strictement identique sur les 3 modes

Le code du marqueur est unique (ring primary + badge « Actif » top-left) ; l'incohérence perçue vient de la taille des vignettes. Une fois la taille normalisée (point 1) :

- conserver `ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md` ;
- forcer le badge « Actif » à `text-[10px] leading-none whitespace-nowrap` pour qu'il ne se coupe jamais, quelle que soit la vignette ;
- ajouter `aria-current="true"` sur la vignette active pour l'accessibilité.

### 5. Vérification

Tester `/avatar-studio` via Playwright à 3 tailles et lire les captures :

- 1440×900 (desktop) ;
- 820×1180 (tablette) ;
- 375×800 (mobile).

Vérifier sur chaque capture :
- 9 vignettes visibles sans scroll de page (scroll interne uniquement) ;
- taille de vignette ~88–100 px identique sur les 3 modes ;
- bouton « Publier » plafonné en tablette ;
- ring + badge « Actif » identiques et bien visibles.

## Hors périmètre

Aucune modification de : génération IA, prompts, modèles, attributs, fonds, cadrage, SQL, RPC, edge functions, RLS, ni d'autres pages que `src/pages/AvatarStudio.tsx`.