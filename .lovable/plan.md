## Portée

Un seul fichier : `src/pages/AvatarStudio.tsx`. Aucun changement backend, ni sur les autres pages.

## 1. Toutes les versions visibles (scroll interne)

Fichier : `src/pages/AvatarStudio.tsx` (lignes 1186-1259).

Le conteneur `flex-1 min-h-0 flex flex-col` existe déjà, mais la grille des vignettes n'a pas de zone scrollable. À l'écran actuel (639 px), 5 vignettes sur 9 sont tronquées.

Ajout d'une div de scroll autour de la grille :

```tsx
<div className="flex-1 min-h-0 flex flex-col">
  <div className="flex items-center mb-1 shrink-0">
    <h3 …>Versions ({versions.length})</h3>
  </div>
  {versions.length === 0 ? (
    <div …>Aucune version archivée.</div>
  ) : (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-3 gap-1.5 pb-1">
        {orderedVersions.map(v => …)}
      </div>
    </div>
  )}
</div>
```

Résultat : les 9 vignettes restent accessibles via scroll interne à la colonne « Avatar et variantes », sans casser la mise en page.

## 2. « Importer une image » sur la même ligne que Prévisualiser / Générer HD

Fichier : `src/pages/AvatarStudio.tsx` (lignes 1105-1165).

- Déplacer le bouton `Importer une image` (lignes 1154-1165) à l'intérieur du `<div className="flex gap-1.5 w-full">` (ligne 1106), après « Générer HD » et avant le `<input type="file">`.
- Rendre le bouton compact pour tenir sur la même ligne : `variant="outline"`, `size="sm"`, `className="shrink-0 px-2"`, icône `Upload` seule + `title="Importer une image (PNG/JPG/WEBP)"` + `aria-label="Importer une image"`.
- Conserver `onClick={() => importInputRef.current?.click()}` et `disabled={!!busy || isLocked}`.
- Supprimer le bloc `<Button …>Importer une image</Button>` d'origine (lignes 1154-1165).

## 3. Bouton « Publier l'avatar » avec une couleur dédiée du design system

Fichier : `src/pages/AvatarStudio.tsx` (lignes 1279-1295).

Le design system expose la couleur `cta` (rose corail, utilisée pour les CTA de don). Elle n'est utilisée nulle part dans Avatar Studio → parfaite pour distinguer visuellement l'action de publication des actions IA (primary/secondary).

Modifications :

- Ligne 1279 : retirer `variant: "default"` du descriptor `main` pour `Publier l'avatar` / `Publier malgré un QA faible`.
- Ligne 1284-1295 (le `mainBtn`) : appliquer une classe conditionnelle quand l'action est « publier » :

```tsx
const isPublish = ws === "generated";
const mainBtn = (
  <Button
    onClick={main.onClick}
    size="sm"
    variant={isPublish ? undefined : main.variant}
    disabled={!!main.hint}
    className={`flex-1 ${isPublish ? "bg-cta hover:bg-cta/90 text-cta-foreground" : ""}`}
  >
    …
  </Button>
);
```

Les autres états (Verrouiller, Déverrouiller) gardent leurs variants actuels (`secondary`, `outline`).
