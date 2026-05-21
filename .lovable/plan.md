
# Moteur de portraits bénéficiaires v2

Refonte du système d'avatars pour produire des portraits humains, dignes, différenciants et émotionnellement crédibles, avec garde-fous éthiques souples et QA scoring. Aucun changement au moteur de matching ni à la logique métier.

## 1. Schéma base de données (migration)

Ajouter sur `beneficiaries` :

**Visage** — `avatar_face_shape`, `avatar_eye_shape`, `avatar_eye_color`, `avatar_facial_features` text[]

**Cheveux** — `avatar_hair_color`, `avatar_hair_length`, `avatar_hair_volume`, `avatar_hair_style`

**Vêtement** — `avatar_clothing_style`, `avatar_clothing_color_palette`

**Émotion / posture** — `avatar_expression`, `avatar_posture`, `avatar_parent_energy`, `avatar_cultural_style`

**Workflow / cache / QA**
- `avatar_preview_url` text
- `avatar_status` text ('pending' | 'preview' | 'validated' | 'failed') default 'pending'
- `avatar_prompt` text
- `avatar_seed` integer — graine déterministe pour variabilité contrôlée
- `avatar_generated_at` timestamptz
- `avatar_model_used` text
- `avatar_qa_report` jsonb — scoring détaillé
- `avatar_qa_score` numeric — score global 0-100

Colonnes existantes conservées. `avatar_url` reste le portrait final HD validé. Vue `beneficiaries_public` étendue pour exposer `avatar_preview_url` et `avatar_status`.

## 2. Moteur d'inférence (`src/lib/avatarTraits.ts` + miroir Deno)

Fonction pure `inferAvatarTraits(beneficiary)` qui dérive les attributs visuels depuis les données métier, **probabilistiquement** via la graine `avatar_seed`.

### Garde-fou culturel — influence probabiliste légère

`culture_tags` ne **déterminent jamais** un trait physique de façon stricte, mais **biaisent légèrement** les distributions de tirage :

- Skin tone, hair color, hair type, eye color : tirés sur la **diversité française globale** (distribution INSEE 2024 incluant Maghreb, Afrique subsaharienne, Europe, Asie, DOM, etc.).
- `culture_tags` ajoutent un **petit boost de probabilité** (+15 à +25 %) sur les phénotypes statistiquement plus fréquents dans la région culturelle correspondante, sans **jamais** verrouiller le tirage. Une personne avec tag « maghreb » peut parfaitement avoir des cheveux blonds ou des yeux bleus — c'est juste un peu moins probable.
- Influence plus marquée (autorisée) sur : `clothing_color_palette`, `clothing_style` (variations modestie/casual), accessoires non stéréotypés.
- Aucun marqueur visuel imposé (pas de foulard automatique, pas de tenue traditionnelle systématique).

Résultat : diversité crédible sans biais déterministe ni caricature.

### Garde-fou émotionnel — empathie réaliste

`short_story` et `emotional_sentence` ne sont **jamais injectés textuellement** dans le prompt IA. Ils servent uniquement à déduire `avatar_expression`, `avatar_posture`, `avatar_parent_energy` via mots-clés FR neutralisés vers le vocabulaire fermé.

Le vocabulaire d'expressions autorise l'**empathie réaliste**, pas seulement le sourire :
- `gentle_smile`, `hopeful`, `calm`, `discreet_smile` — registres positifs
- `tired_but_warm`, `resilient`, `serious_soft`, `thoughtful` — registres empathiques réalistes
- `pensive`, `reserved` — registres introspectifs autorisés pour situations difficiles

Ce qui reste exclu : larmes, expressions dramatiques, désespoir, regard fuyant misérabiliste, caricature de souffrance. L'objectif est la **vérité humaine**, pas le sourire commercial ni le pathos.

### Variabilité contrôlée

`avatar_seed = deterministicHash(id)` pioche dans les distributions pondérées. Deux profils similaires divergent naturellement sur tous les attributs non contraints.

## 3. Direction artistique globale (cohérence catalogue)

`supabase/functions/_shared/avatarArtDirection.ts` centralise les invariants stylistiques injectés dans **chaque** prompt :

- style : illustration semi-réaliste moderne, ONG premium
- cadrage : portrait poitrine, centré
- lumière : naturelle douce latérale (≈ fenêtre à gauche)
- température : chaude (~5200K), tons sable/ivoire/terracotta doux
- fond : texture chaude légèrement floutée, gradient sable/beige (jamais blanc passport)
- réalisme : semi-réaliste, ni photoréaliste ni cartoon
- format : carré 1:1, marges constantes
- negative prompt verrouillé : passport, LinkedIn, banque d'images, sourire publicitaire artificiel, dramatique, watermark, texte, caricature culturelle, multiples visages

Non modifiable par l'admin. Garantit un catalogue homogène premium.

## 4. Edge function `generate-avatar` (refonte)

Payload : `{ beneficiary_id, mode: 'preview' | 'final', force? }`

1. Charge le bénéficiaire, complète attributs via `inferAvatarTraits`.
2. Construit le prompt : invariants + attributs visuels (jamais `short_story` brut).
3. `mode = 'preview'` → `google/gemini-3.1-flash-image-preview` dans `avatars/preview/{id}.png`, `avatar_status = 'preview'`. Pas de QA.
4. `mode = 'final'` → `google/gemini-3-pro-image-preview` → QA scoring → publication conditionnelle.
5. Asynchrone via `EdgeRuntime.waitUntil`, réponse 202 immédiate.
6. Idempotente : skip si `validated` et `force !== true`.

## 5. QA automatique — scoring pondéré

Nouvelle edge function `qa-avatar` appelée par `generate-avatar` en mode `final`. Évaluation via `google/gemini-2.5-flash` (vision) avec sortie structurée (tool calling) :

```json
{
  "scores": {
    "single_face": 0-100,
    "framing": 0-100,
    "no_watermark": 0-100,
    "artifact_freedom": 0-100,
    "style_consistency": 0-100,
    "not_stock_photo_feel": 0-100,
    "not_caricature": 0-100,
    "dignity": 0-100,
    "human_warmth": 0-100
  },
  "global_score": 0-100,        // moyenne pondérée
  "notes": string[]
}
```

Pondérations :
- `dignity` × 1.5, `not_caricature` × 1.5, `single_face` × 1.3 (dimensions critiques)
- `artifact_freedom`, `style_consistency` × 1.2
- autres × 1.0

Seuils :
- **score ≥ 75** → publication : `avatar_url` mis à jour, `avatar_status = 'validated'`, `avatar_qa_score` stocké
- **60 ≤ score < 75** → retry automatique 1 fois avec seed décalé ; si le retry passe ≥ 75 il est publié, sinon on garde la meilleure des deux tentatives et marque `avatar_status = 'failed'` pour revue admin
- **score < 60** → rejet immédiat, `avatar_status = 'failed'`, image stockée dans `avatars/rejected/{id}-{timestamp}.png` pour audit, `avatar_url` inchangé

Dans tous les cas, `avatar_qa_report` stocke le JSON complet (scores + notes) pour traçabilité et debug.

## 6. Fallback premium (`BeneficiaryAvatar.tsx`)

Suppression du SVG visage. Nouveau fallback :
- Cercle gradient chaud (sable → terracotta doux, tokens `--primary`/`--secondary`)
- Initiale du prénom, Inter semi-bold, ivoire
- Bruit SVG subtil

Priorité : `avatar_url` → `avatar_preview_url` → fallback premium.

## 7. Workflow admin — édition unitaire

Panneau "Portrait" :
- Aperçu + badge `avatar_status` + score QA si disponible
- Détail du `avatar_qa_report` (collapsible) avec scores et notes en cas de `failed`
- Bouton **Recalculer attributs**
- Édition manuelle des attributs visuels
- Boutons **Générer preview** / **Valider & générer HD** / **Régénérer HD** (`force`, nouveau seed)
- Bouton **Forcer publication** (override admin, ignore le score QA — pour cas limites)

## 8. Backfill — outil de migration par batchs

Panneau admin "Migration portraits v2" :
- Compteur : X / 192 migrés (`avatar_model_used = 'gemini-3-pro-image-preview'`)
- Sélecteur taille batch : 10 / 20 / 50
- Filtre source : tous / non migrés / failed / score < 80
- Bouton **Lancer un batch** → `generate-avatar-batch`
- Barre de progression temps réel (polling sur `avatar_status` et `avatar_qa_score`)
- Liste des erreurs et résultats faibles avec bouton **Retry** par bénéficiaire

Edge function `generate-avatar-batch` :
- Reçoit `{ beneficiary_ids, mode: 'final' }`
- Traite séquentiellement avec délai (rate-limit Lovable AI)
- Pipeline complet par bénéficiaire : inférence → final Pro → QA scoring → publication conditionnelle
- Met à jour les statuts au fil de l'eau
- Asynchrone (`EdgeRuntime.waitUntil`), 202 immédiat
- Gestion 429 / 402 : pause exponentielle, marque `failed` avec raison si bloqué

## 9. Génération à la création d'un bénéficiaire

Le back-office déclenche `generate-avatar` mode `preview` en fire-and-forget après l'insertion. Pas de trigger DB bloquant. L'admin valide ensuite pour passer en HD + QA scoring.

## 10. Fichiers touchés

```text
supabase/migrations/<ts>_avatar_engine_v2.sql            (nouveau)
supabase/functions/_shared/avatarTraits.ts               (nouveau, miroir frontend)
supabase/functions/_shared/avatarArtDirection.ts         (nouveau, invariants prompt)
supabase/functions/generate-avatar/index.ts              (refonte)
supabase/functions/qa-avatar/index.ts                    (nouveau, scoring)
supabase/functions/generate-avatar-batch/index.ts        (nouveau)
src/lib/avatarTraits.ts                                  (nouveau)
src/components/BeneficiaryAvatar.tsx                     (refonte fallback)
src/pages/Admin.tsx                                      (panneau portrait + migration batch)
```

Aucune modification de `get_empathy_beneficiaries`, `composeBasket`, `matching_rules` ni des autres edge functions — règle d'intégrité du cœur logique respectée.
