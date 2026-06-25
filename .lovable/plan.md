## Objectif

Vérifier la couverture complète de tous les attributs Avatar Studio sans consommer un seul crédit IA. Aucun appel à Nano Banana, Gemini ou au gateway image. Tout est statique ou simulé en TypeScript.

## Livrables

1. Un script Deno autonome `scripts/audit-avatar-coverage.ts` qui :
   - importe `AVATAR_VOCAB`, `buildAvatarPrompt`, `buildEditPrompt`, `diffTraits`, `classifyDiff`, `inferAvatarTraits`, les dictionnaires de grammaire
   - n'invoque AUCUNE fonction edge, AUCUN modèle, ne lit pas la DB
   - produit deux fichiers dans `.lovable/audit-coverage/` :
     - `coverage-matrix.md` — tableau attribut × valeur × statut
     - `dry-run-prompts.md` — fragments de prompt création + édition par valeur
     - `diff-simulations.md` — simulations de diff (avant/après)
     - `issues.md` — problèmes auto-détectés

2. Aucun changement au pipeline runtime. Aucune modification de `generate-avatar`, `qa-avatar`, `avatarTraits.ts`, `avatarArtDirection.ts`, des RPC, SQL, panier, matching, fonds, cadrage, panneau Versions.

## Détail technique

### Audit 1 — Couverture statique

Pour chaque clé de `AVATAR_VOCAB` (face, eyes, hair, beard/moustache, head_covering, forehead_mark, clothing, posture, body_type, mobility_aid, expression, parent_energy, cultural_style, etc.) et chaque valeur :

| Vérification | Source |
|---|---|
| Présent UI | `TAB_FIELDS` + `FIELD_LABELS` dans `src/features/avatar-studio/fields.tsx` |
| Label FR | `VOCAB_LABELS` dans `src/lib/avatarVocabLabels.ts` |
| Grammaire visuelle | dictionnaires `*_DESC` dans `avatarArtDirection.ts` |
| Utilisée en création | recherche dans `buildAvatarPrompt` (extras, HEAD_COVERING, MOBILITY, FOREHEAD_MARK, PARENT_ENERGY locaux) |
| Utilisée en édition | présence dans `EDIT_VALUE_LABELS` |
| Comparée par diffTraits | présence dans `STRUCTURAL_TRAIT_KEYS ∪ MEDIUM_TRAIT_KEYS ∪ SOFT_TRAIT_KEYS` |
| Classée par classifyDiff | dérivé du précédent |
| Label éditable lisible | présence d'une entrée non-fallback dans `EDIT_VALUE_LABELS[key][value]` |

Statut par cellule : `OK` / `valeur absente UI` / `label FR manquant` / `grammaire absente` / `absente création` / `absente édition` / `non comparé` / `classification incohérente`.

### Audit 2 — Prompt dry-run

Pour chaque attribut et chaque valeur :

- Construire un `AvatarTraits` baseline (Léa) puis surcharger l'attribut audité
- Appeler `buildAvatarPrompt(traits)` → capter l'extrait pertinent (regex sur la valeur ou la phrase de grammaire)
- Construire un `TraitDiff` synthétique baseline→valeur et appeler `buildEditPrompt(diff, traits)` → capter le bloc CHANGES + éventuel `TRANSFORM_BLOCKS[key]`
- Logguer : fragment création / fragment édition / présence d'un bloc « same person transformed » / niveau retourné par `classifyDiff`

Zéro appel réseau, zéro génération.

### Audit 3 — Diff dry-run

Pour ~15 simulations clés (couvrant tous les niveaux) :

```
body_type      average → heavy        (medium / edit_hd)
hair_type      curly   → coily        (structural ← à signaler)
hair_color     white   → dark_brown   (light  / edit)
hair_length    medium  → short        (medium / edit_hd)
hair_style     loose   → bun          (light)
expression     reserved→ gentle_smile (light)
posture        upright_calm → leaning_slightly (light)
beard          none    → full         (medium)
mobility_aid   none    → cane         (medium)
head_covering  none    → hijab_full   (structural)
skin_tone      light   → dark         (structural)
nose           straight→ aquiline     (structural)
forehead_mark  none    → bindi_red    (light)
clothing_style casual_modest → soft_cardigan (light)
parent_energy  none    → protective_parent   (light)
```

Pour chacune : diff retourné par `buildTraitDiffFromKeys`, classification, mode attendu (`edit` light, `edit_hd` medium, `requires_confirmation` structural, `no_changes` si vide), full-regen oui/non, éditable image-to-image oui/non.

### Détection automatique

Le script génère un `issues.md` listant :

- valeurs présentes dans `AVATAR_VOCAB` absentes de `VOCAB_LABELS`
- valeurs sans entrée dans le `*_DESC` correspondant
- attributs présents dans `EDIT_VALUE_LABELS` mais absents de `STRUCTURAL/MEDIUM/SOFT`
- attributs comparés par `diffTraits` mais sans `EDIT_VALUE_LABELS` (édition aveugle)
- doublons sémantiques détectables (paires hard-codées : `curly`/`coily`, `chubby`/`heavy`, `medium`/`shoulder`, `tousled`/`loose`) avec note humaine
- attributs `_level` numériques absents des trois listes (slider non diffé)

### Exécution

```
deno run -A scripts/audit-avatar-coverage.ts
```

Reads `src/lib/avatarTraits.ts`, `src/lib/avatarVocabLabels.ts`, `src/features/avatar-studio/fields.tsx`, `supabase/functions/_shared/avatarTraits.ts`, `supabase/functions/_shared/avatarArtDirection.ts`. Pas de DB, pas de gateway, pas d'image. Coût : 0 crédit.

## Hors périmètre

- Pas de génération d'image, pas de test prod, pas d'appel `generate-avatar`/`qa-avatar`
- Pas de modification fonds, cadrage, panneau Versions, SQL, RPC, panier, matching
- Pas de nettoyage de `audit-model-compare`, `force_edit_mode`, `audit_capture` (différé)
- Les 6 tests réels listés (corpulence, cheveux, barbe, mobilité, expression) ne seront proposés qu'APRÈS lecture du rapport, sur ta validation explicite

## Ce que tu obtiendras après exécution

1. `.lovable/audit-coverage/coverage-matrix.md` — tableau exhaustif
2. `.lovable/audit-coverage/dry-run-prompts.md` — fragments création/édition pour chaque valeur
3. `.lovable/audit-coverage/diff-simulations.md` — 15 simulations avec mode attendu
4. `.lovable/audit-coverage/issues.md` — liste priorisée des trous détectés
5. Un résumé court en chat avec les 3-5 problèmes les plus critiques

Puis tu décides quelles corrections prioriser et lesquels (max 6) des tests réels lancer.
