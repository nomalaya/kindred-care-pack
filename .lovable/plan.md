
# Correctif révisé — diff piloté par l'intention utilisateur

## Principe directeur (validé)

`avatar_generated_traits` reste **la photo fidèle de l'image active** et n'est jamais réécrit silencieusement à partir des attributs UI courants. Le diff réel n'est plus déduit d'une comparaison snapshot ↔ traits inférés (source de faux positifs), mais **transmis explicitement par le frontend** sous forme de `changedKeys` / `requestedDiff`.

Le snapshot n'est mis à jour qu'aux moments où on a la **preuve** qu'il correspond à l'image servie : succès d'une génération `final`, succès d'un `edit_hd` qui promeut `avatar_url`. Inchangé sur ce point.

---

## 1. Frontend — tracker l'intention utilisateur

**Fichier** : `src/pages/AvatarStudio.tsx` (+ éventuellement `src/features/avatar-studio/fields.tsx` si la zone d'édition est isolée).

- Au montage de la fiche bénéficiaire, mémoriser `baselineTraits = { ...beneficiary }` (snapshot UI initial des champs `avatar_*` éditables).
- Sur chaque `patch(field, value)`, comparer à `baselineTraits[field]` :
  - si différent → ajouter `field` à un `Set<string> pendingChangedKeys` et stocker `{ before, after }` dans `pendingDiff`.
  - si égal à la baseline (l'utilisateur a annulé) → retirer le champ de `pendingChangedKeys`.
- Au clic "Générer un aperçu" : envoyer au backend
  ```ts
  {
    beneficiary_id, mode: "edit",
    changedKeys: Array.from(pendingChangedKeys),
    requestedDiff: pendingDiff,
  }
  ```
- Après succès de génération, **réinitialiser** `baselineTraits` sur les valeurs courantes et vider `pendingChangedKeys` (l'image active correspond désormais à ces traits).
- Après échec, garder `pendingChangedKeys` pour permettre une nouvelle tentative.
- Cas "aucun changement" : si `pendingChangedKeys.size === 0` au clic, **ne pas appeler le backend** ; afficher directement le toast neutre (cf. §4).

## 2. Backend — diff = uniquement les `changedKeys`

**Fichier** : `supabase/functions/generate-avatar/index.ts`.

Dans la branche `mode === "edit" | "edit_hd"` :

1. Lire `changedKeys: string[]` et `requestedDiff: Record<string, {before, after}>` depuis le body.
2. **Si `changedKeys` est fourni (nouveau flux)** :
   - Construire `editDiff` **uniquement** à partir de ces clés, en croisant avec `currentTraits = inferAvatarTraits(b)` et `previousTraits = b.avatar_generated_traits` (pour le `before` quand le front ne l'a pas fourni).
   - Ignorer totalement les autres champs `null → valeur_inférée` du snapshot stale.
   - Si après filtrage `editDiff.length === 0` (ex. l'utilisateur reclique sur la valeur déjà active) → renvoyer `{ skipped: true, reason: "no_user_changes" }` **sans rien écrire**.
3. **Si `changedKeys` est absent (rétro-compatibilité ancien client)** : conserver le comportement actuel mais journaliser `legacy_diff_path` pour le repérer.
4. `classifyDiff(editDiff)` est appliqué normalement → `light` / `medium` / `structural`. Plus de bascule "trop de modifs" déclenchée par un snapshot stale, puisque le diff vient désormais de l'intention utilisateur.
5. `MAX_EDIT_DIFF` (=8) reste comme garde-fou pur intention utilisateur (peu probable d'être atteint via clics).

**Pas de rebaseline silencieux du snapshot** — point bloquant respecté.

## 3. Corpulence — prompt "same person transformed"

**Fichier** : `supabase/functions/_shared/avatarArtDirection.ts`.

Dans `buildEditPrompt(traits, diff)`, si `diff` contient `avatar_body_type`, **préfixer** le prompt par le bloc validé :

```
BODY TYPE TRANSFORMATION — SAME PERSON:
Transform the reference person to match the requested body type while keeping
them clearly recognizable as the same individual.
For a stronger/heavier body type, subtly increase facial fullness, cheek softness,
neck/shoulder volume, upper bust width, and garment drape.
For a thinner body type, subtly reduce facial fullness, slim the neck/shoulders
and reduce bust width.
Preserve the same eyes, gaze, nose identity, mouth identity, hairstyle, hair color,
age range, pose, artistic style, framing, and overall likeness.
Do not create a new face. Do not change the person into someone else.
The result must look like the same person whose body type has changed naturally.
```

`avatar_body_type` reste classé **MEDIUM** (image-to-image, pas de confirmation) — déjà fait en V5.

Côté `qa-avatar/index.ts` : `transformative_traits` inclut déjà `avatar_body_type` → assouplissement identité déjà actif. Inchangé.

## 4. Messages UI explicites

**Fichiers** : `src/lib/avatarFailureReason.ts` + `src/pages/AvatarStudio.tsx`.

Mapping enrichi (codes côté serveur → libellés FR) :

| Code serveur | Message UI |
|---|---|
| `no_user_changes` | "Aucun changement détecté — l'avatar actuel correspond déjà aux attributs sélectionnés." |
| `value_already_active` (front, pré-appel) | "Corpulence déjà définie sur {label}. Aucun changement réel détecté." (générique sur le libellé du champ et la valeur) |
| `bust_incomplete_pre_clean` | "La génération a été rejetée car le bas du buste était incomplet (fondu, coupé ou dissous)." |
| `bust_incomplete_after_clean` | "Le détourage a tronqué le bas du buste." |
| `identity_drift` | "L'édition n'a pas suffisamment conservé l'identité du visage." |
| `body_type_unstable` | "La transformation de corpulence n'a pas convergé après 2 tentatives." |
| `qa_global` | "La QA globale a rejeté l'image (score insuffisant)." |
| `structural_change_required_confirmation` | "Cette modification touche l'identité visuelle. Confirmez la régénération complète." |

Le toast d'erreur lit `avatar_qa_report.reason` (déjà écrit en V5) et utilise ce mapping au lieu du générique "Dernière génération échouée".

## 5. Plan de test Léa (à exécuter après build)

Pré-état : Léa `de8c19bc-…cd61`, `avatar_body_type = heavy`, snapshot `heavy`.

| # | Action | Attendu serveur | Attendu UI |
|---|---|---|---|
| 1 | Cliquer "Forte" (déjà heavy), puis "Générer un aperçu" | **Aucun appel HTTP** (le front court-circuite via `pendingChangedKeys.size===0`) | Toast neutre "Aucun changement détecté…" |
| 2 | Passer "Forte" → "Moyenne", "Générer un aperçu" | `changedKeys=["avatar_body_type"]` → `editDiff=[avatar_body_type: heavy→average]` → classification `medium` → `MODEL_EDIT` image-to-image avec bloc "SAME PERSON" → bust ≥ 75 | Toast "Édition contrôlée en cours (1) : Corpulence" puis preview servie |
| 3 | Repasser "Moyenne" → "Forte" | `changedKeys=["avatar_body_type"]` → `editDiff=[avatar_body_type: average→heavy]` → même flux | Visage plus plein, mêmes cheveux/yeux/cadrage, buste complet |

Vérifications systématiques par log edge : `edit diff (1)`, `classification: level=medium`, absence du log `too many changes`, `bust_completeness ≥ 75`.

## 6. Périmètre

**Modifié** :
- `src/pages/AvatarStudio.tsx` (tracking `pendingChangedKeys`, court-circuit "no changes", lecture failure_reason enrichie)
- `src/lib/avatarFailureReason.ts` (codes additionnels)
- `supabase/functions/generate-avatar/index.ts` (lecture `changedKeys` / `requestedDiff`, diff restreint, code `no_user_changes`, journalisation `legacy_diff_path`)
- `supabase/functions/_shared/avatarArtDirection.ts` (bloc "SAME PERSON" en tête de `buildEditPrompt` si `avatar_body_type` ∈ diff)

**Non touché** : snapshot rewrite (jamais automatique), `avatarTraits.ts` (pas de filtre `null→…` aveugle), fonds, clean-avatar-background, cadrage, panneau Versions, schéma SQL, RPC matching, logique de don, UI hors Avatar Studio. `qa-avatar/index.ts` inchangé (V5 déjà OK).

## 7. Livrables après exécution

1. Diff des 4 fichiers.
2. Capture du test 1 : toast "Aucun changement détecté", aucune requête réseau dans la console.
3. Capture des tests 2 & 3 : avant/après image (identité préservée, buste complet, plénitude faciale ajustée).
4. Logs edge : `edit diff (1): avatar_body_type:heavy→average` puis `:average→heavy`, classification `medium`, bust ≥ 75.
5. Confirmation explicite : aucune réécriture automatique de `avatar_generated_traits` n'a eu lieu sur les chemins `skipped` / échec / edit ; le snapshot n'est mis à jour qu'aux succès `final` / `edit_hd` (comportement V5 inchangé).
