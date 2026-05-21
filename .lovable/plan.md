## Objectif

Quand on sélectionne un bénéficiaire dans Avatar Studio, les champs **Genre** et **Tranche d'âge** doivent être pré-remplis automatiquement à partir des données déjà connues (`real_first_name`, `alias_first_name`, `approx_age`), sans que l'admin ait à cliquer sur « Pré-remplir ».

## Comportement attendu

- **Tranche d'âge** : mappée depuis `approx_age` vers le vocabulaire `AVATAR_VOCAB.age_range` (`"18-25"`, `"25-35"`, …, `"75-85"`).
- **Genre** : déduit du prénom (concat `real_first_name + alias_first_name`) via un dictionnaire de prénoms français + heuristique de terminaisons (« -a », « -ette », « -ine » → féminin ; « -ic », « -an », « -er » → masculin).
- **Prénoms ambigus** (Camille, Dominique, Claude, Alex, Maxime, Sacha…) → `"woman"` par défaut.
- **Prénom inconnu** → `"person"` (valeur neutre du vocab).
- **Écrasement** : on ne remplit que si le champ existant est vide/`null`. Les valeurs déjà saisies manuellement sont préservées.
- Pas de toast bruyant : l'application est silencieuse à la sélection ; un petit badge ✨ (composant `InferredPastille` existant) signale les champs déduits.

## Implémentation

### 1. Nouveau helper `src/lib/genderFromName.ts`
- Export `inferGenderFromName(...names: (string | null | undefined)[]): "woman" | "man" | "person" | null`.
- Dictionnaire FR avec ~250 prénoms les plus fréquents (Insee top 200 + prénoms maghrébins/africains/arabes courants présents dans la base : Fatima, Aïcha, Mohamed, Karim, Aminata, Issa, etc.).
- Normalisation : lowercase + suppression diacritiques + suppression seconds prénoms (split sur espace/`-`).
- Si non trouvé : règles de terminaison FR.
- Si ambigu (présent dans set `AMBIGUOUS_FR`) → `"woman"` (choix produit).
- Retourne `null` uniquement si toutes les entrées sont vides.

### 2. Helper `src/lib/avatarAgeRange.ts`
- Export `mapApproxAgeToVocab(age: number | null | undefined): string | null`.
- Bornes alignées sur `AVATAR_VOCAB.age_range` : `<25 → "18-25"`, `<35 → "25-35"`, `<45 → "35-45"`, `<55 → "45-55"`, `<65 → "55-65"`, `<75 → "65-75"`, `≥75 → "75-85"`.
- Distinct du `getAgeRange` existant (qui renvoie « 18-25 ans » pour l'affichage). Ne pas modifier le fichier d'affichage.

### 3. Extension de `src/lib/avatarAutoInfer.ts`
- Dans `inferStudioDefaultsWithReasons`, ajouter en début :
  - Si `avatar_age_range` peut être déduit depuis `approx_age` → mettre dans `values`, raison `{ signal: "age_known", signalLabel: "Âge connu", keyword: String(approx_age) }`.
  - Si genre déduit du prénom → mettre dans `values`, raison `{ signal: "name_known", signalLabel: "Prénom", keyword: prenomMatché }`.
- Ajouter `real_first_name` et `alias_first_name` dans `InferInput`.
- Ajouter `SIGNAL_LABELS.age_known` et `SIGNAL_LABELS.name_known`.

### 4. Auto-déclenchement dans `AvatarStudio.tsx`
- Dans le `useEffect([selectedId])` existant (qui charge les versions), ajouter une étape :
  - Si `selected.avatar_gender == null` OU `selected.avatar_age_range == null`, appeler `inferStudioDefaultsWithReasons` puis filtrer aux 2 champs ciblés + champs vides, et déclencher `patch(toApply, { silent: true })`.
  - Mettre à jour `inferenceReasons` avec les raisons correspondantes (badge ✨ visible).
- N'affecte rien d'autre : la logique « Pré-remplir » manuelle reste identique.

### 5. Tests `src/lib/__tests__/genderAndAge.test.ts`
- `mapApproxAgeToVocab` : bornes (24→18-25, 25→25-35, 80→75-85, null→null).
- `inferGenderFromName` :
  - `"Fatima"` → `woman`
  - `"Mohamed"` → `man`
  - `"Camille"` (ambigu) → `woman`
  - `"Xyzqw"` (inconnu) → `person`
  - `(null, null)` → `null`
- `inferStudioDefaultsWithReasons` : un bénéficiaire avec `real_first_name="Karim"`, `approx_age=42`, et tous champs vides → `values.avatar_gender === "man"`, `values.avatar_age_range === "35-45"`, raisons présentes.

## Non-objectifs

- Pas de changement sur l'edge function `generate-avatar`.
- Pas de migration SQL.
- Pas de modification du moteur de matching ni des règles métier.
- Pas de toucher au composant `BeneficiaryListPanel` (lecture seule).

## Diagramme de flux

```text
selectedId change
       │
       ▼
load versions ──┐
                │
                ▼
   gender or age_range vide ?
       │ oui
       ▼
inferStudioDefaultsWithReasons(b)
       │
       ▼
filtrer aux champs vides
       │
       ▼
patch(values, { silent: true })  →  setInferenceReasons(reasons)
       │
       ▼
UI : champs remplis + badge ✨ + tooltip « Déduit du prénom / âge »
```

## Critères d'acceptation

- Sélectionner un bénéficiaire sans `avatar_gender` ni `avatar_age_range` → les deux Select se remplissent en <1s sans clic.
- Un champ déjà rempli manuellement n'est jamais écrasé.
- Le badge ✨ apparaît à côté du label des champs déduits avec le tooltip « Prénom ← « Karim » » / « Âge connu ← « 42 » ».
- Les 14 tests existants passent ; les nouveaux tests passent.