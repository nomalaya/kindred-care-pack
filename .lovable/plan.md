## Objectif

Permettre de lancer, depuis Avatar Studio, l'équivalent du bouton « Pré-remplir » suivi de la génération HD, sur plusieurs bénéficiaires d'un coup, par batch.

## Ce qui existe déjà

- **`autoInfer("fill")`** dans `src/pages/AvatarStudio.tsx` : applique `inferStudioDefaultsWithReasons(beneficiary)` pour ne remplir QUE les champs avatar vides/invalides, puis sauvegarde via `patch(...)` (UPDATE sur `beneficiaries`).
- **Edge function `generate-avatar-batch`** : déjà utilisée dans `src/pages/Admin.tsx` (`launchBatch`) ; elle prend `{ beneficiary_ids, mode: "final" }` et marque préalablement `avatar_status = "pending"`.
- La logique d'inférence (`src/lib/avatarAutoInfer.ts`) est pure côté client → réutilisable sans appel serveur.

## Ce qui manque

Un orchestrateur côté Avatar Studio qui :
1. Sélectionne un sous-ensemble de bénéficiaires.
2. Pour chacun, calcule les valeurs auto-déduites et applique uniquement les champs vides (mode `"fill"`, comme « Pré-remplir »).
3. Persiste ces attributs en base.
4. Déclenche la génération HD en batchs.

## Plan d'implémentation

### 1. Ajouter une barre d'action « Batch » dans `AvatarStudio.tsx`

Dans le header de la colonne liste (au-dessus de `BeneficiaryListPanel`), ajouter un bouton **« Pré-remplir + Générer (lot) »** avec un petit menu :

- **Portée** : `Tous (filtre actif)` / `Sans avatar HD` / `Brouillons (draft)` / `Avatar manquant un attribut`.
- **Taille de lot** : champ numérique (défaut 10, max 50).
- **Mode** : 
  - `fill` (par défaut, équivalent strict du bouton Pré-remplir : n'écrase pas) 
  - `force` (re-déduit tout, confirmation requise).
- Bouton **Lancer**.

État local : `batchRunning`, `batchProgress { done, total, failed }`, affichage d'une barre de progression discrète sous la barre d'action et d'un toast récapitulatif à la fin.

### 2. Extraire la logique de pré-remplissage en helper pur

Créer `src/features/avatar-studio/batchPrefill.ts` exportant :

```ts
computePrefillPatch(b: Beneficiary, mode: "fill" | "force"): Record<string, any>
```

Elle reprend exactement la même logique que `autoInfer` (lignes 194–231 de `AvatarStudio.tsx`) sans toast ni dépendance React. `autoInfer` sera ensuite réécrit pour l'utiliser → comportement strictement identique au bouton actuel.

### 3. Orchestrateur batch

Nouvelle fonction `runBatchPrefillAndGenerate(beneficiaries, { mode, chunkSize })` dans la page :

```text
sélectionner ids éligibles selon le filtre
pour chaque chunk de N bénéficiaires (N = 5 par défaut):
  a) construire les patches via computePrefillPatch
  b) appliquer en une seule requête UPDATE par bénéficiaire 
     (boucle Promise.all sur supabase.from("beneficiaries").update)
     -- on évite un upsert massif pour ne pas toucher les champs non concernés
  c) appeler supabase.functions.invoke("generate-avatar-batch", 
                                      { body: { beneficiary_ids: chunkIds, mode: "final" } })
  d) mettre à jour batchProgress + setBeneficiaries local (avatar_status="pending")
  e) attendre un court délai (300 ms) entre chunks pour limiter la charge
fin
toast final: "{done}/{total} traités, {failed} échecs"
```

Le chunking évite les timeouts de l'edge function et permet à la Realtime / au polling existant de rafraîchir progressivement la grille.

### 4. Garde-fous

- **Verrou** : ignorer les bénéficiaires dont `avatar_workflow_status` est `"locked"` ou `"approved"` (même règle que `isLocked` dans la page).
- **Dignité** : ignorer ceux dont `dignity_score < 3` (déjà géré pour la génération unitaire).
- **Confirmation** : modal avant lancement résumant « X bénéficiaires concernés, Y verrouillés ignorés, mode `fill|force` ».
- **Annulation** : un bouton « Arrêter » qui empêche le lancement des chunks suivants (le chunk en cours va au bout).

### 5. Pas de changement backend

- `generate-avatar-batch` est inchangé.
- Aucune modification des fonctions de matching/panier.
- Aucune migration SQL.

## Fichiers concernés

- `src/features/avatar-studio/batchPrefill.ts` (nouveau, helper pur)
- `src/features/avatar-studio/BatchActionsBar.tsx` (nouveau, UI compacte)
- `src/pages/AvatarStudio.tsx` (intégration de la barre + orchestrateur, refacto léger de `autoInfer` pour utiliser le helper)

## Hors scope

- Pas de nouvelle edge function.
- Pas de modification de `Admin.tsx` (le batch existant y reste, ce nouveau bouton est spécifique à Avatar Studio et combine **pré-remplissage + génération**, ce que l'admin ne fait pas).
- Pas de file d'attente persistée : si la page est fermée pendant le batch, les générations déjà lancées continuent côté serveur, mais la progression UI est perdue.
