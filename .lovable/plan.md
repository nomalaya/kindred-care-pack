
# Plan — Audit comparatif NB2 vs Nano Banana Pro (Léa, 4 tests réels)

## Contexte validé
- `model_override` est déjà branché dans l'edge function `generate-avatar` (allow-list 4 modèles, body param, pas d'env, pas d'UI).
- Aucun changement de modèle par défaut, aucun toggle UI, aucune modif de prompt ou d'Avatar Studio dans ce passage.
- Le précédent fichier `.lovable/audit-models.md` sera **réécrit** par la nouvelle session de test (les chiffres précédents étaient produits avant que tu valides le protocole strict — on repart d'une exécution propre traçable).

## Bénéficiaire et baseline
- Léa `de8c19bc-8643-4af8-8bc0-31a57f79cd61` — femme 25-35, peau claire, visage cœur, cheveux courts curly, corpulence moyenne.
- Image source unique pour les 4 tests : la version `final` actuelle de Léa (snapshot avant audit, hash loggé dans le rapport).

## Les 4 tests (exécutés via `supabase--curl_edge_functions` sur `/generate-avatar`)

| # | Modèle | Mode | Attribut | Avant → Après |
|---|---|---|---|---|
| T1 | `google/gemini-3.1-flash-image-preview` (NB2) | `edit_hd` | body_type | average → heavy |
| T2 | `google/gemini-3-pro-image` (Pro) | `edit_hd` | body_type | average → heavy |
| T3 | `google/gemini-3.1-flash-image-preview` (NB2) | `edit_hd` | hair_type | curly → coily |
| T4 | `google/gemini-3-pro-image` (Pro) | `edit_hd` | hair_type | curly → coily |

Tous les tests utilisent **le vrai pipeline** `generate-avatar` (diff → classification → prompt → image → QA → clean si nécessaire). Aucun shortcut, aucun appel direct au gateway.

## Données capturées par test
Pour chaque T1-T4, le rapport consignera :
- modèle réellement appelé (résolu côté serveur, pas seulement demandé)
- mode pipeline (`edit_hd`)
- image source (URL + hash)
- diff détecté (attribut + ancienne/nouvelle valeur)
- classification (sensitive / cosmetic)
- prompt final envoyé au modèle (texte complet)
- image générée (URL stockage `avatars/`)
- score `identity_preservation`
- score `bust_completeness`
- score QA global
- temps total de génération (ms)
- coût estimé si exposé par le gateway, sinon « n/a »
- commentaire visuel structuré : même personne ? transformation fidèle ? attribut clairement visible ? style conservé ? cadrage conservé ?

## Livrable
Réécriture complète de `.lovable/audit-models.md` avec :
1. Rappel du protocole + baseline Léa
2. 4 fiches de test (une par T1-T4) avec toutes les données ci-dessus
3. Tableau comparatif synthétique (lignes = critères, colonnes = NB2 corpulence / Pro corpulence / NB2 cheveux / Pro cheveux)
4. Reco finale choisie parmi exactement les 4 options demandées :
   - garder NB2 partout
   - Pro seulement pour Portrait HD (final)
   - Pro seulement pour éditions sensibles
   - Pro pour final + éditions sensibles

Critère de décision (dans cet ordre) : identité préservée → fidélité de la transformation → différenciation visible des valeurs → style conservé → cadrage / buste complet. La beauté brute n'est pas décisive.

## Hors-périmètre (explicite)
- Pas de toggle UI.
- Pas de modification du modèle par défaut.
- Pas de correctif label « Portrait HD — Nano Banana Pro » (noté pour suite, pas exécuté ici).
- Pas de correctifs P1 de la grammaire visuelle.
- Pas de modification des prompts ni de l'Avatar Studio.

## Détails techniques
- Appel : `POST /generate-avatar` avec body `{ beneficiary_id, mode: "edit_hd", target_attribute: {...}, model_override: "<id>" }`.
- L'override est validé contre la `MODEL_ALLOWLIST` côté serveur ; toute valeur hors liste est ignorée silencieusement et le rapport le notera.
- Les 4 appels sont séquentiels (pas de parallélisme, pour mesurer la latence proprement).
- Si un test échoue (rollback QA, erreur 5xx, ou modèle Pro indisponible sur le gateway), la fiche le documente comme résultat à part entière, sans réessai masqué.
