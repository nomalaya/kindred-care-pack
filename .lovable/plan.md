## Objectif

Ajouter un champ **« Notes privées de pré-remplissage »** dans le bloc *Contexte psychosocial* d'Avatar Studio. Ce texte :
- N'est **jamais** exposé publiquement (jamais lu par les pages donateur ni renvoyé par les RPC publiques)
- Est utilisé **uniquement** par le moteur `inferStudioDefaultsWithReasons` (et donc par « Pré-remplir » + le batch) pour affiner les attributs visuels
- Permet à l'admin d'écrire des indices factuels libres : « yeux marrons », « barbe musulmane », « porte des lunettes », « gaucher », etc.

## Changements

### 1. Base de données (migration)
- Ajouter colonne `avatar_private_notes text` sur `beneficiaries` (nullable, default null).
- Les RPC publiques existantes (`get_empathy_beneficiaries`, `get_ranked_beneficiaries`) ne renvoient déjà pas cette colonne → rien à modifier côté lecture publique.
- RLS actuelle : `Public can read safe beneficiary data` autorise `SELECT *` sur les actifs. **C'est un problème** pour un champ privé. Deux options :
  - **A. Restreindre la policy SELECT publique** à une liste blanche de colonnes via une vue `beneficiaries_public` + révoquer le SELECT direct.
  - **B. Garder la table telle quelle mais s'assurer que tous les `select(...)` du code public n'incluent jamais `avatar_private_notes`, et ajouter une policy `RESTRICTIVE` qui bloque la lecture de cette colonne aux non-admins.
  - Recommandation : **option A** (vue `beneficiaries_public` en `security_invoker` exposant uniquement les colonnes safe), conforme à la mémoire `data-isolation`.

### 2. Moteur d'inférence (`src/lib/avatarAutoInfer.ts`)
- Étendre `InferInput` avec `avatar_private_notes?: string | null`.
- Concaténer `avatar_private_notes` à `rawText` (en plus de `short_story` + `emotional_sentence`) pour la détection de mots-clés.
- Ajouter quelques **signaux factuels** ciblés que les notes privées sont susceptibles d'apporter et qui ne sont pas couverts par les signaux émotionnels actuels :
  - `eye_color` : « yeux marrons / bleus / verts / noisette / gris » → set `avatar_eye_color`
  - `beard_style` : « barbe musulmane / barbe longue / barbe taillée / bouc / barbe de 3 jours » → set `avatar_beard`
  - `glasses`, `head_covering_explicit` (hijab, kippa, turban), `hair_color_explicit`, `skin_tone_explicit`
- Ajouter les libellés correspondants dans `SIGNAL_LABELS` pour que le panneau de raisons (`InferenceReasonsPanel`) reste lisible.
- Marquer les `FieldReason` issues des notes privées avec un flag `private: true` (optionnel) pour que l'UI puisse afficher un petit cadenas 🔒 à côté de la raison.

### 3. UI Avatar Studio
- **`ContextPanel.tsx`** : ajouter une 3e zone `Textarea` sous la phrase émotionnelle :
  - Label : « Notes privées (jamais visibles publiquement) » + icône `Lock`
  - Helper text discret : « Indices factuels pour le pré-remplissage : couleur d'yeux, style de barbe, lunettes… Non publié sur la fiche donateur. »
  - Style visuel distinct (bordure pointillée + fond légèrement teinté) pour bien différencier du contenu public.
  - Inclus dans le patch envoyé à `onSave` / `onReinferAndSave` (clé `avatar_private_notes`).
- **`AvatarStudio.tsx`** : passer `b.avatar_private_notes` à `<ContextPanel>` et l'inclure dans le payload des handlers de save / reinfer (déjà génériques, à vérifier).
- **`AlertDialog` de publication** : adapter le wording — pour les notes privées, **ne pas** afficher « Publier sur la fiche » (elles ne sont pas publiées). Soit on les sauvegarde sans confirmation, soit on affiche un libellé spécifique « Enregistrer (non publié) ».

### 4. Batch & pré-remplissage
- `computePrefillPatch` (déjà en place) appelle `inferStudioDefaultsWithReasons(beneficiary)` : il suffit que `beneficiary` charge la colonne `avatar_private_notes` côté Avatar Studio (admin → policy autorise) pour que le batch en bénéficie automatiquement. Aucune logique batch à modifier.

### 5. Types Supabase
- `src/integrations/supabase/types.ts` sera régénéré automatiquement après la migration.

## Hors scope
- Pas de changement sur le parcours donateur, sur les RPC de matching, ni sur les pages publiques.
- Pas de modification du moteur de panier ni du backend de matching.
- Pas de gestion de versionning / historique des notes privées.

## Question

Pour la confidentialité du champ, préférez-vous :
- **(A)** Créer une vue publique `beneficiaries_public` (plus robuste, recommandé), ou
- **(B)** Restreindre simplement par convention dans le code (plus rapide, mais le champ reste techniquement lisible via l'API publique pour les bénéficiaires actifs) ?
