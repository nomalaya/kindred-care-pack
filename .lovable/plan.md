# Simplification UI Avatar Studio — Fatigue / Tonalité / Dignité (zéro-crédit)

Aucune génération d'image, aucun appel IA, aucune migration SQL, aucune écriture DB automatique.

## Périmètre
Uniquement : fatigue, tonalité émotionnelle, dignité. Aucun autre attribut touché.

## Fichiers modifiés (4)
1. `src/features/avatar-studio/simplifiedFields.ts` — **nouveau** : helpers purs (mappings + lecture inverse).
2. `src/pages/AvatarStudio.tsx` — remplace les sliders concernés, retire le bandeau Dignité.
3. `src/features/avatar-studio/fields.tsx` — labels + sections (retire les clés masquées).
4. `supabase/functions/_shared/avatarArtDirection.ts` — fragments prompts (4 tonalités, fatigue marquée, dignité globale).

## 1. Fatigue visible (4 valeurs)
Remplace les sliders `avatar_tired_level` et `avatar_fatigue_level` par un seul `SelectField` dans la section *Eyes*.

| UI | tired | fatigue |
|---|---|---|
| none — Aucune | 0 | 0 |
| light — Légère | 1 | 1 |
| moderate — Modérée | 3 | 3 |
| marked — Marquée | 5 | 5 |

Lecture inverse : `max(tired, fatigue)` → 0=none, 1-2=light, 3-4=moderate, 5=marked.

## 2. Tonalité émotionnelle (exactement 4 valeurs)
Remplace le `SelectField` Expression + les sliders `emotional_brightness` et `resilience_level` par un seul `SelectField`.

Mapping (utilise uniquement des valeurs `avatar_expression` déjà présentes dans `AVATAR_VOCAB.expression` : `gentle_smile, hopeful, calm, discreet_smile, tired_but_warm, resilient, serious_soft, thoughtful, pensive, reserved`) :

| UI | expression | brightness | resilience |
|---|---|---|---|
| reserved — Réservée | `reserved` | 2 | 3 |
| warm — Chaleureuse | `gentle_smile` | 5 | 3 |
| tired — Fatiguée | `tired_but_warm` | 2 | 3 |
| worried — Inquiète | `pensive` | 2 | 3 |

Lecture inverse : match exact sur `avatar_expression` selon la table ; sinon best-effort par proximité (`hopeful`→warm, `calm/serious_soft/thoughtful`→reserved, `resilient`→reserved). Aucune nouvelle valeur d'enum créée.

## 3. Dignité
- Retire le slider `avatar_dignity_level` (section Social).
- Retire le bandeau « Dignité … bloquée » (AvatarStudio.tsx ~ligne 1243).
- **Aucun patch automatique** au montage. Champ + gate backend conservés tels quels.
- Phrase globale ajoutée systématiquement dans `buildAvatarPrompt` (`avatarArtDirection.ts`) :
  `"Always portray the person with dignity, respect, and humanity. Never humiliating, miserable, grotesque, exaggerated, caricatural, or stereotyped."`

## 4. Prompts (`avatarArtDirection.ts`)
- Bloc fatigue marquée renforcé : ajoute « visible but dignified; never sick, miserable, or theatrical ».
- 4 fragments tonalité ajoutés à `EXPRESSION_DESCRIPTIONS` (réutilisent les clés existantes), avec garde-fous anti-misérabilisme / anti-dramatisation.
- Phrase dignité globale toujours rendue.

## 5. Impact logique
- `inferAvatarTraits` : inchangé.
- `buildAvatarPrompt` / `buildEditPrompt` : alimentés par les mêmes champs base, aucun changement de signature.
- `diffTraits` : inchangé ; un changement de tonalité produit potentiellement 3 entrées de diff dans un même `patch()` (déjà supporté).

## 6. Tests zéro-crédit (post-impl)
- UI : sliders fatigue / luminosité / résilience / dignité masqués ; Fatigue visible et Tonalité émotionnelle présents ; Tonalité = 4 items exactement.
- State : simuler patch en local — Fatigue visible écrit les 2 champs ; Tonalité écrit les 3 champs ; aucun patch dignité au montage (lecture DB inchangée).
- Dry-run prompts : relance `deno run -A scripts/audit-avatar-coverage.ts`, vérifie fragments fatigue marquée + 4 tonalités + phrase dignité globale.
- Audit : `avatar_dignity_level` ne doit plus apparaître comme P0 « visible utilisateur ».

## 7. Risques
- Combinaisons hors mapping (ex : tired=4, fatigue=0) : lecture tolérante par palier le plus proche, pas d'écriture forcée.
- Si une ligne existante a `avatar_expression` hors des 4 valeurs (ex `calm`), lecture inverse rétro-mappe vers `reserved`. Aucun patch tant que l'utilisateur ne touche pas le contrôle.
- Aucun impact runtime sur la génération réelle (mêmes champs base alimentés).

## 8. Livrable final
Liste : fichiers modifiés, mapping final, valeurs `avatar_expression` utilisées (`reserved`, `gentle_smile`, `tired_but_warm`, `pensive`), confirmation 4 valeurs UI, zéro image / IA / SQL, résultats dry-run, P0 restants.
