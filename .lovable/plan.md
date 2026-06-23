
# Étape A — Cohérence visuelle édition (cas Léa)

Périmètre strict, validé. Aucune refonte UI, aucune migration, aucun toucher cadrage/fonds/versions.

## Fichiers modifiés (4)

### 1. `supabase/functions/_shared/avatarArtDirection.ts`
Refonte de `buildEditPrompt(diff, traits)` :

```text
EDIT THE PROVIDED REFERENCE IMAGE — surgical retouch, NOT regeneration.

REFERENCE SUBJECT (must remain visually identical):
<rappel compact âge, genre, phénotype, type de cheveux, couverture>

PRESERVE STRICTLY:
- même visage, mêmes proportions, même regard
- même pose, angle du corps, inclinaison de tête, épaules
- même cadrage, crop, marges, taille du sujet dans le carré
- même éclairage, température, ombres
- même style artistique (trait, ombrage, palette)

CHANGE ONLY:
- <liste humaine des diffs>

DO NOT:
- regenerate from scratch
- modify framing, margins, subject scale, background, identity
- redraw any feature not explicitly listed

<FRAMING_BLOCK>           ← réinjecté
<ART_DIRECTION_INVARIANTS> ← réinjecté
<buildBackgroundBlock>     ← réinjecté (fond blanc strict)
AVOID: <NEGATIVE_PROMPT>   ← réinjecté

Return ONE square 1:1 image with surgical changes only.
```

Le commentaire actuel « FRAMING_BLOCK and buildBackgroundBlock are intentionally NOT reused » est supprimé (cause racine du cas Léa).

### 2. `supabase/functions/_shared/avatarTraits.ts`
Ajout `classifyDiff` :

```ts
STRUCTURAL_TRAIT_KEYS = [gender, age_range, skin_tone, face_shape, eye_shape,
  nose, hair_type, body_type, head_covering]
MEDIUM_TRAIT_KEYS = [hair_length, hair_style, hair_volume, hair_recession,
  bald_level, beard, moustache, mobility_aid, cultural_style,
  cultural_style_override]
// LIGHT = tout le reste (couleur cheveux/yeux, expression, posture,
//         vêtements, fatigue, accessoires, parent energy, sliders…)

type DiffLevel = "none" | "light" | "medium" | "structural"
classifyDiff(diff): { level, structuralKeys, mediumKeys, lightKeys }
```

### 3. `supabase/functions/generate-avatar/index.ts`
- Remplace la règle actuelle `editDiff.length > 5 || hasStructural → full` (bascule silencieuse) par :
  ```text
  cls = classifyDiff(editDiff)
  if cls.level === "structural" && !payload.confirmStructural
    → HTTP 200 { status: "requires_confirmation",
                  level: "structural",
                  structuralKeys: [...],
                  message: "Cette modification touche l'identité visuelle.
                            Utilisez la régénération complète pour la valider." }
    NE GÉNÈRE RIEN, ne consomme pas de crédits image.
  else (light | medium | structural+confirmed):
    → edit image→image avec prompt enrichi, seed stable
  ```
- Seed stable : `[render-token: ${seed}]` (suppression de `-${Date.now()}` partout dans les prompts). `Date.now()` reste uniquement pour le nommage de fichier `versions/{id}/edit-{ts}.png`. Retry QA continue de shifter (`${seed}-r2`) — comportement existant inchangé.

### 4. `src/pages/AvatarStudio.tsx`
Micro-ajout strictement scopé : dans le handler `generate()`, si la réponse contient `status === "requires_confirmation"`, afficher un `toast({ variant: "destructive", title: "Modification structurelle détectée", description: <message backend> })` et `return`. Aucun bouton, slider, section, panneau Versions, dialog cadrage modifié. `avatar_dignity_level` reste tel quel.

## Validation (non-code)

### Test E2E cadrage (lecture seule)
Playwright sous `/tmp/browser/framing-e2e/` :
1. Lire via `supabase--read_query` les valeurs actuelles d'un bénéficiaire de test → snapshot mémoire.
2. Avatar Studio → « Ajuster le cadrage » → scale 1.4, offsetX 10, offsetY -5 → sauver.
3. Vérifier en DB que les colonnes ont bien été écrites.
4. Naviguer sur la fiche publique correspondante, extraire `style.transform` de l'`<img>`, comparer à `translate(10%, -5%) scale(1.4)`.
5. Restaurer les valeurs d'origine via UPDATE SQL.
6. Captures avant/après + rapport texte.

Aucun correctif cadrage n'est intégré dans cette étape, même si un écart est détecté — rapport seulement.

### Test visuel Léa
1. Ouvrir Léa dans Avatar Studio (avatar actuel apprécié = base).
2. Modifier `avatar_hair_color` → `light_brown` (ou `dark_brown`) + `avatar_expression` → `reserved`.
3. Cliquer « Aperçu rapide ».
4. Capture avant/après côte à côte.
5. Critères : visage / pose / cadrage / style identiques, seuls cheveux + expression changent.
6. Si dérive → ne pas passer à B/C/D, ajuster le poids des consignes PRESERVE et re-tester.

## Hors périmètre (confirmé non touché)

`clean-avatar-background`, `avatar_backgrounds`, attribution des fonds, rendu CSS du fond, `BeneficiaryAvatar.tsx`, `avatarFraming.ts`, `getFramingStyle`, `avatar_scale/offset_x/offset_y`, RPC de matching, panneau Versions, dialog « Ajuster le cadrage », schéma SQL, sliders 0–5, `avatar_dignity_level`, boutons / sections de l'UI. Pas de badge « Validée » par version (Option 2 retenue).

## Livrables

1. 3 fichiers backend modifiés + 1 micro-ajout `AvatarStudio.tsx` (~20 lignes).
2. Déploiement edge functions `generate-avatar`.
3. Rapport test cadrage (captures + diff DB/transform).
4. Rapport test Léa (captures avant/après).
5. Go/no-go explicite pour B/C/D.
