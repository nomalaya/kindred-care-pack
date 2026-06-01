## Objectif

Remplacer le recadrage actuel (crop haut 72 % + bande blanche en bas) par un **zoom recentré sur le visage** qui remplit tout le carré 1:1 — sans aucune marge blanche. Défauts calés sur la V2 validée : `zoom = 1.35`, `faceCenterY = 0.38`. Sliders dans le studio pour ajuster avatar par avatar.

## Modifications

### 1. `supabase/functions/_shared/avatarCrop.ts` (réécriture de la logique)

- Nouvelles constantes exportées :
  - `CROP_ZOOM_DEFAULT = 1.35`
  - `CROP_FACE_Y_DEFAULT = 0.38`
- Nouvelle signature :
  ```ts
  cropAvatarBytes(bytes, { zoom = 1.35, faceY = 0.38 } = {})
  ```
- Algorithme :
  1. Décode le PNG (imagescript).
  2. Calcule `side = round(w / zoom)`, fenêtre carrée centrée horizontalement (`cx = w/2`), verticalement autour de `faceY * h`, **clampée aux bords** pour rester dans l'image.
  3. `crop(x1, y1, side, side)` puis `resize(w, w)` en bicubique pour remplir le canvas 1:1.
  4. Re-encode PNG.
- Clamp sécurité : `zoom ∈ [1.0, 2.5]`, `faceY ∈ [0.20, 0.60]`.
- Plus de pad blanc — l'image remplit toujours le carré.

### 2. `supabase/functions/generate-avatar/index.ts` & `clean-avatar-background/index.ts`

- Mise à jour des appels `cropAvatarBytes(raw)` → utilisent les défauts (`1.35` / `0.38`). Aucun autre changement.

### 3. `supabase/functions/recrop-avatar-version/index.ts`

- Accepte `{ beneficiary_id, version_id, zoom?, faceY? }` (au lieu de `ratio`).
- Transmet `{ zoom, faceY }` à `cropAvatarBytes`.
- Tag dans le prompt archivé : `[recropped zoom=X faceY=Y]`.
- Rétro-compatibilité : si `ratio` est encore reçu, on l'ignore proprement.

### 4. UI `src/pages/AvatarStudio.tsx`

Sur chaque vignette du carrousel de versions (colonne centrale), remplacer le bouton `Crop` simple par un **Popover de recadrage** :

- Icône `Crop` → ouvre un popover compact (~260 px).
- **Slider Zoom** : `1.0 → 2.5`, pas `0.05`, défaut `1.35`. Label live « Zoom ×1.35 ».
- **Slider Hauteur visage** : `0.20 → 0.55`, pas `0.02`, défaut `0.38`. Label « Visage : haut / centre ».
- **Aperçu live** dans le popover : la miniature de la version affichée avec `transform: scale(zoom) translateY(((0.5 - faceY) * 100)%)` à l'intérieur d'un wrapper `overflow-hidden aspect-square` → preview WYSIWYG sans appel serveur.
- Bouton **« Appliquer »** → toast → appelle `recrop-avatar-version` avec `{ zoom, faceY }` → `refresh()`. Désactivé si `locked`.
- Persistance des derniers réglages en `localStorage` (`avatarStudio.recrop.zoom`, `.faceY`) comme valeurs initiales du prochain popover.

### 5. Aucun changement DB / RLS / matching / panier

Comportement public inchangé : seule l'image dans le bucket `avatars` change.

## Détails techniques

- `imagescript` supporte `Image.resize(w, h)` (Lanczos par défaut) — utilisé pour le rescale après crop.
- Le clamp horizontal/vertical évite tout débordement quand `faceY` est extrême ou `zoom` faible.
- À `zoom = 1.0` et `faceY = 0.5` la fonction est l'identité (pratique pour annuler un recadrage).
- Le slider d'aperçu live n'a aucun coût AI — seul le clic « Appliquer » déclenche l'edge function et archive une nouvelle version.

## Hors scope

- Pas de drag du visage (les 2 sliders suffisent).
- Pas de re-génération AI.
- Pas de re-traitement en masse — chaque avatar se recadre à la demande via son popover.
