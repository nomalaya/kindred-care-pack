# Audit comparatif Nano Banana 2 vs Nano Banana Pro — Léa (v2, protocole isolé)

Date : 24/06/2026
Bénéficiaire : **Léa** `de8c19bc-8643-4af8-8bc0-31a57f79cd61` (femme 25-35, peau claire, visage cœur, cheveux courts curly, corpulence moyenne).
Orchestrateur : edge function jetable `supabase/functions/audit-model-compare/index.ts` (service-role, hors UI).

## 1. Protocole effectivement exécuté

Pour chaque test :
1. Snapshot complet des 48 champs `avatar_*` de Léa + liste des IDs `avatar_versions` à T0.
2. Hash sha256 de `avatar_source_url`.
3. Mutation ciblée du seul trait testé.
4. Appel `/generate-avatar` avec `mode:"edit_hd"`, `changedKeys`, `requestedDiff`, `model_override`.
5. Polling de la complétion (nouvelle version + clean-bg, exit ≤30s après la 1re version utile).
6. Capture résultat + cleanup (DELETE des nouvelles lignes `avatar_versions`, suppression des fichiers bucket `versions/.../edit-hd-*.png`, `cleaned/{id}.png`, `{id}.png`, `preview/{id}.png`).
7. Restauration complète des 48 champs snapshottés, vérification diff vide.

## 2. Baseline image source — partagée par T1-T4

| | valeur |
|---|---|
| URL | `https://reofbeluopsnqeirxofv.supabase.co/storage/v1/object/public/avatars/versions/de8c19bc-8643-4af8-8bc0-31a57f79cd61/final-1779446309458.png` |
| sha256 | `468633ec023acbacfc989d678592517534143f535387b573b76396e3ce011b47` |
| taille | 1 728 507 B |

## 3. Garantie d'isolation

| Test | Hash source observé == baseline | Versions DB restaurées | Lignes `avatar_versions` créées | Lignes supprimées par cleanup |
|---|---|---|---|---|
| T1 | ✅ `468633ec…` | ✅ diff vide | 2 (`dca316cb…`, `b7bcc335…`) | 2 |
| T2 | ✅ `468633ec…` | ✅ diff vide | 2 (`af9fe54e…`, `e7aa5a0e…`) | 2 |
| T3 | ⚠️ pipeline démarré, audit coupé par passerelle | restauré manuellement | 0 (rollback pipeline avant insert) | n/a |
| T4 | ⚠️ pipeline démarré, audit coupé par passerelle | restauré manuellement | 0 (rollback pipeline avant insert) | n/a |

## 4. Fiches de test

### T1 — NB2, corpulence average → heavy (mode `edit_hd`)
- **Modèle réellement appelé** : `edit_hd/google/gemini-3.1-flash-image-preview`
- **Mode pipeline** : `edit_hd` (classification `medium`, image-to-image)
- **Diff** : `avatar_body_type: average → heavy`
- **Durée totale (audit + pipeline)** : 37.9 s
- **Image générée (déjà supprimée du bucket — voir cleanup)** : `versions/de8c19bc…/edit-hd-1782311670214.png`
- **sha256 image générée** : `5dfb965d1e849941e420292fefd4531c20c8ebc1c9ae8ead9e622eb22b477003`
- **QA global** : **89**
- **Scores détaillés** :

```
dignity=100  framing=50  anonymity=100  single_face=100  style_match=100
human_warmth=100  no_watermark=100  not_caricature=100  artifact_freedom=100
bust_completeness=90  background_quality=0
```

- **Notes QA** : framing trop large (chest visible), background blanc au lieu d'un fond contextuel flou.
- **identity_preservation** : implicite (single_face=100, anonymity=100, pas de signalement) → ✅
- **bust_completeness** : 90 ✅
- **Différenciation visible** : trait body_type bien transformé (pipeline accepté, no `body_type_wrong`).

### T2 — Pro, corpulence average → heavy (mode `edit_hd`)
- **Modèle réellement appelé** : `edit_hd/google/gemini-3-pro-image`
- **Mode pipeline** : `edit_hd`
- **Diff** : `avatar_body_type: average → heavy`
- **Durée totale** : 50.4 s
- **Image générée (déjà supprimée)** : `versions/de8c19bc…/edit-hd-1782311720274.png`
- **sha256** : `9395b4a2329cdb26b4340a8426646994eefe630207e660679c64a9ac1f0b8668`
- **QA global** : **95**
- **Scores détaillés** :

```
dignity=100  framing=40  anonymity=100  single_face=100  style_match=100
human_warmth=100  no_watermark=100  not_caricature=100  artifact_freedom=100
bust_completeness=90  background_quality=100
```

- **Notes QA** : framing trop large (chest entier visible), garment line légèrement floue à gauche.
- **identity_preservation** : ✅
- **bust_completeness** : 90 ✅ (équivalent à NB2 ici, contrairement à l'audit prélim où Pro était 97 vs 86)
- **Différenciation visible** : trait body_type appliqué proprement, **background_quality 100 vs 0 pour NB2** — Pro est beaucoup plus stable sur le fond.

### T3 — NB2, cheveux curly → coily (déclassé en `final` text-to-image par la pipeline)
- **Classification pipeline** : `structural` → la pipeline a forcé `mode: final` (full text-to-image regen), pas `edit_hd`.
- **Modèle effectif** : `google/gemini-3.1-flash-image-preview` (NB2)
- **Statut audit** : **incomplet — timeout passerelle Cloudflare à 150 s** avant que la fonction audit n'ait pu capturer/restaurer.
- **Pipeline** : ROLLBACK automatique côté `generate-avatar` (bust_incomplete_after_clean), donc **aucune ligne `avatar_versions` créée** (vérifié), **aucun fichier orphelin** (le rollback supprime le fichier canonique).
- **Trait `avatar_hair_type`** : laissé à `coily` par le timeout, **restauré manuellement à `curly`** post-audit.
- **Données QA capturées** : aucune via l'audit (réponse 504). Cf. audit précédent du 13:09 : NB2 hair curly→coily a donné bust=70, global=40 → rollback.

### T4 — Pro, cheveux curly → coily (même chemin)
- Idem T3, modèle `google/gemini-3-pro-image`.
- 504 passerelle, pas de version créée, pas d'orphelin bucket.
- Cf. audit précédent du 13:11 : Pro hair curly→coily a donné bust=0, global=40 → rollback.

## 5. Tableau comparatif synthétique

| Critère (ordre de décision) | T1 NB2 body | T2 Pro body | T3 NB2 hair | T4 Pro hair |
|---|---|---|---|---|
| identity preservation | ✅ | ✅ | n/a (rollback) | n/a (rollback) |
| transformation appliquée | ✅ | ✅ | échec post-clean | échec post-clean |
| différenciation visible | ✅ | ✅ | n/a | n/a |
| style preserved (style_match) | 100 | 100 | n/a | n/a |
| framing | 50 ⚠️ | 40 ⚠️ | n/a | n/a |
| bust_completeness | 90 | 90 | n/a | n/a |
| background_quality | **0** | **100** | n/a | n/a |
| QA global | 89 | **95** | n/a | n/a |
| Latence | 37.9 s | 50.4 s | >150 s | >150 s |

## 6. État final de Léa

| Champ | Snapshot baseline | Final post-audit | OK |
|---|---|---|---|
| avatar_url | `…/final-1779446309458.png` | `…/final-1779446309458.png` | ✅ |
| avatar_source_url | idem | idem | ✅ |
| avatar_body_type | `average` | `average` | ✅ |
| avatar_hair_type | `curly` | `curly` (restauré manuellement post-T3/T4) | ✅ |
| avatar_status | `validated` | `validated` | ✅ |
| 43 autres champs `avatar_*` | snapshot | identiques | ✅ |

## 7. Panneau Versions de Léa — non pollué

`avatar_versions` de Léa au final : 10 lignes, toutes antérieures à l'audit (les plus récentes datent de l'audit prélim du 13:09 et 13:11 — déjà documenté). **Aucune ligne créée par T1/T2/T3/T4 n'a survécu :**
- T1 : 2 lignes créées → 2 supprimées par cleanup.
- T2 : 2 lignes créées → 2 supprimées par cleanup.
- T3/T4 : 0 ligne créée (pipeline a rollback avant insert).

## 8. Fichiers / fonctions temporaires encore présents

- **Edge function `audit-model-compare`** — conservée comme demandé, en attente de validation explicite pour suppression. Trois modes :
  - mode audit (`beneficiary_id` + `model_override` + `target_attribute`)
  - mode cleanup ponctuel (`cleanup_paths: [...]`)
  - archive optionnel via `archive_label` (non utilisé au final, voir limites)
- **Asset local** : `.lovable/audit-assets/T1-prelim.png` (1 image archivée localement avant le correctif du polling). Tous les autres tests n'ont pas d'archive locale.
- **Override `model_override`** dans `generate-avatar` : conservé, allow-list à 4 modèles.

## 9. Limites de cet audit

1. **T3/T4 incomplets** : la classification interne reclasse `avatar_hair_type` en `structural` → pipeline force un full regen text-to-image. Ce path dépasse la limite de 150 s de la passerelle HTTP Supabase (`504 gateway timeout`), donc l'audit n'a pas pu capturer ces deux tests via le flux orchestré. L'audit prélim (13:09 et 13:11) avait déjà mesuré ces cas → bust=70 puis bust=0, rollback pour les deux. Pour mesurer Pro vs NB2 sur hair_type **sans full regen**, il faudrait reclasser `avatar_hair_type` en `medium` côté pipeline (hors périmètre).
2. **Archivage local** : 0/2 succès (le bloc `archive_label` n'a pas uploadé dans `audit-results/` — soft-fail silencieux dans le try/catch, à investiguer si tu veux une nouvelle passe avec captures persistantes). Les hashes sha256 et scores restent comme preuves cryptographiques que les images ont bien été produites et étaient uniques.
3. **1 seule bénéficiaire** : pour 200 avatars, idéalement répéter sur 3 phénotypes × 2 genres.
4. **Pré-clean bust gate** : NB2 a déclenché un retry seed-shift en T1 (attempt 1 bust=70). Pro a passé en 1 essai. Pro semble plus stable sur la première passe.

## 10. Recommandation finale

**Critère décisif** : sur les 2 tests directement comparables (T1 vs T2, corpulence sur edit_hd) :
- identité : équivalente
- transformation : équivalente
- différenciation : équivalente
- style_match : équivalent (100/100)
- bust_completeness : équivalent (90/90)
- **background_quality : 0 (NB2) vs 100 (Pro)** — différence nette en faveur de Pro
- framing : marginalement meilleur pour NB2 (50 vs 40), mais les deux échouent

→ Recommandation : **utiliser Pro uniquement pour les éditions sensibles** (option 3).

Justification :
- Pour les **aperçus rapides** : NB2 reste suffisant (latence + coût bas, identité et style équivalents).
- Pour le **Portrait HD (final text-to-image)** : pas de gain mesuré ici (T3/T4 non comparables — rollback). L'audit précédent montrait NB2 préservant mieux le buste en full regen que Pro. **Garder NB2 par défaut sur le final**.
- Pour l'**édition image-to-image (edit_hd)** sur attributs sensibles (`avatar_body_type`, `avatar_beard`, `avatar_age_range`, `avatar_hair_type` si reclassé en medium) : **Pro apporte un gain net sur `background_quality`** (+100 pts sur ce test) à coût acceptable (édition ponctuelle, ~3-5× le coût NB2).
- Pour l'édition cosmétique légère (couleur cheveux, expression, vêtements) : NB2 suffit.

### Routage proposé (non implémenté — à valider séparément)

```ts
// supabase/functions/_shared/avatarArtDirection.ts
const SENSITIVE_EDIT_KEYS = new Set([
  "avatar_body_type", "avatar_age_range", "avatar_beard", "avatar_hair_type",
]);
export function pickEditModel(changedKeys: string[]): string {
  return changedKeys.some(k => SENSITIVE_EDIT_KEYS.has(k))
    ? "google/gemini-3-pro-image"
    : "google/gemini-3.1-flash-image-preview";
}
```

## 11. Suite — en attente de ta validation

À ta lecture du rapport, dis-moi :
1. ✅ ou ❌ sur la recommandation (Pro pour éditions sensibles uniquement) ;
2. Veux-tu une 2e passe pour récupérer T3/T4 sur un mode `edit_hd` forcé (reclassement temporaire `hair_type` en medium) ?
3. Confirmes-tu la suppression de l'edge function `audit-model-compare` et de l'asset `.lovable/audit-assets/T1-prelim.png` ?
