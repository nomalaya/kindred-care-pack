
## Problème observé

Sur Léa (Île-de-France), aucun des 3 signaux "Actif" n'apparaît dans la grille des versions : pas de badge « Actif », pas d'anneau primaire, corbeille visible partout (y compris sur l'image publique).

## Cause racine

La colonne `beneficiaries.avatar_url` porte parfois un cache-buster (`?t=1782900631850`) ajouté après nettoyage de fond ou upload, alors que `avatar_versions.image_url` est stocké sans query string. La comparaison stricte `activeUrl === v.image_url`, utilisée en 3 endroits de `src/pages/AvatarStudio.tsx`, échoue donc pour toute bénéficiaire dont l'avatar a été régénéré/nettoyé récemment.

Conséquences directes :
- La vignette active n'est pas surlignée.
- La protection anti-suppression de l'active saute (la corbeille s'affiche dessus).
- Le bouton « Utiliser cette version » reste actif sur la version déjà en place.
- La comparaison « Comparer à l'actif » dans la modale ne trouve plus l'actif.

## Correctif proposé (frontend uniquement)

### 1. Helper de normalisation d'URL

Dans `src/pages/AvatarStudio.tsx`, ajouter un utilitaire pur en haut du fichier :

```ts
// Compare deux URLs d'image en ignorant le cache-buster (?t=…, ?v=…) et les espaces.
const sameImage = (a?: string | null, b?: string | null) => {
  if (!a || !b) return false;
  const strip = (u: string) => u.split("?")[0].trim();
  return strip(a) === strip(b);
};
```

Remplacer les 3 comparaisons `activeUrl === v.image_url` (grille, modale de détail, recherche `versions.find`) par `sameImage(activeUrl, v.image_url)`. Faire de même dans `attemptDeleteVersion` (ligne 722) et dans `orderedVersions` (ligne 777).

### 2. Renforcer les signaux visuels de l'actif

Une fois la détection fiable, rendre le repérage franc et non ambigu :

- **Anneau** : passer de `ring-2 ring-primary` à `ring-2 ring-primary ring-offset-1` pour un contraste net contre les vignettes voisines.
- **Badge « Actif »** : ajouter une petite icône `CheckCircle2` (lucide) devant le libellé et augmenter le padding (`px-1.5 py-0.5 text-[10px]`) pour qu'il soit lisible à la taille des vignettes de la grille 3 colonnes.
- **Coin actif** : ajouter un léger halo (`shadow-[0_0_0_2px_hsl(var(--primary))]`) au survol pour distinguer davantage de « Hist. ».
- **Confirmation textuelle** : sous le titre "Versions (N)", ajouter une ligne discrète `Publiée : la vignette entourée de bleu` (ou couleur primaire) pour lever le doute au premier usage.

### 3. Garde-fous

- Vérifier que `attemptDeleteVersion` bloque bien la suppression de l'image active via `sameImage`.
- Vérifier que `restoreVersion` ne s'active plus sur la version déjà publiée (via `sameImage`).
- Ajouter un `console.warn` de dev si `selected.avatar_url` est défini mais ne correspond à aucune version après normalisation (aide au diagnostic futur).

## Validation

Après application, sur Léa Île-de-France, la vignette portant `…de8c19bc….png` doit :
1. Afficher le badge « Actif » plein primaire avec icône.
2. Être entourée de l'anneau primaire visible.
3. Ne plus afficher la corbeille (protection restaurée).
4. Afficher « Version déjà utilisée » (grisé) dans le menu et la modale.

Test à répéter sur 2 autres bénéficiaires ayant un cache-buster dans leur `avatar_url` pour confirmer.

## Portée

- Fichier modifié : `src/pages/AvatarStudio.tsx` uniquement.
- Aucun changement de schéma, aucune migration, aucune modification de logique backend/matching.
- Aucun crédit IA consommé.
