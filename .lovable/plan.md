# Correctifs UI panneau central Avatar Studio

Fichier modifié : `src/pages/AvatarStudio.tsx` uniquement (pas de logique métier).

## 1. Barre d'actions génération — deux boutons distincts, pas de doublon

Aujourd'hui, un seul bouton principal reprend le libellé du mode par défaut ("Prévisualiser les changements" OU "Générer l'avatar final"), suivi d'un chevron qui ouvre un menu contenant les deux mêmes entrées. Résultat : le libellé se répète (bouton + menu) et le second bouton est invisible tant qu'on n'ouvre pas le menu.

Correction :
- Remplacer le bloc `bouton principal + chevron` par **deux boutons côte à côte** :
  - `Prévisualiser` (icône `RefreshCw`, variant `default`, raccourci P)
  - `Générer HD` (icône `Sparkles`, variant `secondary`, raccourci G)
- Libellés courts pour que les deux boutons rentrent dans la colonne étroite du panneau (largeur observée ≈ 380 px). Tooltip sur chaque bouton avec le libellé long ("Prévisualiser les changements" / "Générer l'avatar final") + description.
- Suppression du `DropdownMenu` de choix de mode et de `defaultGenMode` / `localStorage "avatar-studio-default-mode"` (plus de mode par défaut à mémoriser puisque les deux actions sont visibles).
- Conserver `isLocked` / `dignityBlocked` / `busy` sur chaque bouton.

## 2. Libellé du bouton d'import

Remplacer :
```
Importer une image (PNG/JPG/WEBP — sans contrôle IA)
```
par :
```
Importer une image
```
Les formats acceptés restent gérés par l'`<input accept>`. Ajouter un `title` discret sur le bouton pour l'info "PNG/JPG/WEBP — pas de contrôle IA" si besoin d'une trace.

## 3. Retirer la sélection multiple + réintroduire la poubelle par vignette

La case à cocher de sélection est peinte en `opacity-0 group-hover:opacity-100` sur fond clair de l'image → invisible sur beaucoup de portraits, et son mode "sélection" masque le clic normal. Simplification demandée : plus de sélection multi.

Modifications sur chaque vignette de la grille `Versions` :
- Supprimer le bouton case à cocher (lignes ≈ 1365-1376) et toute la logique `selectionMode` / `isChecked` / `toggleVersionSelect` dans le `onClick` de la vignette.
- Ajouter un **bouton poubelle visible en permanence** en bas-droite de chaque vignette (au-dessus du badge QA quand présent) :
  - `w-6 h-6`, fond `bg-background/85`, icône `Trash2 h-3.5`, `text-destructive`.
  - `opacity-80 group-hover:opacity-100` (visible sans hover, plus contrasté au hover).
  - `title="Supprimer cette version"`.
  - `onClick={(e) => { e.stopPropagation(); attemptDeleteVersion(v); }}` — réutilise la fonction existante qui gère la confirmation et la protection "actif".
  - Sur l'avatar actif : bouton désactivé (`disabled`, `opacity-40`, title "Impossible de supprimer la version active").
- Le clic sur l'image ouvre toujours la modale détail (`setDetailVersionId(v.id)`).
- Entrée "Supprimer…" dans le menu `…` conservée (redondance utile côté modale et clavier).

## 4. Nettoyage des états devenus inutiles

- Supprimer `selectedVersionIds`, `toggleVersionSelect`, `bulkDeleteOpen`, `bulkDeletableIds`, `performDeleteVersions` (usage restant : la vignette appelle déjà `attemptDeleteVersion`, qui supprime unitairement).
- Supprimer la barre de tête "N sél. / Comparer / Suppr." (lignes ≈ 1223-1255). Ne garder que le titre `Versions (n)`.
- Supprimer l'`AlertDialog` de suppression groupée (lignes ≈ 1951+).
- Comparaison à deux versions : conservée uniquement depuis la modale détail (`otherSelected` remplacé par un état local simple `pinnedForCompareId` déjà en place via `setCompareIds` dans la modale — vérifier ligne 1912/1925 et l'adapter pour ne plus dépendre de `selectedVersionIds`; si besoin, retirer le bouton "Comparer avec la sélection" et ne garder que "Comparer avec l'actif").

## 5. Vérifications

- Build TS propre (les symboles supprimés ne doivent plus être référencés).
- Screenshot Playwright de `/avatar-studio` sur Léa pour confirmer : (a) les deux boutons Prévisualiser + Générer HD visibles sans troncature, (b) libellé import raccourci, (c) icône poubelle visible sur chaque vignette non-active.
