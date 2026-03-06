

## Mise à jour du H1 sur toutes les pages

Appliquer le même format que la homepage : "Choisissez qui vous voulez **aider concrètement.**" avec `text-gradient-primary` sur "aider concrètement." — sur les pages suivantes :

### Pages à modifier

1. **ThemeShowcase.tsx** (ligne 65-67) : Remplacer "Comparaison des thèmes — CashForCause"
2. **CauseSelection.tsx** (ligne 31) : Remplacer "Choisissez une cause"
3. **BeneficiarySelection.tsx** (ligne 80) : Remplacer "Découvrez qui vous pouvez aider"
4. **HowItWorks.tsx** (ligne 17) : Remplacer "Comment ça marche"
5. **Dashboard.tsx** (ligne 60) : Remplacer "Mes dons"

### Pages exclues
- **Index.tsx** : Déjà fait
- **Auth.tsx** : Contexte différent (login/signup)
- **Admin.tsx** : Page technique, pas orientée donateur
- **NotFound.tsx** : Page d'erreur 404

### Format uniforme
```tsx
<h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
  Choisissez qui vous voulez{" "}
  <span className="text-gradient-primary">aider concrètement.</span>
</h1>
```

