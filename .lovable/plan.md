

## Titre hero minimaliste avec accent couleur

Modifier le `h1` dans `src/pages/Index.tsx` (lignes 41-44) :

```tsx
<h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-foreground">
  Un don simple.{" "}
  <span className="text-gradient-primary">Une aide concrète.</span>
  <br />
  Une personne soutenue.
</h1>
```

Un seul segment en gradient primary→secondary, le reste en `foreground` neutre. Pas de nouvelle classe CSS nécessaire — `text-gradient-primary` existe déjà dans `index.css`.

