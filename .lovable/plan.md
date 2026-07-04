## Contexte

Ces correctifs avaient été validés lors d'un échange précédent mais n'ont pas été appliqués. Ils portent uniquement sur `src/pages/AvatarStudio.tsx` (frontend, pas de logique backend touchée).

## 1. Boutons « Prévisualiser » et « Générer HD » — libellés complets

Fichier : `src/pages/AvatarStudio.tsx` (lignes 1117 et 1134).

Retirer la classe `truncate` sur les `<span>` afin que les libellés s'affichent en entier :

```tsx
<span>Prévisualiser</span>
<span>Générer HD</span>
```

## 2. Retirer l'indicateur « Publiée » + point vert (colonne 2, en-tête Versions)

Fichier : `src/pages/AvatarStudio.tsx` (lignes 1188-1196).

Supprimer entièrement le `<span>` de droite (« Publiée » avec swatch). La bague `ring-primary` visible sur la vignette active suffit à identifier la version publiée. Le header devient :

```tsx
<div className="flex items-center mb-1 shrink-0">
  <h3 className="text-xs font-medium flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
    <History className="h-3 w-3" />Versions ({versions.length})
  </h3>
</div>
```

## 3. Supprimer Navbar + Footer sur `/avatar-studio`

Fichier : `src/pages/AvatarStudio.tsx`.

- Ligne 3 : retirer `import Layout from "@/components/Layout";`
- Lignes 877-881 (état loading) : remplacer `<Layout>…</Layout>` par `<div className="min-h-screen bg-background">…</div>`
- Lignes 893 et 1785 : remplacer les balises `<Layout>` / `</Layout>` par `<div className="min-h-screen bg-background">` / `</div>`

Aucune autre page n'est touchée — la Navbar et le footer restent partout ailleurs.

## 4. Compacter la topbar interne (Admin · Avatar Studio)

Fichier : `src/pages/AvatarStudio.tsx` (lignes 896-978).

Optimisations pour passer d'environ 56 px à environ 36 px de hauteur :

- Ligne 896 : retirer `sticky top-0 z-20`, `backdrop-blur`, réduire à `-mx-4 px-4 py-1 mb-2 border-b border-border/50`.
- Ligne 899 : bouton Admin icon-only — `<Button variant="ghost" size="icon" className="h-7 w-7"><ArrowLeft className="h-4 w-4" /></Button>` avec `title="Retour Admin"`.
- Ligne 902 : `text-sm font-semibold` au lieu de `text-lg font-bold`.
- Ligne 916 : `w-48` au lieu de `w-64`, `h-7` au lieu de `h-8`.
- Lignes 962, 966 : boutons Refresh et Keyboard en `size="icon" className="h-7 w-7"`.
- Ligne 932 : boutons filtres `text-xs px-2 py-0.5` (au lieu de `py-1`).

## 5. Ajuster la hauteur de la grille principale

Fichier : `src/pages/AvatarStudio.tsx` (ligne 981).

`h-[calc(100vh-120px)]` → `h-[calc(100dvh-64px)]` (topbar ~36 px + paddings ~28 px). Cela redonne ~56 px de hauteur aux 3 colonnes, ce qui rend les 9 versions visibles sans scroll interne.

## Portée

- Un seul fichier modifié : `src/pages/AvatarStudio.tsx`.
- **Aucun changement** : base de données, RLS, edge functions, backend matching/panier, autres pages, autres composants.
