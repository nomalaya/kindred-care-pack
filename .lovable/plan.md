## Diagnostic

Le compteur affiche bien `Versions (9)`, donc les données existent. Le problème vient de la mise en page de la colonne 2 :

1. La colonne est très étroite (`320px`) et la grille force `3` colonnes. Chaque vignette devient petite, mais la zone disponible restante est aussi très réduite à cause du header, des boutons et du footer sticky.
2. Le conteneur de scroll ajouté est probablement dans une chaîne flex/grid qui ne reçoit pas une hauteur stable dans certains contextes desktop/tablet. Résultat : `overflow-y-auto` existe dans le code, mais il n’a pas assez de hauteur calculable pour déclencher un vrai scroll visible/actif.
3. Les boutons `Prévisualiser` et `Générer HD` sont en `flex-1 min-w-0`, mais leur contenu interne ne peut pas se compresser proprement : icône + texte + touche clavier restent sur une seule ligne dans une largeur trop faible, donc le contenu déborde visuellement.

## Plan de correction

### 1. Rendre les 9 versions réellement accessibles

Dans `src/pages/AvatarStudio.tsx`, remplacer la zone des versions par une structure à hauteur garantie :

- garder l’en-tête `Versions (9)` fixe ;
- donner à la zone scroll une hauteur minimale et maximale calculée ;
- ajouter `overscroll-contain` et un padding de fin pour éviter que le footer sticky masque la dernière ligne ;
- rendre la grille adaptative au lieu de forcer systématiquement 3 colonnes.

Approche prévue :

```tsx
<div className="flex-1 min-h-[180px] max-h-full overflow-y-auto overscroll-contain pr-1">
  <div className="grid grid-cols-2 min-[360px]:grid-cols-3 gap-1.5 pb-12">
    ...
  </div>
</div>
```

Sur une colonne très étroite, 2 colonnes permettront de mieux répartir les vignettes et de rendre le scroll plus évident. Dès que la largeur le permet, on revient à 3 colonnes.

### 2. Activer le scroll en desktop view

Ajuster les parents directs de la colonne 2 pour éviter les conflits `sticky + flex + overflow-hidden` :

- conserver `min-h-0` sur les parents flex ;
- ajouter une hauteur interne explicite à la section visuelle ;
- éviter que le contenu des versions soit calculé comme une simple hauteur automatique ;
- si nécessaire, remplacer la répartition actuelle par `grid-rows-[auto_minmax(0,1fr)_auto]` pour que le centre soit la seule zone scrollable.

Structure cible de la colonne 2 :

```text
section colonne 2
  header fixe
  contenu central scrollable/flexible
    alertes éventuelles
    actions
    versions avec scroll interne actif
  footer fixe
```

### 3. Empêcher tout débordement dans les boutons

Modifier les deux boutons d’action pour que le contenu reste toujours à l’intérieur :

- retirer les marges manuelles `mr-1`/`ml-1` qui s’ajoutent au `gap` du composant Button ;
- ajouter `overflow-hidden` sur le bouton ;
- mettre le texte dans un `<span className="min-w-0 truncate">...` ;
- masquer la touche clavier `P` / `G` quand la largeur est trop faible ;
- garder l’icône en `shrink-0` ;
- réduire légèrement le padding horizontal dans cette rangée.

Approche prévue :

```tsx
<Button className="flex-1 min-w-0 overflow-hidden px-2">
  <RefreshCw className="h-3.5 w-3.5 shrink-0" />
  <span className="min-w-0 truncate">Prévisualiser</span>
  <kbd className="hidden min-[380px]:inline-flex shrink-0 ...">P</kbd>
</Button>
```

Même logique pour `Générer HD`.

### 4. Vérification visuelle

Après implémentation, vérifier `/avatar-studio` en desktop étroit proche du cas observé (`1070x639`) :

- `Versions (9)` reste affiché ;
- les versions au-delà des 4 premières sont accessibles via scroll interne ;
- aucun contenu de bouton ne dépasse ;
- `Importer une image` reste sur la même ligne.