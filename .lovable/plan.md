

## Modification du titre hero

Modifier le `h1` dans `src/pages/Index.tsx` (lignes 41-44) :

```tsx
<h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-foreground">
  Choisissez la cause qui vous touche.
  <br />
  <span className="text-gradient-primary">Aidez concrètement une vraie personne.</span>
</h1>
```

Première ligne en `foreground` neutre, deuxième ligne en gradient primary→secondary existant.

