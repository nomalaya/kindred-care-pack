## Objectif

Les avatars générés doivent avoir un **style dessiné/illustré** (type cartoon doux, à la Pixar / Disney moderne, comme les portraits Sophie, Abdoulaye, Chloé dans la capture jointe), **pas** un rendu photo ni un rendu peinture floutée.

Aujourd'hui `ART_DIRECTION_INVARIANTS` impose "stylized painterly illustration" + flou gaussien d'anonymisation + lumière naturelle de fenêtre → résultat trop "photo peinte", pas dessiné.

## Changements

Un seul fichier modifié : `supabase/functions/_shared/avatarArtDirection.ts`.

### 1. Réécrire `ART_DIRECTION_INVARIANTS`

Nouveau brief verrouillé :
- **STYLE** : "modern 2D character illustration, clean digital cartoon portrait, Pixar-inspired stylization, smooth flat-shaded rendering with soft cel-shading". Explicitement : **NOT a photograph, NOT photorealistic, NOT painterly, NOT watercolor, NOT 3D render**.
- **LINEWORK** : contours doux et propres, traits dessinés visibles mais délicats, formes simplifiées et stylisées (yeux légèrement agrandis, traits adoucis).
- **SHADING** : aplats de couleur avec ombres douces en 2 tons max, lumière douce sans réalisme photographique, peau lisse et stylisée (pas de pores, pas de grain).
- **ANONYMAT** : conservé via la stylisation cartoon elle-même (les traits sont déjà non-identifiants). Retrait du flou gaussien / "painterly smudging" qui donnait l'effet photo flouté.
- **CADRAGE** : portrait poitrine, sujet centré, carré 1:1, fond blanc cassé doux ou dégradé sable très léger (cohérent avec la capture de référence).
- **PALETTE** : douces, chaleureuses, légèrement désaturées, cohérentes avec la charte.
- **DIGNITÉ** : préservée, pas de caricature exagérée, pas de chibi, pas d'anime stylisé, pas de comics américain.

### 2. Mettre à jour `NEGATIVE_PROMPT`

- Retirer : `no sharp facial details` (le dessin a des traits nets), `no photograph` reste, ajouter explicitement `no photorealism`, `no realistic skin texture`, `no 3D render`, `no anime`, `no chibi`, `no manga`, `no comic book style`, `no painterly brushstrokes`, `no watercolor`, `no oil painting`.
- Garder : pas de texte, logo, signature, multiples visages, stéréotypes, etc.

### 3. Conserver intacte toute la logique fonctionnelle

- `buildAvatarPrompt`, traits inférés, extensions Studio (`tired_level`, `beard`, `head_covering`, etc.), modèles (`MODEL_PREVIEW` / `MODEL_FINAL` / `MODEL_QA`), workflow, RLS, table `avatar_versions` → **aucun changement**.
- Aucune modification de base de données, ni d'edge function autre que la lecture de ces invariants.

## Validation après implémentation

1. Régénérer un avatar de test depuis `/admin/avatar-studio` (par ex. Fatima).
2. Vérifier visuellement que le rendu est clairement illustré/cartoon doux, cohérent avec la capture jointe (Sophie / Abdoulaye / Chloé).
3. Si le rendu dérive vers du semi-réaliste, durcir encore le brief (ex. ajouter "flat 2D illustration only").

## Hors-scope

- Pas de changement de modèle d'image (on reste sur Nano Banana 2 / Pro).
- Pas de re-génération en masse automatique : les anciens avatars restent jusqu'à régénération manuelle via le Studio.
