## Objectif

Vérifier que la facturation Google est bien active sur la clé `GOOGLE_AI_API_KEY`, puis générer les avatars manquants (139 bénéficiaires) sans consommer de crédits Lovable.

## Étape 1 — Test de vérification (1 seule image)

Lancer `generate-avatar` sur un seul bénéficiaire test (Éloïse, déjà remise en `pending`).

Deux issues possibles :
- **Succès** → la facturation est active, on enchaîne sur l'étape 2. Coût de ce test : ~0,04 $ chez Google.
- **`429 RESOURCE_EXHAUSTED / free_tier_requests, limit: 0`** → la facturation n'est pas encore propagée sur la clé. Dans ce cas je vous indique précisément quoi vérifier :
  - le compte de facturation est bien rattaché **au projet Google Cloud qui possède cette clé** (et pas à un autre projet) ;
  - l'API « Generative Language » est activée sur ce même projet ;
  - la propagation peut prendre quelques minutes — on refait le test.

Aucun autre appel IA n'est fait avant que ce test passe.

## Étape 2 — Génération par vagues

- Vague pilote : 10 bénéficiaires via `generate-avatar-batch` (mode `final`, pacing 2,5 s déjà en place).
- Contrôle du résultat : nombre de succès, scores QA, échecs éventuels.
- Si la vague pilote est propre : les vagues suivantes par lots de ~25 jusqu'à couvrir les 139.
- Reprise ciblée sur les seuls échecs à la fin.

Suivi visible dans l'Avatar Studio (statut, score QA) après chaque vague.

## Détails techniques

- Aucun changement de code prévu : le routage Google direct est déjà en place dans `supabase/functions/_shared/imageProvider.ts` et utilisé par `generate-avatar` et `qa-avatar`.
- Si Google renvoie une erreur de modèle (404) sur la clé passée en payant, l'override `GOOGLE_IMAGE_MODEL` permet de pointer un autre id de modèle image sans toucher au code.
- Aucun changement de schéma, d'UI, ni de la logique de matching / panier.

## À noter

- Coût estimé côté Google : ~5–6 $ pour les 139 avatars, facturé par Google, zéro crédit Lovable pour la génération.
- Les échanges de chat pour piloter les vagues consomment, eux, des crédits Lovable.
- Le quota de requêtes/minute reste limité même en payant : les vagues sont volontairement séquencées.
