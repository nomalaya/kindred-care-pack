Dans `src/pages/AvatarStudio.tsx` (vue Visuel, ligne 828-886) :

- Remplacer le grand carré `aspect-square max-w-md mx-auto` par une vignette compacte à taille fixe (~200 px de côté), alignée à gauche, avec les contrôles (overlays nettoyer fond / info / loader) inchangés.
- Mettre la bannière "failed" (ligne 890) à la suite à la même largeur.
- Réduire le padding du panneau de `p-4 space-y-3` à `p-3 space-y-2`.

Résultat : plus de bandes blanches latérales, l'image ne domine plus la zone, le carrousel des versions et les attributs remontent dans le viewport. Aucun changement backend ni sur la fiche donateur publique.

Les fonctionnalités et le outils de l'avatar studio doivent être beaucoup plus rapidement accessibles sans scroller tout en bas 