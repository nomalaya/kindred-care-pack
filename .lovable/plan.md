## Constat

- Le prompt actuel (`avatarArtDirection.ts`) demande déjà un cadrage « collarbone / au-dessus de la poitrine », mais Gemini ne respecte pas systématiquement cette consigne — d'où des avatars qui descendent trop bas.
- La seule façon **fiable** d'obtenir un cadrage strictement identique sur tous les avatars est un **recadrage déterministe côté serveur** (post-traitement de l'image générée), pas un nouveau prompt.
- Pour les avatars déjà générés, il faut un bouton « Recadrer » sur une version existante (depuis le carrousel de versions dans AvatarStudio) qui applique le même recadrage et la promeut comme avatar actif.

## Objectif

1. Tous les **futurs** avatars (preview Flash, final HD, batch) sont automatiquement recadrés à une **ligne de coupe constante** (juste au-dessus de la poitrine, ~72 % de la hauteur conservée depuis le haut — valeur centralisée et réglable).
2. Sur une version existante qui plaît, un bouton **« Recadrer ↑ poitrine »** applique exactement le même recadrage et la définit comme avatar HD actif.

## Modifications (frontend + edge functions, zéro changement de schéma DB)

### 1. Constante partagée

Créer `supabase/functions/_shared/avatarCrop.ts` :
- Constante `CROP_TOP_KEEP_RATIO = 0.72` (fraction de hauteur conservée depuis le haut — ajustable d'un seul endroit).
- Fonction `cropAvatarBytes(bytes: Uint8Array): Promise<Uint8Array>` qui :
  - décode le PNG (via `npm:@jsquash/png` ou `https://deno.land/x/imagescript`),
  - garde uniquement les `height * 0.72` premiers pixels,
  - ré-encode en PNG carré en re-paddant le bas en blanc pur pour conserver un canvas 1:1 (cohérent avec le système de fond blanc actuel).
- Idempotent et déterministe.

### 2. Application au pipeline de génération

- `supabase/functions/generate-avatar/index.ts` : passer `bytes` dans `cropAvatarBytes()` **avant** l'upload (modes preview ET final, et avant l'envoi à `qa-avatar` pour que le score reflète l'image livrée).
- `supabase/functions/generate-avatar-batch/index.ts` : idem si elle gère ses propres uploads (sinon elle hérite via generate-avatar).
- `supabase/functions/clean-avatar-background/index.ts` : appliquer le même crop pour rester cohérent quand on re-traite un fond.

### 3. Nouvelle edge function `recrop-avatar-version`

- Input : `{ beneficiary_id, version_id }` (ou `image_url`).
- Action :
  - Télécharge l'image de la version depuis le bucket `avatars`,
  - applique `cropAvatarBytes()`,
  - upload comme nouvelle version `versions/{beneficiary_id}/recropped-{ts}.png`,
  - upload sur `{beneficiary_id}.png` (avatar actif HD),
  - met à jour `beneficiaries.avatar_url`, `avatar_status='validated'`, `avatar_workflow_status` (préserve approved/locked sinon → `generated`),
  - insère une ligne dans `avatar_versions` avec `model_used` hérité + tag dans le `prompt` ("[recropped]"),
  - copie le `qa_score` de la version source (le contenu visuel reste le même, seul le bas change).

### 4. UI AvatarStudio

- Dans la carte de chaque version du carrousel (colonne centrale du nouveau layout 3 colonnes), ajouter un bouton icône **« Recadrer ↑ poitrine »** (Crop icon, tooltip explicite).
- Au clic : confirme (toast) → appelle `recrop-avatar-version` → `refresh()` → la version recadrée apparaît dans le carrousel et devient l'avatar actif.
- Petit slider optionnel (admin-only, dans le header de la colonne) « Hauteur du cadrage » 0.60 → 0.85 — stocké dans `localStorage` pour le studio uniquement ; envoyé en paramètre optionnel à `recrop-avatar-version` (le défaut reste 0.72 pour la génération auto).

### 5. Nettoyage prompt

Garder le bloc FRAMING actuel (renforce la cohérence), mais documenter dans le fichier que le cadrage **définitif** est garanti par le post-traitement, pas par le prompt.

## Hors scope

- Aucun changement de table, RLS, matching ou logique de panier.
- Pas de recadrage rectangulaire manuel par drag — le besoin est un cadrage **uniforme**, pas un éditeur photo.
- Pas de re-génération : on recadre l'image existante, on ne dépense pas de crédits AI.

## Question avant build

Le ratio par défaut **0.72** (on garde les 72 % supérieurs de l'image, ce qui coupe pile au-dessus de la poitrine pour les générations Gemini actuelles) te convient comme point de départ, ou tu préfères **0.68** (un peu plus haut, vraiment au ras des clavicules) ? Le slider dans le studio permettra de toute façon de l'ajuster en live.