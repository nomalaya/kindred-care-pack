

## Modification du titre hero

Modifier le `h1` dans `src/pages/Index.tsx` (lignes 41-44) :

```tsx
<h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-foreground">
  Aidez concrètement{" "}
  <span className="text-gradient-primary">une vraie personne.</span>
</h1>
```

Texte principal en `foreground`, seul "une vraie personne." en gradient primary→secondary.

