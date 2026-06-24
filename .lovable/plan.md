
# Plan — Audit NB2 vs Pro sur Léa, 4 tests isolés (v2)

## Garantie d'isolation
4 tests partant strictement de la même image source baseline. Cycle par test : snapshot → mutation → exécution pipeline réel → capture résultat → restauration.

## Edge function `audit-model-compare` (jetable, conservée jusqu'à validation)
`supabase/functions/audit-model-compare/index.ts`, service-role, hors UI. **Non supprimée à la fin de l'audit** — conservée jusqu'à ta validation explicite du rapport. Listée dans la section finale du livrable comme « fonction temporaire encore présente, en attente de ton OK pour suppression ».

Entrée :
```json
{
  "beneficiary_id": "de8c19bc-8643-4af8-8bc0-31a57f79cd61",
  "model_override": "google/gemini-3.1-flash-image-preview" | "google/gemini-3-pro-image",
  "target_attribute": { "key": "avatar_body_type", "before": "average", "after": "heavy" }
}
```

Séquence par appel :
1. **SNAPSHOT** Léa : tous champs `avatar_*` sensibles + le trait cible + liste des IDs `avatar_versions` existants au moment T0 (pour pouvoir identifier ensuite les lignes créées par le test).
2. **HASH SOURCE** : sha256 de `avatar_source_url`, vérifié == baseline. Loggé.
3. **MUTATION CIBLÉE** : UPDATE Léa positionnant uniquement le trait cible à `after`.
4. **APPEL PIPELINE RÉEL** `generate-avatar` (HTTP service-role) : `mode: "edit_hd"`, `changedKeys`, `requestedDiff`, `model_override`. Attente complétion réelle (poll, timeout 120 s).
5. **CAPTURE RÉSULTAT** : relit Léa + nouvelles lignes `avatar_versions` (IDs absents du snapshot T0), récupère leurs `image_url`, `prompt`, `qa_report`, `qa_score`, `model_used`. Hash de l'image générée. Tout est stocké dans la réponse JSON.
6. **NETTOYAGE DES VERSIONS DE TEST** (point ajouté) :
   - DELETE des lignes `avatar_versions` créées par ce test (IDs identifiés à l'étape 5).
   - Suppression des fichiers correspondants du bucket `avatars/`, OU déplacement vers `avatars/audit/<beneficiary_id>/<timestamp>-<model>.png` si l'API storage le permet sans re-upload. Préférence : **suppression** puisque le rapport conserve déjà URL+hash+capture.
   - Si la suppression échoue (race, permission), fallback : déplacement dans dossier `audit/` et note explicite dans le rapport.
7. **RESTAURATION** : UPDATE Léa avec snapshot complet de l'étape 1. Re-lecture + diff vs snapshot, abort de la suite si écart.

## Pollution du panneau Versions
Schéma `avatar_versions` (9 colonnes) → pas de champ `kind`/`tag` natif pour marquer « audit ». Donc on choisit l'**option préférée** : **DELETE** des lignes de test après capture dans le rapport. Le rapport garde toutes les preuves (URL signée snapshot avant suppression, hash, prompt, scores, image téléchargée et archivée localement si nécessaire).

→ Conséquence : aucun ajout durable dans le panneau Versions de Léa.

## Capture des preuves dans le rapport (avant suppression)
Pour chaque T1-T4, **avant** le DELETE de l'étape 6, on stocke dans `.lovable/audit-models.md` :
- URL publique de l'image de test (utile uniquement le temps de la review humaine, elle sera morte après cleanup)
- hash sha256 de l'image
- prompt complet
- qa_report JSON intégral
- scores `identity_preservation`, `bust_completeness`, QA global
- modèle réellement appelé, durée ms

Optionnellement : téléchargement des 4 images dans `.lovable/audit-assets/T{1..4}.png` pour archivage local persistant après cleanup bucket. À confirmer si tu veux ce miroir local — sinon on garde uniquement les hashes + scores + prompts.

## Exécution

Baseline : hash sha256 de l'`avatar_source_url` actuel de Léa, calculé une fois avant T1, référence partagée.

| # | model_override | target_attribute |
|---|---|---|
| T1 | NB2 `google/gemini-3.1-flash-image-preview` | `{avatar_body_type, average→heavy}` |
| T2 | Pro `google/gemini-3-pro-image` | `{avatar_body_type, average→heavy}` |
| T3 | NB2 | `{avatar_hair_type, curly→coily}` |
| T4 | Pro | `{avatar_hair_type, curly→coily}` |

Entre chaque test : relecture Léa + diff vs snapshot baseline initial + re-hash `avatar_source_url`. Abort si écart.

## Livrable `.lovable/audit-models.md` (réécrit)
1. Protocole + ID Léa + URL baseline + **hash sha256 baseline**.
2. Tableau d'isolation : hash source observé avant chaque test == baseline ; état DB restauré OK/écarts ; lignes `avatar_versions` supprimées (IDs) ; fichiers bucket supprimés (chemins).
3. 4 fiches de test : modèle réellement appelé, mode, image source (URL+hash), diff, classification, prompt final, image générée (URL+hash, valide jusqu'au cleanup), scores QA, durée, commentaire visuel structuré.
4. Tableau comparatif (critères × T1..T4).
5. **État final de Léa** : diff champ par champ vs snapshot initial. Doit être vide.
6. **Confirmation panneau Versions non pollué** : SELECT final des IDs `avatar_versions` de Léa == liste T0.
7. **Liste des éléments temporaires encore présents** :
   - edge function `audit-model-compare` (en attente de ton OK pour suppression)
   - éventuels fichiers `.lovable/audit-assets/T*.png` si archivage local activé
8. Recommandation finale parmi : NB2 partout / Pro uniquement Portrait HD / Pro uniquement éditions sensibles / Pro pour final + éditions sensibles. Critères ordonnés : identité → fidélité transformation → différenciation valeurs → style → cadrage/buste.

## Suppression différée
Après ta lecture et ta validation du rapport, je proposerai dans un message séparé la suppression de :
- l'edge function `audit-model-compare`
- les éventuels assets locaux d'archivage

Aucune suppression de la fonction tant que tu n'as pas validé.

## Hors-périmètre (rappel)
Pas de toggle UI, pas de modif modèle par défaut, pas de correctif label « Portrait HD — Nano Banana Pro », pas de P1 grammaire, pas de modif prompts ni Avatar Studio.

## Question avant exécution
Veux-tu que les 4 images générées soient archivées localement dans `.lovable/audit-assets/` (PNG, ~quelques Mo) pour rester visualisables après cleanup bucket ? Sinon le rapport ne gardera que hashes + scores + prompts (les URLs bucket seront mortes après l'audit).
