## Constats

Deux problèmes distincts dans l'Avatar Studio :

### A. Attributs sélectionnés non reflétés dans l'image

Après audit du pipeline (UI → `beneficiaries` → `inferAvatarTraits` → `buildAvatarPrompt` → Gemini), un attribut est **complètement ignoré par le prompt** malgré sa présence en BDD et dans l'UI :

- **`avatar_nose`** : présent dans `fields.tsx` (onglet « Visage »), dans la BDD, dans `types.ts`, mais **absent** de `BeneficiaryInput`, `AvatarTraits` et `buildAvatarPrompt`. La valeur est sauvegardée mais jamais envoyée à Gemini.

Tous les autres attributs (genre, âge, teint, forme du visage, yeux, type/couleur/longueur/volume/coiffure des cheveux, barbe/moustache/recul/calvitie, couvre-chef, marque frontale, corpulence, posture, expression, vêtements, aide à la mobilité, énergie parentale, niveaux fatigue/résilience/dignité) sont correctement transmis.

Cas Irina (curly / gray / long) : le prompt est bien généré avec ces valeurs, mais le modèle `gemini-3.1-flash-image-preview` a du mal à suivre des instructions de phénotype quand elles sont noyées dans un bloc d'« art direction » de ~25 lignes placé **avant** le sujet. Le modèle accorde plus de poids aux premiers tokens.

### B. Bordure "aquarelle / papier" persistante

Le bloc `ART_DIRECTION_INVARIANTS` interdit déjà bord déchiré / passe-partout / grain de papier, mais ces interdictions sont diluées dans un long paragraphe. Le négatif `NEGATIVE_PROMPT` est très long (~50 items) et perd en efficacité. Le modèle ramène régulièrement un cadre type aquarelle.

---

## Plan

### 1. Câbler `avatar_nose` de bout en bout

Fichier `supabase/functions/_shared/avatarTraits.ts` :
- Ajouter `avatar_nose?: string | null` dans `BeneficiaryInput`.
- Ajouter `avatar_nose?: string` dans `AvatarTraits`.
- Ajouter `avatar_nose: b.avatar_nose ?? undefined` dans le pass-through final.

Fichier `supabase/functions/_shared/avatarArtDirection.ts` :
- Ajouter un dictionnaire `NOSE_DESC` mappant chaque valeur (`straight`, `aquiline`, `rounded`, `wide`, `narrow`, `flat_bridge`, `upturned`) vers une description anglaise courte.
- Injecter `${NOSE_DESC[t.avatar_nose]} nose` dans la string `subject` quand la valeur est définie.

### 2. Restructurer le prompt pour que les attributs soient suivis

Dans `buildAvatarPrompt` (`avatarArtDirection.ts`) :
- **Placer la section SUBJECT/DETAILS AVANT** le bloc d'art direction, pas après. Les modèles image pondèrent fortement les premiers tokens.
- Préfixer la description du sujet par `PRIMARY SUBJECT — STRICTLY FOLLOW ALL ATTRIBUTES BELOW:` pour forcer l'adhérence.
- Réordonner pour mettre genre + âge + cheveux (type, longueur, couleur) en **premier** dans `subject`, puis teint / visage / yeux / features.
- Compresser le bloc `ART_DIRECTION_INVARIANTS` : conserver style/dignité/anonymat, retirer les répétitions et les "EXPLICITLY NOT" qui font doublon avec le negative prompt.

### 3. Durcir la règle "full-bleed" pour supprimer le bord aquarelle

- Extraire la consigne de cadrage dans une ligne **dédiée et isolée** placée juste après le SUBJECT, en majuscules et concise : `IMAGE FORMAT: square 1:1, full-bleed illustration, the illustrated background MUST touch the four edges of the canvas. ABSOLUTELY NO paper sheet, NO torn edge, NO deckled edge, NO white margin, NO mat, NO frame, NO watercolor paper texture.`
- Élaguer `NEGATIVE_PROMPT` à ~15 items concentrés sur les défauts les plus fréquents (photo, 3D, anime, bord papier, fond blanc, multiple visages). Les listes longues sont moins respectées.

### 4. Garantir une vraie variation entre générations

Aujourd'hui, deux appels avec attributs différents peuvent retomber sur la même image si Gemini met en cache la requête (mêmes premiers tokens d'art direction). Dans `supabase/functions/generate-avatar/index.ts` :
- Passer un nonce déterministe basé sur `seed + Date.now()` en fin de prompt (`[render-token: <nonce>]`) pour casser tout cache implicite.
- Conserver le `seed` métier pour la reproductibilité côté inference traits.

### 5. Tableau de validation manuelle (post-fix)

Une fois les changements appliqués, je vérifierai sur Irina :
- type cheveux `curly` + couleur `gray` + longueur `long` → image montre cheveux longs gris bouclés
- nez `aquiline` → reflété
- absence de bord aquarelle / passe-partout

Si le modèle `flash-image-preview` reste rétif après ces changements, étape optionnelle : basculer `MODEL_FINAL` vers `google/gemini-3-pro-image-preview` (meilleure adhérence aux instructions, plus cher). À discuter avec toi avant.

---

## Fichiers touchés

- `supabase/functions/_shared/avatarTraits.ts` (interface + passthrough nez)
- `supabase/functions/_shared/avatarArtDirection.ts` (mapping nez, réorganisation prompt, consigne cadrage, négatif élagué)
- `supabase/functions/generate-avatar/index.ts` (nonce anti-cache)

Aucune migration BDD nécessaire — `avatar_nose` existe déjà.
Aucun changement UI.
