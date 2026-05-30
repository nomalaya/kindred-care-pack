## Diagnostic

Vérification du PNG livré par l'edge function `clean-avatar-background` :
- Mode : `RGB` (pas de canal alpha)
- Pixels transparents : `0 / 1 048 576` → 100 % opaque

Gemini `gemini-3.1-flash-image-preview` **ne sait pas produire de PNG transparent** — il a remplacé le fond par du blanc plein malgré le prompt. Donc dans `BeneficiaryAvatar`, l'`<img>` couvre intégralement la div qui porte le `background-image` du bucket → aucun fond importé visible sur `/donate/:id`.

## Solution : chroma-key serveur (post-traitement)

Garder Gemini pour produire un PNG **fond blanc propre** (ça il le fait très bien), puis transformer ce blanc en transparence dans l'edge function avant upload, en utilisant `imagescript` (lib Deno-native, pure TS).

### `supabase/functions/clean-avatar-background/index.ts`
- **Prompt** : revenir à « replace background with pure solid white #FFFFFF, crisp edges » (efficace, déjà éprouvé).
- **Nouveau post-traitement** après réception du PNG Gemini :
  - `import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts"`
  - Décoder le PNG, parcourir chaque pixel :
    - Calcul `whiteness = min(R,G,B)` et `chroma = max(R,G,B) - min(R,G,B)`
    - Si `whiteness >= 248 && chroma <= 6` → `alpha = 0` (fond plein)
    - Si `whiteness >= 230 && chroma <= 12` → alpha proportionnel (rampe linéaire de 0 à 255) pour anti-aliasing doux sur les contours cheveux/épaules
    - Sinon → `alpha = 255` (sujet)
  - Ré-encoder en PNG avec canal alpha → upload sur `avatars/cleaned/{id}.png`.
- Conserver tout le reste : auth, idempotence, archivage `avatar_versions`, gestion 402/429.

### Vérification automatique
Après upload, log côté serveur le pourcentage de pixels transparents (`transparent_ratio`). Si < 5 %, retourner une erreur explicite « Détourage raté — réessayez » pour éviter d'écraser silencieusement avec un mauvais résultat.

## Fichiers touchés
- `supabase/functions/clean-avatar-background/index.ts` — prompt + post-traitement chroma-key + check qualité

## Hors scope
- Aucune modification frontend (le pipeline `<img>` + `background-image` du fond importé fonctionne déjà dès que le PNG a un canal alpha)
- Pas de migration DB, pas de modif matching/panier/checkout

## Test
1. Avatar Studio → Irina → **Nettoyer le fond** (5-10 s)
2. **Voir la fiche donateur** → un des 200 fonds doit apparaître derrière la silhouette
3. Cas limite : zoom sur les bords des cheveux → pas de halo blanc visible