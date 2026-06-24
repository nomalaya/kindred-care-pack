# Audit modèles Avatar Studio — état actuel et protocole de test

Audit en lecture seule. Aucune modification proposée tant que le protocole de test n'est pas validé.

## 1. État actuel — modèles utilisés

Source unique : `supabase/functions/_shared/avatarArtDirection.ts:280-283`.

| Étape | Constante | Modèle réel | Nom commercial |
|---|---|---|---|
| Aperçu rapide (`mode=preview`) | `MODEL_PREVIEW` | `google/gemini-3.1-flash-image-preview` | **Nano Banana 2** |
| Portrait HD (`mode=final`) | `MODEL_FINAL` | `google/gemini-3.1-flash-image-preview` | **Nano Banana 2** |
| Édition image-to-image (`mode=edit` / `edit_hd`) | `MODEL_EDIT` | `google/gemini-3.1-flash-image-preview` | **Nano Banana 2** |
| QA visuel | `MODEL_QA` | `google/gemini-2.5-flash` | Gemini 2.5 Flash (vision/text) |
| Nettoyage fond | inline | `google/gemini-3.1-flash-image-preview` | **Nano Banana 2** |

**Constat clé** : Nano Banana Pro (`google/gemini-3-pro-image`) n'est utilisé **nulle part**. Les 4 étapes image partagent le même modèle. La seule différenciation entre preview, final et edit est le **prompt** (framing, transform blocks) et le nombre de variantes (final génère 2 candidats, preview 1).

Pour ton besoin (200 avatars cohérents, édition fidèle à l'identité, attributs précisément appliqués, différenciation valeurs proches), c'est un risque : Nano Banana 2 est optimisé latence/coût, pas fidélité fine. Sur les attributs subtils audités précédemment (`hair_type curly↔coily`, `body_type very_thin↔thin`, `expression cluster calm/reserved/serious_soft`), il est probable que Pro produise des différences plus marquées.

## 2. Ce que ce plan propose

Je ne peux pas exécuter de tests A/B image-to-image depuis le mode plan (interdiction de modifier code, déployer functions, ou appeler les modèles). Pour livrer les tests Léa demandés, il faut une phase build limitée à :

### Phase 1 — Instrumentation temporaire (lecture seule côté UX)
Ajouter un paramètre `model_override` accepté par `generate-avatar` (preview + edit), exposé via une variable d'env ou un champ admin caché dans Avatar Studio. Aucune modification du flux utilisateur ; uniquement une boutonnière dev pour basculer Nano Banana 2 ↔ Pro sur un appel donné.

### Phase 2 — Exécution du protocole Léa
4 tests demandés :
1. NB2 : Léa corpulence moyenne → forte
2. NB Pro : Léa corpulence moyenne → forte
3. NB2 : Léa cheveux bouclés → crépus
4. NB Pro : Léa cheveux bouclés → crépus

Pour chaque test, capture :
- prompt final envoyé (log existant `[edit] prompt:`)
- modèle utilisé
- image source (URL avatar_url avant)
- image résultat (URL après)
- `identity_preservation` (score QA existant)
- `bust_completeness` (score QA existant)
- commentaire fidélité attribut

Livrable : tableau comparatif markdown dans `.lovable/audit-models.md`.

### Phase 3 — Recommandation
Selon résultats :
- Si NB2 ≈ NB Pro sur identité ET attribut → garder NB2 partout.
- Si NB Pro nettement meilleur sur édition sensible (corpulence, hair_type, beard) → router `MODEL_EDIT` vers Pro pour ces attributs uniquement (liste blanche `SENSITIVE_EDIT_KEYS`), garder NB2 pour preview + final neutres.
- Si NB Pro meilleur partout → migrer `MODEL_FINAL` vers Pro, garder NB2 pour preview.

Aucun changement définitif tant que les 4 tests Léa n'ont pas été observés et validés visuellement par toi.

## 3. Coût et latence à prévoir

Nano Banana Pro (`gemini-3-pro-image`) est ~3-5× plus lent et plus cher par image que NB2. Conséquence sur 200 avatars : si Pro devient le final, prévoir un budget de génération significativement plus élevé et un temps de batch multiplié.

## 4. Question avant de passer en build

Trois options pour Phase 1 :

**A. Override via env var serveur** — j'ajoute `AVATAR_MODEL_OVERRIDE` env, tu définis la valeur côté Cloud, je lance les 4 tests via `supabase--curl_edge_functions`. Le plus rapide, zéro UI.

**B. Sélecteur admin dans Avatar Studio** — j'ajoute un toggle "Modèle: NB2 / Pro" visible uniquement aux admins (RLS role admin), tu cliques toi-même les 4 tests. Plus visuel, plus de code.

**C. Script ponctuel hors UI** — j'écris un script Node qui appelle directement `https://ai.gateway.lovable.dev/v1/images/generations` avec les deux modèles et le même prompt, sans toucher à l'edge function. Le plus propre pour un audit one-shot, mais ne teste pas exactement le pipeline edit_hd réel.

Dis-moi laquelle tu préfères (A / B / C) et je passe en build pour exécuter Phase 1 + 2 et te remettre le tableau comparatif. Si tu veux les 3 modifs P1 de l'audit grammaire en même temps, précise-le aussi.
