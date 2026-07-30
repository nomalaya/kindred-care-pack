## Objectif

Générer les **139 bénéficiaires sans avatar** (sur 200) sans consommer de crédits Lovable.

Aujourd'hui, `generate-avatar` et `qa-avatar` appellent la passerelle IA de Lovable (`ai.gateway.lovable.dev` + `LOVABLE_API_KEY`) : chaque image et chaque contrôle QA est facturé en crédits Lovable. La seule façon de ne pas les consommer est de router ces appels vers **votre propre clé Google AI Studio** : la facturation part alors sur votre compte Google (avec son quota gratuit), et le modèle reste de la même famille (Gemini / Nano Banana), donc le rendu et les prompts actuels restent valables.

## Ce qui sera fait

### 1. Clé et bascule de fournisseur
- Vous créez une clé sur Google AI Studio (aistudio.google.com → Get API key), je vous la demanderai ensuite via le formulaire sécurisé sous le nom `GOOGLE_AI_API_KEY`.
- Nouveau module partagé `supabase/functions/_shared/imageProvider.ts` :
  - si `GOOGLE_AI_API_KEY` est présent → appel direct à l'API Google Generative Language (`generativelanguage.googleapis.com`), **aucun crédit Lovable** ;
  - sinon → repli automatique sur la passerelle Lovable (comportement actuel, rien ne casse).
- Mapping des modèles actuels vers leurs équivalents Google directs (Nano Banana 2 / Gemini image), en conservant exactement les mêmes prompts, seeds, et le mode édition image-to-image.

### 2. Fonctions concernées
- `generate-avatar/index.ts` : `generateImage()` et `generateEditedImage()` passent par le nouveau module. Aucune modification des prompts, du cadrage, ni du pipeline QA/rollback.
- `qa-avatar/index.ts` : le scoring qualité (appel texte+image) passe aussi par la clé Google, sinon il resterait facturé en crédits.
- `generate-avatar-batch/index.ts` : inchangé côté logique, il bénéficie automatiquement de la bascule.

### 3. Génération des 139 avatars
- Lancement en vagues automatiques (par lots de ~10, séquencées) pour rester sous les limites de débit de l'API Google et éviter les échecs en cascade.
- Suivi dans l'Avatar Studio / l'onglet Portraits : statut, score QA, échecs.
- Reprise automatique proposée sur les échecs à la fin du passage.

## Détails techniques

- Endpoint direct utilisé : `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` avec `responseModalities: ["TEXT","IMAGE"]`, image renvoyée en base64 `inlineData` — même format binaire que celui déjà stocké dans le bucket `avatars`.
- Aucun changement de schéma de base, aucun changement d'UI, aucune modification de la logique de matching ou de panier.
- Le secret `GOOGLE_AI_API_KEY` reste côté serveur (fonctions edge uniquement).

## À noter

- « Zéro crédit » signifie zéro crédit **Lovable** : la génération d'images reste facturée par Google au-delà de son palier gratuit. Le quota gratuit d'AI Studio est limité en requêtes/minute et par jour — le batch de 139 sera donc étalé, et pourra devoir être repris le lendemain si le quota journalier est atteint.
- Les messages de chat que j'échange avec vous pour piloter tout ça consomment, eux, des crédits Lovable (c'est indépendant de la génération d'images).
