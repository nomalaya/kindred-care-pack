
## Contexte

L'image de référence fournie est un **cartoon illustré semi-réaliste** (style storybook / éditorial type "The New Yorker meets Pixar 2D") : traits dessinés à la main, ombrage doux au crayon/aquarelle légère, palette chaude désaturée, **décor flou en arrière-plan** (cuisine, intérieur, etc.), proportions humaines réalistes mais clairement non-photoréalistes. Ce n'est PAS le "flat vector / Storyset" actuellement verrouillé dans le code, ni une peinture, ni du 3D.

Objectifs :
1. Reverrouiller le style sur cette référence (illustré cartoon doux, fond contextuel flou autorisé, anonymat préservé).
2. Basculer la génération sur **Nano Banana 2** (`google/gemini-3.1-flash-image-preview`) en preview ET en HD.
3. Garder l'Avatar Studio actuel (celui d'avant la grosse refonte qu'on vient de revert) mais lui apporter quelques améliorations légères de productivité.

## 1. Nouveau verrou de style

Fichier : `supabase/functions/_shared/avatarArtDirection.ts`

- Remplacer `ART_DIRECTION_INVARIANTS` par une description précise du style de la référence :
  - "Hand-drawn semi-realistic cartoon illustration, editorial storybook style"
  - Traits d'encre fins et souples (pas de gros outlines vectoriels)
  - Ombrage doux type crayon de couleur / aquarelle légère, grain papier subtil
  - Palette chaude et désaturée, lumière naturelle douce
  - Proportions humaines réalistes (PAS chibi, PAS anime, PAS 3D, PAS flat vector)
  - **Décor d'arrière-plan flou et contextuel autorisé** (intérieur, cuisine, rue, atelier — cohérent avec la situation) — c'est un changement par rapport au "fond blanc obligatoire" actuel
  - Cadrage portrait épaules/buste, regard caméra, expression douce
  - **Anonymat strict** : visage générique archétypal, jamais une personne identifiable
- Mettre à jour `NEGATIVE_PROMPT` : exclure photoréalisme, 3D, anime/manga, peinture à l'huile, aquarelle saturée, flat vector sticker, watermarks, texte.
- `MODEL_PREVIEW` et `MODEL_FINAL` → `google/gemini-3.1-flash-image-preview` (Nano Banana 2) pour les deux.
- Ajuster `WEIGHTS` / `HARD_FAIL_THRESHOLDS` du QA : garder `style_match` (poids 2.0, seuil 70) et `anonymity` (seuil bloquant), mais retirer toute pénalité liée au "fond blanc".

Fichier : `supabase/functions/qa-avatar/index.ts`

- Mettre à jour le `userPrompt` du QA pour décrire les critères du nouveau style (cartoon illustré, traits crayonnés, fond contextuel flou OK, anonymat strict).
- Garder le hard-fail sur `style_match` et `anonymity` (global capé à 40).

## 2. Avatar Studio — réorganisation légère (pas de refonte 4 zones)

Fichier : `src/pages/AvatarStudio.tsx`

On part de la version actuelle (post-revert, layout 3 colonnes classique avec Accordion à droite, Aperçu à gauche) et on ajoute **uniquement** :

- **Sélecteur de modèle** dans la zone Aperçu, défaut = "Nano Banana 2" (`google/gemini-3.1-flash-image-preview`). Option secondaire "Nano Banana Pro" (`google/gemini-3-pro-image-preview`) conservée mais non-défaut.
- **Badge "Style verrouillé : cartoon illustré storybook"** mis à jour pour refléter le nouveau style.
- **Barre de stats compacte** en haut de la liste (compteurs : Brouillon · Généré · Approuvé · Verrouillé · Échec) — une seule ligne, pas de topbar sticky pleine largeur.
- **Filtres rapides** (chips) sous la recherche existante : Tous · Brouillon · Généré · Approuvé · Verrou · Échec.
- **Raccourcis clavier discrets** : `P` aperçu, `G` HD, `A` approuver, `L` verrouiller, `/` focus recherche. Tooltip `?` listant les raccourcis.
- **Indicateur "Sauvegardé / Sauvegarde…"** à côté du nom du bénéficiaire sélectionné.
- **Reset des avatars existants** : `UPDATE beneficiaries SET avatar_url=NULL, avatar_preview_url=NULL, avatar_status=NULL, avatar_workflow_status='draft', avatar_qa_score=NULL, avatar_qa_report=NULL, avatar_model_used=NULL, avatar_generated_at=NULL` pour tous les bénéficiaires avec un avatar (force la régénération au nouveau style).

On **NE touche PAS** au layout 3 colonnes, aux Accordions des attributs, ni à la route (déjà sur `/avatar-studio`).

## Fichiers modifiés

- `supabase/functions/_shared/avatarArtDirection.ts` — nouveau verrou de style + modèle Nano Banana 2 partout
- `supabase/functions/qa-avatar/index.ts` — critères QA alignés sur le nouveau style
- `src/pages/AvatarStudio.tsx` — sélecteur modèle (défaut NB2), stats compactes, filtres chips, raccourcis, indicateur sauvegarde, badge style mis à jour
- Migration DB (reset des avatars existants)

Pas de changement de route, pas de refonte du layout, pas de nouvelle dépendance.
