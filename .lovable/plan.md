# Plan final — avatars plein cadre + bouton « Nettoyer le fond »

## Partie 1 — Cadrage plein cadre (option A)

### `supabase/functions/_shared/avatarArtDirection.ts`
- Renforcer le bloc framing : sujet cadré **du sommet du crâne jusqu'au bord inférieur de l'image**, buste/torse touchant le bord bas (bleed).
- Fond blanc pur strict (déjà en place), aucun vignettage, aucun fondu, aucune ombre portée diffuse.
- Enrichir `NEGATIVE_PROMPT` : `vignette, faded edges, watercolor edges, soft fade at bottom, cropped torso, head-only portrait, floating bust, drop shadow under chin, ghosted edges, soft halo around hair`.

### `src/components/BeneficiaryAvatar.tsx`
- **Retirer** `mix-blend-mode: multiply` sur l'`<img>` (source de l'effet aquarelle).
- Passer `object-position: center top` pour garantir que la tête reste visible et que le bas du corps remplit le cercle jusqu'en bas.
- Le fond importé reste en `background-image: cover` → visible uniquement autour de la silhouette (cheveux, épaules, coins), jamais à travers le corps.

## Partie 2 — Edge function `clean-avatar-background` (idempotente)

Nouveau fichier `supabase/functions/clean-avatar-background/index.ts` :

- Auth : exige un JWT valide + rôle `admin` (via `has_role`).
- Input : `{ beneficiaryId: string }`.
- Étapes :
  1. SELECT l'`avatar_url` du bénéficiaire.
  2. Télécharge l'image existante.
  3. Appelle l'AI Gateway `https://ai.gateway.lovable.dev/v1/images/generations` avec **`google/gemini-3.1-flash-image-preview`** en mode édition (`messages` + image input + `modalities: ["image","text"]`), prompt :
     > *« Replace the entire background behind the person with pure solid white (#FFFFFF). Do NOT modify the person in any way — keep face, hair, skin, clothing, pose, expression, framing strictly identical. Crisp edges around hair and shoulders. No gradient, no shadow, no halo, no texture. Output a clean cutout on pure white. »*
  4. Décode le PNG retourné.
  5. Upload dans le bucket `avatars` sous `cleaned/{beneficiaryId}.png` (chemin fixe → ré-exécuter écrase, **idempotent**, pas de traçage).
  6. UPDATE `beneficiaries.avatar_url` avec la nouvelle URL publique + insert dans `avatar_versions` (table existante) pour rollback éventuel.
  7. Renvoie `{ success: true, newUrl }`.
- Gère 402/429 du gateway → renvoie l'erreur claire au client.

Pas de migration nécessaire. Pas de nouveau secret (`LOVABLE_API_KEY` déjà configuré). `verify_jwt` reste par défaut (validation faite en code).

## Partie 3 — UI dans Avatar Studio

### `src/features/avatar-studio/BeneficiaryListPanel.tsx`
- À côté de chaque bénéficiaire ayant un `avatar_url`, ajouter un bouton icône **« Nettoyer le fond »** (icône `Eraser` ou `Wand2`).
- Au clic : confirmation légère → `supabase.functions.invoke("clean-avatar-background", { body: { beneficiaryId } })`.
- Pendant l'appel : spinner sur la ligne (~5-10 s).
- Au retour : refetch le bénéficiaire → l'avatar se redessine avec son fond importé visible autour de la silhouette.
- Toast succès ou erreur (avec message explicite si 402/429).

### `src/features/avatar-studio/BatchActionsBar.tsx`
- Bouton **« Nettoyer le fond des avatars sélectionnés »**.
- Boucle séquentielle par lots de 3 (anti rate-limit), barre de progression `n/total`.
- Idempotent : relancer sur un avatar déjà nettoyé refait simplement le détourage.

## Fichiers touchés

- `supabase/functions/_shared/avatarArtDirection.ts` *(modif)*
- `src/components/BeneficiaryAvatar.tsx` *(modif)*
- `supabase/functions/clean-avatar-background/index.ts` *(nouveau)*
- `src/features/avatar-studio/BeneficiaryListPanel.tsx` *(modif — bouton ligne)*
- `src/features/avatar-studio/BatchActionsBar.tsx` *(modif — action batch)*

## Hors scope (volontairement)

- Aucune migration DB, aucune nouvelle colonne, aucun badge « nettoyé » — nettoyage 100 % idempotent et silencieux.
- Aucun changement de logique de matching, basket, ou checkout.
- Les fonds importés et le mécanisme de sélection déterministe par seed restent inchangés.
