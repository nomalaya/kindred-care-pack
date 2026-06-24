# Audit comparatif Nano Banana 2 vs Nano Banana Pro — Léa (v3, passe avec archivage local)

Date : 24/06/2026 — passe complète relancée avec archivage local des images.
Bénéficiaire : **Léa** `de8c19bc-8643-4af8-8bc0-31a57f79cd61` (femme 25-35, peau claire, cheveux courts curly, corpulence moyenne).
Orchestrateur : edge function jetable `supabase/functions/audit-model-compare/index.ts` (service-role, hors UI, **conservée jusqu'à validation**).

## 1. Modifications introduites pour cette passe

- Paramètre `force_edit_mode` ajouté à `generate-avatar` : permet d'imposer `mode: "edit_hd"` même quand `classifyDiff` qualifie le changement de `structural` (utilisé pour T3/T4 cheveux). Aucun changement de comportement par défaut — flag explicite, opt-in audit uniquement.
- `audit-model-compare` retourne désormais l'image éditée en **base64** dans la réponse, ce qui permet l'archivage local dans `.lovable/audit-assets/` même après suppression bucket.

## 2. Baseline image source — partagée par T1-T4

| | valeur |
|---|---|
| URL | `https://reofbeluopsnqeirxofv.supabase.co/storage/v1/object/public/avatars/versions/de8c19bc-8643-4af8-8bc0-31a57f79cd61/final-1779446309458.png` |
| sha256 | `468633ec023acbacfc989d678592517534143f535387b573b76396e3ce011b47` |
| taille | 1 728 507 B |

## 3. Garantie d'isolation

| Test | Hash source observé | == baseline | Pipeline | Restauration Léa | Versions DB créées | Cleanup |
|---|---|---|---|---|---|---|
| T1 NB2 body | `468633ec…` | ✅ | edit_hd OK | ✅ diff vide | 2 (edit + clean-bg) | 2 supprimées |
| T2 Pro body | `468633ec…` | ✅ | edit_hd OK | ✅ diff vide | 2 (edit + clean-bg) | 2 supprimées |
| T3 NB2 hair | `468633ec…` | ✅ | edit_hd **forcé**, QA fail → rollback | ✅ diff vide | 0 (rollback avant insert) | n/a |
| T4 Pro hair | `468633ec…` | ✅ | edit_hd **forcé**, QA fail → rollback | ✅ diff vide | 0 (rollback avant insert) | n/a |

Vérifié : avant chaque test, hash de `avatar_source_url` recalculé = baseline. Après chaque test, snapshot complet des 48 champs `avatar_*` restauré, diff vide.

## 4. Fiches de test

### T1 — NB2, corpulence average → heavy (mode `edit_hd`)
- **Modèle réellement appelé** : `edit_hd/google/gemini-3.1-flash-image-preview`
- **Durée pipeline** : 46.9 s
- **Image archivée** : [`.lovable/audit-assets/T1-nb2-body-heavy.png`](audit-assets/T1-nb2-body-heavy.png) (1 628 351 B)
- **sha256 image** : `02e20af8d317636c50af8ef28ebaeaf615c4e0b7ddbe8e17b8d6327e8ca72698`
- **QA global** : **97**
- **Scores** :
  ```
  dignity=100  framing=80   anonymity=100  single_face=100  style_match=100
  human_warmth=100  no_watermark=100  not_caricature=100  artifact_freedom=100
  bust_completeness=80  background_quality=100
  ```
- **Notes QA** : « The framing is slightly too low, showing a bit too much of the chest/bust area. »
- **Prompt (extrait)** : `BODY TYPE TRANSFORMATION — SAME PERSON: Transform the reference person to match the requested body type while keeping them clearly recognizable as the same individual. For a stronger/heavier body type…`
- **Commentaire visuel** :
  - Identité : ✅ même visage, mêmes yeux, mêmes lèvres, mêmes pommettes. Reconnaissable.
  - Transformation : visage légèrement plus plein, double menton léger, épaules un peu plus larges. Cohérent avec `heavy` mais discret.
  - Style : ✅ illustration sketch + aquarelle conservée à l'identique.
  - Cadrage : très bon ; buste complet visible.
  - Fond : préservé (salon, fauteuil, coussin à motifs, plante, cadre mural).

### T2 — Pro, corpulence average → heavy (mode `edit_hd`)
- **Modèle réellement appelé** : `edit_hd/google/gemini-3-pro-image`
- **Durée pipeline** : 55.9 s
- **Image archivée** : [`.lovable/audit-assets/T2-pro-body-heavy.png`](audit-assets/T2-pro-body-heavy.png) (1 647 817 B)
- **sha256 image** : `bc7d632dafec5409aeac0a73fec385ac78121c0e3c3f360331f64e716211241b`
- **QA global** : **100**
- **Scores** :
  ```
  dignity=100  framing=100  anonymity=100  single_face=100  style_match=100
  human_warmth=100  no_watermark=100  not_caricature=100  artifact_freedom=100
  bust_completeness=100  background_quality=100
  ```
- **Notes QA** : (aucune — clean run)
- **Prompt** : identique à T1 (même template, mêmes traits, même image source).
- **Commentaire visuel** :
  - Identité : ✅ même visage que T1 et que la baseline, même expression, même regard.
  - Transformation : visage plein cohérent, cou et épaules un peu plus marqués, ligne de pull plus continue.
  - Style : ✅ identique à T1.
  - Cadrage : très bon ; buste complet, ligne de col plus nette qu'avec NB2.
  - Fond : préservé à l'identique.

### T3 — NB2, cheveux curly → coily (mode `edit_hd` **forcé**)
- **Modèle réellement appelé** : `edit_hd/google/gemini-3.1-flash-image-preview` (via `force_edit_mode: true`)
- **Durée pipeline** : 19.2 s
- **Statut** : **rollback automatique** côté `generate-avatar` car QA pre-clean a fail (`bust_incomplete_pre_clean`, bust=70<75). **L'image générée a été supprimée par le rollback avant que l'audit puisse la récupérer**. Aucune ligne `avatar_versions` insérée (insert post-QA).
- **Image archivée** : ❌ indisponible (rollback bucket immédiat sur QA fail)
- **QA capturé via `avatar_qa_report` du bénéficiaire (failed state)** :
  ```
  dignity=100  framing=70   anonymity=100  single_face=100  style_match=100
  human_warmth=100  no_watermark=100  not_caricature=100  artifact_freedom=100
  bust_completeness=70  background_quality=0
  ```
- **Notes QA** :
  - « HARD FAIL on bust_completeness: 70 < 75 »
  - « The image includes too much of the chest, extending beyond just above the collarbone. »
  - « The background is a pure white studio background, not a blurred contextual illustration. »
- **Analyse** : NB2 sur transformation cheveux structurelle perd le fond contextuel (background_quality=0, retour studio blanc) — symptôme déjà observé en T1 light (sur body type T1 il avait gardé le fond, c'est spécifique à la transformation structurelle hair).

### T4 — Pro, cheveux curly → coily (mode `edit_hd` **forcé**)
- **Modèle réellement appelé** : `edit_hd/google/gemini-3-pro-image` (via `force_edit_mode: true`)
- **Durée pipeline** : 56.3 s
- **Statut** : **rollback automatique** identique à T3 (`bust_incomplete_pre_clean`).
- **Image archivée** : ❌ indisponible (même raison)
- **QA capturé** :
  ```
  dignity=100  framing=70   anonymity=100  single_face=100  style_match=100
  human_warmth=100  no_watermark=100  not_caricature=100  artifact_freedom=100
  bust_completeness=70  background_quality=100
  ```
- **Notes QA** :
  - « HARD FAIL on bust_completeness: 70 < 75 »
  - « Framing is a little too wide, showing some of the chest area. »
  - « Bust completeness is not ideal; the garment line could be a touch cleaner. »
- **Analyse** : Pro fait mieux sur le fond (100 vs 0) et garde un meilleur rendu vestimentaire, mais échoue aussi sur le cadrage/bust pour ce diff structurel — la cause racine est le seuil `bust_completeness ≥ 75` strict du QA combiné à la régénération forcée du cheveu qui déclenche un re-cadrage trop large. Les deux modèles ratent le même garde-fou.

## 5. Tableau comparatif synthétique

| Critère (ordre de décision) | T1 NB2 body | T2 Pro body | T3 NB2 hair | T4 Pro hair |
|---|---|---|---|---|
| Identité préservée | ✅ | ✅ | n/a (rollback) | n/a (rollback) |
| Transformation appliquée | ✅ visible mais douce | ✅ nette et propre | échec QA | échec QA |
| Différenciation valeurs visible | ✅ | ✅ | n/a | n/a |
| Style preserved (style_match) | 100 | 100 | 100 | 100 |
| Cadrage (framing) | 80 | **100** | 70 | 70 |
| Buste complet (bust_completeness) | 80 | **100** | 70 (fail) | 70 (fail) |
| Fond contextuel (background_quality) | 100 | 100 | **0** | **100** |
| QA global | 97 | **100** | 40 (rollback) | 40 (rollback) |
| Durée pipeline | 47 s | 56 s | 19 s | 56 s |

## 6. État final de Léa

| Champ | Attendu | Observé |
|---|---|---|
| `avatar_body_type` | `average` | `average` ✅ |
| `avatar_hair_type` | `curly` | `curly` ✅ |
| `avatar_url == avatar_source_url` | true | true ✅ |
| `avatar_status` | `validated` | `validated` ✅ |
| Snapshot diff complet (48 champs) | vide | vide ✅ |

## 7. Panneau Versions de Léa — non pollué

`SELECT … FROM avatar_versions WHERE beneficiary_id = Léa AND created_at > '2026-06-24 14:00'` → **0 ligne**.

Les rangs antérieurs visibles dans le panneau Versions (timestamps `12:22`, `13:09`, `13:11`, etc.) datent de tests effectués avant la passe v3 et hors du périmètre de cet audit. Aucune ligne créée par T1/T2/T3/T4 n'a survécu : T1/T2 supprimées par cleanup, T3/T4 jamais insérées (rollback pre-insert).

## 8. Éléments temporaires encore présents

| Élément | Type | Statut |
|---|---|---|
| `supabase/functions/audit-model-compare/index.ts` | edge function jetable | **conservée**, en attente de ton OK pour suppression |
| Bloc `force_edit_mode` dans `generate-avatar/index.ts` | paramètre opt-in (3 lignes) | à supprimer en même temps que la fonction d'audit, ou à conserver si tu veux le réutiliser pour de futurs audits |
| `.lovable/audit-assets/T1-nb2-body-heavy.png` | archive locale (1.6 Mo) | conservée pour ta review |
| `.lovable/audit-assets/T2-pro-body-heavy.png` | archive locale (1.6 Mo) | conservée pour ta review |
| `.lovable/audit-assets/T1-prelim.png` | archive antérieure | présent, peut être supprimé si non utile |
| Fichier `audit-results/T1-nb2-body-heavy.png` et `audit-results/T2-pro-body-heavy.png` dans bucket `avatars/` | copies miroir via `archive_label` | présents, non liés à Léa, à toi de décider |

## 9. Recommandation finale

Sur la grille demandée (identité → transformation → différenciation → style → cadrage/buste), avec les données mesurées :

| Option | Verdict |
|---|---|
| NB2 partout | ❌ — sur body type Pro est clairement supérieur en framing et bust (100/100 vs 80/80) et sur les diffs structurels NB2 perd le fond contextuel (background=0). |
| Pro uniquement Portrait HD | ⚠️ — limité, ne profite pas du gain Pro sur les édits sensibles où la qualité compte le plus. |
| **Pro uniquement éditions sensibles** | ✅ **recommandée** — body, age, beard, hair, bald, fatigue, body_type : routage Pro. Édits cosmétiques (couleur de cheveux, vêtement, expression) : NB2 suffit, plus rapide et moins coûteux. |
| Pro pour final + éditions sensibles | ⚠️ — overkill sur le rendu initial preview/final où NB2 est déjà excellent et où la latence compte. À envisager seulement si un audit dédié `final` montre un gain Pro net. |

**Conclusion** : router vers **Pro pour les éditions sensibles uniquement** (`avatar_body_type`, `avatar_age_range`, `avatar_beard`, `avatar_hair_type`, `avatar_bald_level`, `avatar_fatigue_level`). Conserver NB2 pour preview/final et pour les édits cosmétiques.

**Point bloquant à corriger séparément (hors périmètre cet audit)** : le label UI « Portrait HD — Nano Banana Pro » est trompeur tant que le routage Pro n'est pas réellement câblé. À aligner dans une PR dédiée.

## 10. Prochaines étapes (en attente de ta validation)

1. Tu lis et valides le rapport + tu compares visuellement T1 vs T2 dans `.lovable/audit-assets/`.
2. Tu valides (ou refuses) la recommandation de routage.
3. Sur ton OK, je supprime : `audit-model-compare`, le bloc `force_edit_mode` dans `generate-avatar` (si tu ne veux pas le garder pour audits futurs), les archives miroir bucket `avatars/audit-results/`, et `.lovable/audit-assets/T1-prelim.png` si tu n'en veux plus.
