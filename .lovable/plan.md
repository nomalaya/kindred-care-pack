## État réel constaté (vérifié à l'instant)

- 200 bénéficiaires actifs : **191 avec avatar**, **9 sans aucun avatar** (`draft`/`pending`/`failed` — ex. Aïcha 22a Hauts-de-France, Amadou 20a Nouvelle-Aquitaine, Fatima 19a Île-de-France).
- Statuts : 186 `generated`, 5 `approved`, 0 `locked` → **aucun n'est réellement « publié »**.
- Le lot de régénération précédent (`regen4.py`) **n'est plus en cours** : le bac à sable a été réinitialisé, l'état `/tmp/regen4.json` est perdu. Le lot devra être reconstitué depuis la base (timestamps `avatar_generated_at` + score de style).
- Analyse alpha des 3 cas signalés (échantillonnage pixel réel) :
  - **David 65a Grand Est : 100 % opaque** → rectangle blanc cuit dans le PNG, le fond importé est totalement masqué. Fichier généré le 01/08 01:44, donc **postérieur** à la réparation alpha : la garde bloquante n'a pas tenu sur ce chemin.
  - **Léa 20a : coins bas opaques** (coins hauts transparents) → bande/rectangle blanc en bas seulement.
  - **Aïsha 35a : détourée** (coins transparents) mais 86 % de surface pleine → le défaut visible est ici un problème de **cadrage/homogénéité trombinoscope**, pas d'alpha.

Diagnostic de cause encore **non confirmé** : deux suspects (la garde alpha de `avatarBackground.ts` est court-circuitée sur certains chemins d'upload, ou `normalizeAvatarFraming`/`trimToStudioBox` s'exécute *après* le détourage et re-remplit le canvas en blanc). La première étape du plan est de le confirmer avant tout correctif.

## Plan

### 1. Confirmer la cause (avant tout correctif)
Rejouer le pipeline sur David en mode instrumenté (dry-run, sans upload) et mesurer le ratio alpha après chaque étape : IA → chroma-key → garde → normalize → trimToStudioBox. On identifie l'étape exacte qui réintroduit l'opacité, et on ne corrige que celle-là.

### 2. Corriger le pipeline
- Déplacer/dupliquer la **garde alpha bloquante en tout dernier ressort**, juste avant chaque `storage.upload` de `generate-avatar` (aujourd'hui plusieurs branches d'upload existent, la garde ne couvre pas les mêmes).
- Interdire tout remplissage blanc dans `avatarNormalize.ts` : le canvas de sortie doit rester RGBA transparent (padding et trim inclus).
- Ajouter un **critère QA bloquant `alpha_ok`** : si opacité globale > 98 % ou si un coin bas est opaque, rollback automatique (fichier précédent conservé).

### 3. Audit complet du catalogue (191 fichiers, coût 0)
Script d'audit qui télécharge chaque PNG et calcule : ratio d'opacité, opacité des 4 coins, marge basse, hauteur de la ligne des yeux, remplissage du buste. Sortie : `.lovable/audit-avatars.md` + JSON avec 3 buckets :
- **A** : conformes → à publier.
- **B** : défaut alpha uniquement → réparables sans IA via `normalize-avatar-framing` en `key_only` + `force_key` (cas David, Léa 20a).
- **C** : défaut de cadrage/style → régénération nécessaire (cas Aïsha 35a).

### 4. Réparations et complétion séquentielles
- Bucket **B** : réparation en lot `key_only` (aucun crédit, aucun appel IA).
- Bucket **C** + les **9 avatars manquants** : régénération séquentielle via Google AI direct (0 crédit Lovable), avec garde bloquante et rollback, suivi persistant dans un fichier d'état, planche de contrôle par lot.

### 5. Publication des 200
Une fois chaque avatar validé sur planche de contrôle : passage en `avatar_workflow_status = 'approved'` puis `'locked'` (verrou anti-régénération), `avatar_status = 'validated'`. Publication par lots validés, jamais en aveugle.

### 6. Export JSON depuis l'Avatar Studio
Nouveau bouton **« Exporter JSON »** dans la barre d'actions de l'Avatar Studio :
- Export du périmètre courant (tout le catalogue ou la sélection filtrée).
- Contenu par bénéficiaire : `id`, `alias_first_name`, `region`, tranche d'âge (jamais l'âge exact, conformément à la règle de confidentialité), les 31 attributs d'avatar, `avatar_url`, statut/workflow, scores QA et style, `avatar_generated_at`.
- Téléchargement client-side (`Blob` + `URL.createObjectURL`), nommé `avatars-cashforcause-YYYY-MM-DD.json`. Aucun changement de logique backend, style conforme au design système existant.

## Détails techniques

Fichiers concernés : `supabase/functions/_shared/avatarBackground.ts` (garde en dernier ressort), `supabase/functions/_shared/avatarNormalize.ts` (zéro remplissage blanc), `supabase/functions/generate-avatar/index.ts` (garde sur toutes les branches d'upload + critère `alpha_ok`), `supabase/functions/qa-avatar/index.ts` (critère bloquant), `src/pages/AvatarStudio.tsx` (bouton export), nouveau `src/features/avatar-studio/exportJson.ts`.

Aucune modification du moteur de matching ni du panier. Aucun crédit Lovable consommé : génération via la clé Google directe, réparations alpha sans IA.

## Livrables

1. Rapport d'audit des 191 avatars (3 buckets, défauts nommés).
2. Confirmation de la cause du rectangle blanc + correctif.
3. Planches de contrôle par lot, sur fond coloré pour vérifier l'alpha.
4. 200/200 avatars conformes et publiés (`locked`).
5. Export JSON opérationnel depuis l'Avatar Studio.
