
# Plan — Corpulence Léa & couverture attributs

## 1. Diagnostic du test Léa "Forte corpulence"

**Champ modifié par le select Corpulence** : `avatar_body_type` (valeur `heavy`). Aucun autre champ.

**Classement actuel** : `avatar_body_type` est listé dans `STRUCTURAL_TRAIT_KEYS` (`avatarTraits.ts:511`). Une modif seule **devrait** déclencher `status: "requires_confirmation"` côté backend (`generate-avatar/index.ts:448`).

**Pourquoi la corpulence n'apparaît pas dans le toast "Édition contrôlée en cours (…)"** :
- Le toast liste `data.diff[]` retourné par `generate-avatar`. Les logs edge montrent un diff de 13 champs (couleur cheveux, yeux, vêtements, expression, posture, etc.) — **`avatar_body_type` absent**.
- Cause racine : dans le snapshot `avatar_generated_traits` de Léa, `avatar_body_type` valait déjà `heavy` (ou déjà identique à la nouvelle valeur), ou bien le `patch()` UI n'a pas été flushé en DB avant l'appel `generate-avatar` (le select onChange enregistre, mais l'invocation immédiate peut lire l'ancien snapshot). À vérifier via `SELECT avatar_body_type, avatar_generated_traits->>'avatar_body_type' FROM beneficiaries WHERE alias_first_name='Léa'` juste après le clic.
- Conséquence : `diffTraits()` ne voit pas le changement de corpulence → `classifyDiff()` renvoie `level=light` (les 13 autres champs sont soft) → branche `too many changes (13) → full regen` → mode bascule en `preview` plein texte.

**Pourquoi "Dernière génération échouée"** : les logs montrent **`PREVIEW pre-clean bust gate FAILED bust=70` / `bust=60` / `bust=0`**. La régénération complète produit une image dont le bas du buste est tronqué/dissous → rejet par le gate `bust_completeness < BUST_GATE` (post-QA pré-clean). Le toast UI affiche un générique "Échec génération : erreur" car la Realtime payload ne contient pas la vraie raison.

**Cause finale, 3 niveaux** :
1. `avatar_body_type` mal classé : structural ⇒ workflow lourd (confirmation), mais ici le diff ne le voit même pas.
2. Le full regen induit (13 changements) régénère un nouveau visage qui échoue le bust gate → rejet silencieux.
3. L'UI ne remonte pas la raison réelle du rejet (bust, identité, QA globale, dignité).

## 2. Correctifs proposés

### 2.1 Reclasser `avatar_body_type` en attribut MEDIUM sensible
- `supabase/functions/_shared/avatarTraits.ts` : retirer `avatar_body_type` de `STRUCTURAL_TRAIT_KEYS`, l'ajouter à `MEDIUM_TRAIT_KEYS`.
- Conséquence : un changement seul de corpulence passe en **image-to-image edit** (pas en text-to-image), sans confirmation explicite. Le visage source est conservé, seule la morphologie est transformée.
- Ajouter `MEDIUM_TRAIT_KEYS` dans `allKeys` de `diffTraits()` (`avatarTraits.ts:610`) pour que la modif soit détectée même si elle est seule.

### 2.2 Prompt dédié "same person transformed" quand `avatar_body_type` change
- `supabase/functions/_shared/avatarArtDirection.ts` : dans `buildEditPrompt(traits, diff)`, si `diff` contient `avatar_body_type`, ajouter un bloc spécifique en tête du prompt :
```
BODY TYPE TRANSFORMATION — SAME PERSON:
Transform the reference person to match the requested body type while keeping them clearly recognizable as the same individual.
For a stronger/heavier body type, subtly increase facial fullness, cheek softness, neck/shoulder volume, upper bust width, and garment drape.
For a thinner body type, subtly reduce facial fullness and slim the neck/shoulders/bust.
Preserve the same eyes, gaze, nose identity, mouth identity, hairstyle, hair color, age range, pose, artistic style, framing, and overall likeness.
Do not create a new face. Do not change the person into someone else.
```
- Réutiliser la même mécanique (bloc spécifique) pour d'autres transformations sensibles : `avatar_age_range`, `avatar_expression`, `avatar_hair_length`, `avatar_hair_color` — chacune avec un fragment "same person, only X changes".

### 2.3 Ajustement QA identité — "same person transformed"
- `qa-avatar/index.ts` : aujourd'hui `identity_preservation` exige un visage strictement identique. Quand `mode=edit` ET `diff` inclut un attribut transformatif (`avatar_body_type`, `avatar_age_range`, `avatar_expression`), assouplir la grille :
  - identité = mêmes yeux + nez + bouche + coiffure + couleur cheveux + cadrage + style
  - tolérer un changement de plénitude faciale, largeur du cou/épaules, drapé du vêtement
- Implémentation : passer `transformative_traits: string[]` dans le body QA, et l'injecter dans le prompt système ("Allow facial fullness and bust width to change naturally; do not penalise identity for these.").

### 2.4 Surfacer la vraie raison d'échec dans l'UI
- Aujourd'hui : Realtime → status `failed`, l'UI affiche "Dernière génération échouée. Réessayez." (AvatarStudio.tsx:1031).
- Correctif : stocker la raison dans `beneficiaries.avatar_last_failure_reason` (déjà présent ? sinon ajouter colonne via migration **non-destructive**) écrit par `generate-avatar` à chaque rejet, avec catégorie :
  - `bust_incomplete` → "La génération a été rejetée car le bas du buste était incomplet."
  - `identity_drift` → "L'édition n'a pas suffisamment conservé l'identité du visage."
  - `qa_global` → "La QA globale a rejeté l'image (score insuffisant)."
  - `dignity` → "Niveau de dignité insuffisant."
  - `body_type_unstable` → "La transformation de corpulence n'a pas convergé après 2 tentatives."
- L'UI lit ce champ et l'affiche à la place du message générique. Le toast d'erreur côté generate() utilise aussi cette raison si elle est renvoyée dans la réponse HTTP.

### 2.5 Fallback corpulence si edit échoue
- Si `avatar_body_type` change et que l'edit image-to-image rate le bust gate ou la QA identité :
  - 1ère retry automatique avec un seed différent et un prompt renforcé.
  - 2ème échec → ne PAS bascule silencieuse en text-to-image (risque de nouvelle personne). Renvoyer `status: "body_type_unstable"` + raison surfacée. L'opérateur décide de confirmer une régénération complète.

## 3. Couverture des attributs — matrice & fantômes

L'audit complet a déjà été produit (31 attributs). Synthèse :

**Fantôme total (1)** : `avatar_dignity_level` — visible/éditable mais zéro injection prompt, sert uniquement de gate `<3 → blocage`. À retirer du panneau Attributs ou à injecter réellement.

**Fantômes d'édition (9)** : `avatar_hair_length`, `avatar_hair_volume`, `avatar_hair_style`, `avatar_beard`, `avatar_moustache`, `avatar_bald_level`, `avatar_hair_recession`, `avatar_mobility_aid`, `avatar_cultural_style_override`. Cause unique : `diffTraits()` n'inclut pas `MEDIUM_TRAIT_KEYS` dans `allKeys` (`avatarTraits.ts:610`). Modifier l'un seul ces champs renvoie `{ skipped: true, reason: "no_changes" }`. Corrigé en même temps que 2.1.

**Doublon** : `avatar_tired_level` vs `avatar_fatigue_level` — descriptions chevauchantes, à fusionner (priorité moyenne).

**Faibles en édition** : `avatar_eye_shape`, `avatar_eye_color`, `avatar_head_covering`, `avatar_forehead_mark`, `avatar_parent_energy` — corrects en buildAvatarPrompt mais bruts dans buildEditPrompt → enrichir `EDIT_VALUE_LABELS`.

(Matrice complète des 31 champs disponible dans l'audit précédent ; non recopiée ici pour rester sous la limite.)

## 4. Plan de test attribut par attribut

**Bénéficiaires de référence** : Léa (femme jeune), Irina (femme âgée), 1 homme adulte à sélectionner.

**Procédure par test (1 attribut × 1 bénéficiaire)** :
1. Partir d'un avatar validé (snapshot DB capturé).
2. Modifier **uniquement** l'attribut cible dans Avatar Studio.
3. Attendre que `patch()` soit confirmé en DB (vérification SELECT).
4. Cliquer "Générer un aperçu".
5. Vérifications :
   - (a) `diffTraits()` détecte bien la modif (log edge `edit diff (1)`).
   - (b) `classifyDiff()` retourne le bon niveau (light/medium/structural).
   - (c) Mode exécuté correspond (edit pour light/medium, requires_confirmation pour structural).
   - (d) `bust_completeness ≥ 75` sur l'image servie.
   - (e) QA globale ≥ seuil.
   - (f) Effet visuel attendu présent.
   - (g) Identité préservée (visage reconnaissable).
6. Si échec → vérifier que l'UI affiche la **vraie raison** (bust, identité, QA, etc.).

**Format de rapport (CSV)** : `attribut | bénéficiaire | valeur_avant | valeur_après | mode | diff_détecté | bust_pre | bust_post | qa_global | identité_ok | statut`.

**Cas particulier corpulence** : 3 tests dédiés (Léa average→heavy, Léa heavy→thin, Irina average→chubby) pour valider le prompt "same person transformed" et la QA assouplie.

## 5. Périmètre

**Modifié** :
- `supabase/functions/_shared/avatarTraits.ts` (classification + diffTraits)
- `supabase/functions/_shared/avatarArtDirection.ts` (prompt body_type + EDIT_VALUE_LABELS)
- `supabase/functions/generate-avatar/index.ts` (retry corpulence + écriture failure_reason)
- `supabase/functions/qa-avatar/index.ts` (transformative_traits)
- `src/pages/AvatarStudio.tsx` (lecture/affichage `avatar_last_failure_reason`)
- 1 migration additive non-destructive si la colonne `avatar_last_failure_reason` n'existe pas

**Non touché** : fonds, `clean-avatar-background`, cadrage manuel (`avatar_scale/offset_*`), panneau Versions, schéma SQL (hors ajout colonne diag), basket engine, RPC matching, logique de don, UI hors Avatar Studio.

## 6. Livrables après exécution

- Diff des 5 fichiers + migration.
- Log edge montrant `edit diff (1): avatar_body_type:average→heavy` + `classification: level=medium`.
- Captures avant/après Léa corpulence (visage reconnaissable, buste complet).
- Capture toast UI affichant la vraie raison sur un échec simulé.
- Rapport CSV des tests par attribut (Léa minimum, puis Irina et un homme).
- Confirmation : aucune image avec `bust_completeness < 75` ne peut être affichée ; aucune modif d'attribut MEDIUM ne renvoie `no_changes`.
