## Diagnostic

Non, les fonds importés **ne s'affichent pas** sur les avatars nettoyés, et c'est un bug logique :

1. L'edge function `clean-avatar-background` demande à Gemini de remplir l'arrière-plan en **blanc opaque #FFFFFF**.
2. Le composant `BeneficiaryAvatar` place le portrait nettoyé en `<img absolute inset-0 object-cover>` par-dessus la div qui porte le fond importé en `background-image`.
3. Comme le PNG est **opaque** (blanc plein), il masque intégralement le fond → on ne voit jamais aucun des 200 fonds du bucket `avatar-backgrounds`.

Pour qu'un fond importé apparaisse derrière la silhouette, le PNG du portrait doit avoir un **fond transparent** (alpha = 0 partout sauf sur la personne).

## Solution (frontend + edge function, aucune modif business logic)

### 1. `supabase/functions/clean-avatar-background/index.ts`
- Renommer `CLEAN_PROMPT` → demander un détourage **transparent** PNG (alpha channel), pas blanc. Prompt strict : "transparent background, alpha channel, edge-to-edge transparency, keep subject pixel-perfect, crisp anti-aliased edges around hair and shoulders, no white halo, no fringing, no shadow".
- Conserver upload PNG (PNG supporte l'alpha nativement, contentType inchangé).
- Conserver le chemin idempotent `cleaned/{beneficiaryId}.png`.

### 2. `src/components/BeneficiaryAvatar.tsx`
- Aucun changement de logique : la div porte déjà `background-image` du fond importé, l'img par-dessus laissera transparaître le fond là où l'alpha est 0.
- Garder `object-position: center top` et `object-cover` pour cadrer le buste en bas du cercle.

### 3. (Optionnel mais utile) Bouton de re-nettoyage
Une fois la nouvelle prompt déployée, les avatars déjà nettoyés en blanc resteront opaques. Re-cliquer sur **« Nettoyer le fond »** dans Avatar Studio régénère un PNG transparent par-dessus (idempotent, écrase `cleaned/{id}.png`). Aucun script de migration nécessaire — je laisse l'utilisateur re-nettoyer les portraits concernés au cas par cas.

## Fichiers touchés
- `supabase/functions/clean-avatar-background/index.ts` — prompt + commentaire d'en-tête

## Hors scope
- Pas de changement à `BeneficiaryAvatar.tsx`, ni au hook `useAvatarBackground`, ni aux pages donateur
- Pas de migration DB, pas de modif matching/panier/checkout
- Pas de batch automatique de re-nettoyage (déclenchement manuel par l'admin)

## Vérification
1. Sur Irina (75 ans, Grand Est), cliquer à nouveau **« Nettoyer le fond »** dans Avatar Studio.
2. Ouvrir **« Voir la fiche donateur »** → un des 200 fonds doit apparaître derrière la silhouette (sélection déterministe par `beneficiary.id`).