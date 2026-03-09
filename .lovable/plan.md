
## Problème identifié

`src/components/Logo.tsx` contient encore l'ancien SVG placeholder (deux cœurs roses génériques avec des yeux), pas le vrai logo fourni. La cause : lors de la précédente implémentation, le SVG du fichier uploadé n'a pas été intégré — le fichier d'origine a été recréé à l'identique.

## Solution

Un seul fichier à modifier : **`src/components/Logo.tsx`**

Remplacer intégralement le contenu SVG par celui du fichier `Logo_Cash_for_Cause-2.svg` fourni par l'utilisateur :

```xml
<svg viewBox="0 0 192.44 161.16" xmlns="http://www.w3.org/2000/svg">
  <!-- 4 paths avec couleurs exactes : #d4387c, #1a8c6a, #205148, #71385d -->
</svg>
```

**Points techniques :**
- `viewBox="0 0 192.44 161.16"` (dimensions réelles du logo)
- Les couleurs sont hardcodées dans le SVG (`fill="#d4387c"` etc.) — **ne pas les modifier**
- Supprimer `fill="none"` et `fill="currentColor"` qui écrasaient les couleurs du logo
- Conserver les props `size` et `className` pour la flexibilité (mais `className` ne modifiera plus la couleur)
- Le `className` ne doit plus inclure `text-cta` dans Navbar/Auth car les couleurs sont intégrées au SVG

**Composants à mettre à jour :**
- `src/components/Logo.tsx` — nouveau SVG complet
- `src/components/Navbar.tsx` — retirer `className="text-cta"` du `<Logo>`
- `src/pages/Auth.tsx` — retirer `className="text-cta"` du `<Logo>`
- `src/pages/ThemeShowcase.tsx` — retirer `className="text-cta"` du `<Logo>`
