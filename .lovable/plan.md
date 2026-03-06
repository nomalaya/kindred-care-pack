

## Modifier le titre Hero dans `/themes`

**Fichier** : `src/pages/ThemeShowcase.tsx`, lignes ~97-100

**Avant** :
```tsx
<h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
  Donnez à une <span className="text-gradient-primary">vraie personne</span>,
  <br />pas juste à une cause.
</h2>
```

**Après** :
```tsx
<h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
  Choisissez qui vous voulez{" "}
  <span className="text-gradient-primary">aider concrètement.</span>
</h2>
```

Alignement avec le titre standardisé utilisé sur toutes les pages principales.

