## Problème

Dans la carte « Versions » de `AvatarStudio.tsx`, le bouton « Base de retouche » n'apparaît au survol que si `selected.avatar_url !== v.image_url` (condition `!isActive`).

Pour Léa, la version aux cheveux blancs **est** l'avatar actif (`avatar_url`), elle reçoit donc le badge « Actif » et le bouton « Base de retouche » est masqué. Mais `avatar_source_url` pointe encore vers une ancienne image supprimée : c'est de là que repart la génération en mode édition, d'où l'incohérence.

Conséquence : impossible pour l'utilisateur de « réancrer » la base de retouche sur la version Active actuelle.

## Plan

Frontend uniquement, dans `src/pages/AvatarStudio.tsx`, section « Versions carousel » (lignes 1138–1255).

1. **Calculer un second flag `isSource`** dans la boucle des versions :
   - `const isSource = (selected.avatar_source_url ?? selected.avatar_url) === v.image_url;`

2. **Toujours afficher le bouton « Base de retouche » au survol**, sauf quand la vignette est déjà la source de retouche.
   - Remplacer la condition `{!isActive && !selectionMode && (...)}` par `{!isSource && !selectionMode && (...)}`.
   - Le bouton apparaît donc aussi sur la version « Actif » si la source de retouche est différente — exactement le cas de Léa.

3. **Ajouter un badge visuel « Source »** sur la vignette utilisée comme base de retouche (différent du badge « Actif ») :
   - Petit badge en bas-gauche, par ex. `bg-secondary text-secondary-foreground`, texte « Source », icône `RotateCcw` 9px.
   - Si une vignette est à la fois Active et Source, afficher les deux badges (coins distincts).

4. **Avertir quand la source pointe vers une image absente des versions** :
   - Après chargement de `versions`, si `selected.avatar_source_url` est défini et n'apparaît dans aucune `v.image_url`, afficher un petit message d'alerte sous le titre Versions : « La base de retouche actuelle n'existe plus dans vos versions. Cliquez sur « Base de retouche » sur une version pour la réancrer. »

5. **Mettre à jour le tooltip** du badge « Actif » pour préciser qu'il ne s'agit pas forcément de la base de retouche (« Avatar affiché publiquement »).

## Détails techniques

- Aucun changement backend, aucune migration.
- Pas de modification de `restoreVersion()` — la logique est déjà correcte (elle écrit `avatar_source_url`, vide `avatar_preview_url`, reconstruit le snapshot).
- Pas de modification des edge functions.

## Validation

1. Ouvrir le studio sur Léa.
2. Vérifier qu'un badge « Source » apparaît sur la vignette correspondant à l'image actuellement utilisée comme base — ou un avertissement si elle est absente.
3. Survoler la version cheveux blancs (Actif) : le bouton « Base de retouche » est visible.
4. Cliquer dessus → toast « Base de retouche définie », puis le badge « Source » bascule sur la vignette cheveux blancs.
5. Lancer « Générer un aperçu » en Aperçu rapide : l'image renvoyée part bien des cheveux blancs avec hair=châtain foncé et expression=Réservé.
