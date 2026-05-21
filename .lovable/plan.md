
# Refonte Avatar Studio — 5 chantiers

Tout reste **côté frontend admin** (`/avatar-studio`). Aucune modification du moteur de matching, des edge functions de génération, ni de la structure DB.

---

## Chantier 1 — Traçabilité de l'inférence psycho-sociale

**Objectif** : l'admin voit *pourquoi* chaque champ a été déduit.

- Refactor `src/lib/avatarAutoInfer.ts` : `inferStudioDefaults()` retourne désormais `{ values, reasons }` où `reasons: Record<field, { keyword: string, signal: string }[]>`.
- Nouveau state `inferenceReasons` dans `AvatarStudio.tsx`, peuplé à chaque `autoInfer()` et persistant pour la session de sélection.
- Pastille `<Sparkles className="h-3 w-3 text-primary/60">` à droite de chaque `FieldLabel` quand le champ a une raison ; tooltip = "Déduit de : « sclérose en plaques » → mobilité lourde".
- Nouveau panneau pliable **"Pourquoi ces choix ?"** sous les boutons Pré-remplir, listant tous les mappings keyword → signal → champs.

## Chantier 2 — Realtime + suppression du polling

- Remplacer `setInterval(refresh, 4000)` + `setTimeout` par un canal Supabase Realtime sur `beneficiaries` (filtre `id=eq.${selected.id}` quand sélectionné, channel global léger sinon).
- Activer Realtime sur `beneficiaries` via migration (`ALTER PUBLICATION supabase_realtime ADD TABLE beneficiaries;` + `REPLICA IDENTITY FULL`).
- `busy` devient dérivé de `avatar_status` (pending → busy, validated|failed → free) plutôt que piloté par timers.
- Accumulation des `patch()` dans une ref pour fusionner les diffs <600ms en un seul UPDATE (corrige la perte silencieuse).

## Chantier 3 — Édition inline du contexte psychosocial

- Le panneau "Contexte psychosocial" devient éditable : `<Textarea>` pour `short_story` et `emotional_sentence`, bouton **"Re-déduire depuis ce texte"** qui relance `autoInfer("force")` après save.
- Garde-fou : le trigger `validate_beneficiary_french` existe déjà côté DB — on affiche l'erreur retournée proprement (toast).
- Bouton **"Régénérer HD"** directement à la suite, pour boucler texte → traits → image sans quitter l'éditeur.

## Chantier 4 — UX, hiérarchie, sécurité

- **Onglets** : ajouter icônes sur chaque `TabsTrigger` + badge rouge `•` quand l'onglet contient une `RuleWarning`.
- **Bouton "Tout re-déduire" (RotateCcw)** : passage en `DropdownMenu` avec confirmation explicite (action destructive).
- **Indicateur live sous le bouton HD** : si `avatar_dignity_level < 3`, afficher "🛡 Dignité {n}/5 — génération bloquée" + lien direct vers l'onglet Social.
- **Validation cross-champs avant génération** : étendre `evaluateAvatarRules` avec règles mobilité (ex. `wheelchair_*` + `posture: standing_*` = warning bloquant).
- **Versions thumbnails** : ne garder qu'une pastille (vert HD / ambre AP), QA + modèle déplacés en tooltip.
- **Stats topbar** : supprimer les chips redondantes — les filtres existants affichent déjà les compteurs (`Brouillon (12)`).
- **Import externe** : ajouter `confirm()` "Cette image va remplacer l'avatar actif sans contrôle qualité. Continuer ?".
- **Couleurs en dur** (`bg-amber-50`, `text-emerald-600`, etc.) : remplacer par tokens sémantiques HSL définis dans `index.css` (`--status-generated`, `--status-approved`, `--status-locked`, `--status-failed`).
- **Accessibilité** : `aria-label` sur thumbnails versions, `<kbd>` visibles sur boutons P/G/A/L, raccourcis annoncés.

## Chantier 5 — Architecture code

Éclater `src/pages/AvatarStudio.tsx` (1097 lignes) en :

```text
src/pages/AvatarStudio.tsx          (orchestrateur, ~200 l.)
src/features/avatar-studio/
  ├─ types.ts                       (Beneficiary type depuis Database)
  ├─ useBeneficiaries.ts            (fetch + Realtime + patch debounced)
  ├─ useAvatarShortcuts.ts          (raccourcis clavier)
  ├─ BeneficiaryList.tsx            (colonne gauche)
  ├─ PreviewPanel.tsx               (colonne milieu : image + génération + versions)
  ├─ AttributeEditor.tsx            (colonne droite : tabs + champs)
  ├─ ContextPanel.tsx               (story/sentence éditables)
  ├─ InferenceReasonsPanel.tsx      ("Pourquoi ces choix ?")
  ├─ VersionGrid.tsx
  ├─ WorkflowActions.tsx
  └─ fields/
     ├─ SelectField.tsx
     ├─ SliderField.tsx
     └─ FieldLabel.tsx              (avec pastille Sparkles)
```

Typage strict : `type Beneficiary = Database["public"]["Tables"]["beneficiaries"]["Row"]`. Suppression de tous les `any`.

---

## Détails techniques

- **Migration unique** (chantier 2 uniquement) : `ALTER PUBLICATION supabase_realtime ADD TABLE public.beneficiaries; ALTER TABLE public.beneficiaries REPLICA IDENTITY FULL;`
- **Aucun changement** : `generate-avatar` edge function, `inferStudioDefaults` mapping métier (seulement la signature de retour), `avatarArtDirection.ts`, `avatarTraits.ts` vocab, RLS, autres pages.
- **Tests** : ajout d'un fichier `src/lib/__tests__/avatarAutoInfer.test.ts` couvrant Fatima, vétéran SDF, mère isolée enceinte, enfant orphelin — vérifie traits + reasons.
- **Risque maîtrisé** : la refonte UI reste sur `/avatar-studio` (admin), n'affecte pas l'expérience donateur (respect de la contrainte UI stability sur le parcours public).

## Ce qui n'est pas inclus

- Scan antivirus / vérification "image contient un humain" à l'import (proposé dans l'audit) — nécessite appel IA additionnel, à arbitrer séparément.
- Re-encodage des uploads (sharp côté edge) — hors scope frontend.
- Undo global (history stack) — overkill pour un outil admin, le versioning existant suffit.

## Ordre d'exécution

1. Migration Realtime (chantier 2, partie DB)
2. Refactor `inferStudioDefaults` → `{values, reasons}` + tests (chantier 1)
3. Modularisation fichier (chantier 5) — fait *avant* les ajouts UI pour éviter de doubler le travail
4. Realtime + patch queue (chantier 2, partie code)
5. Traçabilité UI : pastilles + panneau "Pourquoi" (chantier 1)
6. Contexte éditable (chantier 3)
7. UX & a11y & tokens couleur (chantier 4)
