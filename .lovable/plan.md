
## Refonte du panneau central Avatar Studio

Toutes les modifications sont limitées à `src/pages/AvatarStudio.tsx` (UI/présentation, pas de changement backend, pas d'impact prompts/matching/QA/pipeline IA).

### 1. Suppression de la grande image du haut

- Supprimer le bloc `aspect-square` (lignes ~1101-1158) qui affiche l'avatar sélectionné en grand, avec ses overlays (bouton "Nettoyer le fond", badge Info, loader busy).
- Conserver les bannières "Aperçu en attente de validation", "HD validé (référence)" et l'alerte `failed`.
- Le loader `busy` est rendu via la bannière `busyLabel` existante remontée au-dessus des versions.

### 2. Encadré "Source utilisée : version du …" (lignes 1287-1324)

Supprimé entièrement. L'info reste portée par le ring ambre + badge "Source" sur la vignette.

### 3. Indicateur "Édition contrôlée / Création complète" (lignes 1328-1349)

Remplacer le pavé multi-lignes par un badge compact d'une ligne :

- Édition : « ✏️ Ce visage vous plaît ? Modifiez des attributs — ils seront appliqués sans repartir de zéro. »
- Création : « 🎨 Première génération — création complète depuis les attributs. »
- Le texte technique long ("L'avatar source sert de référence visuelle, pose/cadrage/fond préservés…") passe dans un `Tooltip` déclenché par une petite icône `Info` à droite du badge.
- Suppression de la mention « Astuce : … "Base de retouche" » (l'action est réintroduite au §5).

### 4. Simplification du menu "Générer un aperçu" (lignes ~1206-1284)

Réécrire le split-button et son `DropdownMenu` pour ne contenir **que** des actions de génération IA, avec des libellés métier (aucune mention `Nano Banana`, `économique`, `qualité finale`).

**Bouton principal** (adapte son libellé au mode par défaut) :
- `preview` → « Prévisualiser les changements »
- `final` → « Générer l'avatar final »

**Dropdown** : deux items uniquement.

| Action | Libellé | Sous-libellé |
|---|---|---|
| `generate("preview")` | Prévisualiser les changements | Crée un aperçu sans remplacer l'avatar final |
| `generate("final")` | Générer l'avatar final | Crée une version HD à valider |

**Retrait** de l'item "Importer une image" de ce menu. La fonction n'est pas supprimée : l'action est déplacée dans un bouton discret séparé (`variant="ghost"`, `size="sm"`, icône `Upload`, libellé « Importer une image ») placé juste sous le split-button. Le `<input ref={importInputRef}>` existant est conservé.

Aucun changement à la fonction `generate()`, aux modes, ni à `handleImportFile`.

### 5. Suppression du bouton "Ajuster le cadrage" du panneau (lignes 1354-1369)

L'action est déplacée dans la modale "Voir en grand" (§7). `AvatarFramingDialog` reste monté au niveau page ; déclenché depuis la modale en fermant celle-ci d'abord.

### 6. Réintroduction de "Base de retouche" dans le menu … de chaque vignette

Dans le `DropdownMenu` des vignettes (lignes ~1504-1527), insérer un item entre "Voir en grand" et "Utiliser cette version" :

- Libellé : « Définir comme base de retouche »
- Handler : update `avatar_source_url = v.image_url` (fonction déjà existante ligne ~700, à réutiliser via une petite `setAsRetouchBase(v)` extraite).
- Désactivé si `isSource`, `isLocked` ou `busy`.
- Tooltip : « Prochaine retouche basée sur cette image, sans changer l'avatar affiché. »

### 7. Modale "Voir en grand" — nouvelle action Cadrage

Dans le footer (lignes 2061-2119), ajouter avant "Comparer" :

- Bouton `variant="outline"` « Ajuster le cadrage » (icône `Crop`).
- Visible uniquement si `isActive` (le cadrage est stocké sur `beneficiaries`, valable pour l'avatar affiché).
- Handler : `setDetailVersionId(null); setFramingDialogOpen(true);`

### 8. Espace récupéré → carousel versions plus grand

- Vignettes `w-20` → `w-28` (ligne 1451).
- Bannière `busyLabel` positionnée juste au-dessus du carousel.
- Titre "Versions (n)" et logique de sélection multiple inchangés.

### Fichiers modifiés

- `src/pages/AvatarStudio.tsx` — points 1 à 8 ci-dessus.

### Hors périmètre (inchangé)

- `AvatarFramingDialog`, `clean-avatar-background`, prompts, QA, matching, panier, checkout, schéma DB, RLS.
- Aucun appel IA nouveau ; crédits consommés uniquement aux actions explicites existantes (Générer, Nettoyer le fond).
