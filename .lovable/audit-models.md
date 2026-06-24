# Audit comparatif Nano Banana 2 vs Nano Banana Pro — Avatar Studio

Date : 24/06/2026.
Bénéficiaire : **Léa** `de8c19bc-8643-4af8-8bc0-31a57f79cd61` (femme 25-35 ans, peau claire, visage cœur, cheveux courts curly, corpulence moyenne).
Image source baseline : `versions/de8c19bc.../final-1779446309458.png` (qa_score=100 à la génération initiale).
Infrastructure : `model_override` ajouté à `generate-avatar` (env body param, allow-list à 4 modèles).

## 1. État des modèles avant audit

| Étape | Modèle réel | Famille |
|---|---|---|
| `MODEL_PREVIEW` | `google/gemini-3.1-flash-image-preview` | **Nano Banana 2** |
| `MODEL_FINAL` | `google/gemini-3.1-flash-image-preview` | **Nano Banana 2** |
| `MODEL_EDIT` | `google/gemini-3.1-flash-image-preview` | **Nano Banana 2** |
| `MODEL_QA` | `google/gemini-2.5-flash` | Gemini Flash texte/vision |
| `clean-avatar-background` | `google/gemini-3.1-flash-image-preview` | **Nano Banana 2** |

Nano Banana Pro (`google/gemini-3-pro-image`) **n'était utilisé nulle part**.

## 2. Résultats des 4 tests Léa

| # | Test | Modèle | Mode effectif | QA pre-clean | QA post-clean | Verdict pipeline | Image résultat |
|---|---|---|---|---|---|---|---|
| 1 | Corpulence moyenne → forte | NB2 | edit_hd (image-to-image) | bust=**86** OK | bust=**50** | **ROLLBACK** (bust_incomplete_after_clean) | [edit-hd-1782306556506.png](https://reofbeluopsnqeirxofv.supabase.co/storage/v1/object/public/avatars/versions/de8c19bc-8643-4af8-8bc0-31a57f79cd61/edit-hd-1782306556506.png) |
| 2 | Corpulence moyenne → forte | **Pro** | edit_hd (image-to-image) | bust=**97** excellent | bust=**60** | **ROLLBACK** (bust_incomplete_after_clean) | [edit-hd-1782306684096.png](https://reofbeluopsnqeirxofv.supabase.co/storage/v1/object/public/avatars/versions/de8c19bc-8643-4af8-8bc0-31a57f79cd61/edit-hd-1782306684096.png) |
| 3 | Cheveux curly → coily | NB2 | final (full text-to-image — structural) | n/a | bust=**70**, global=40 | **FAILED** (score_below_60) | `rejected/de8c19bc...1782306754329.png` |
| 4 | Cheveux curly → coily | **Pro** | final (full text-to-image — structural) | n/a | bust=**0**, global=40, style=100 | **FAILED** (score_below_60) | `rejected/de8c19bc...1782306927372.png` |

### Prompt envoyé — tests 1 & 2 (edit_hd identique pour NB2 et Pro)
Bloc `TRANSFORM_BLOCKS.avatar_body_type` ("BODY TYPE TRANSFORMATION — SAME PERSON") + `buildEditPrompt` (identité préservée stricte, framing collarbone, COMPLETE BUST STRICT). Diff unique : `morphologie: noticeably heavier build, fuller face, rounded cheeks and broader shoulders`. Voir `avatar_versions.prompt` complet — Pro et NB2 ont reçu **exactement le même prompt**.

### Prompt envoyé — tests 3 & 4 (full regen identique)
`buildAvatarPrompt(traits)` complet (style storybook, framing chest-up, palette, …) avec `avatar_hair_type='coily'` dans les traits inférés. Pas de bloc transform : la régénération structurelle reconstruit l'avatar à partir de zéro.

## 3. Lecture des scores

### Identity preservation (tests 1-2)
Les deux modèles préservent l'identité (pas de signalement QA). **Pro produit une transformation morphologique plus fidèle** : bust_completeness 97 vs 86 avant clean — Pro respecte mieux la directive "complete drawn garment line, do not fade into white".

### Application de l'attribut (tests 1-2)
Indirectement validé par le QA : aucun score `body_type_wrong` n'est rapporté. Inspection visuelle requise pour valider que `heavy` est bien rendu vs simplement légèrement épaissi.

### Fidélité au style (tests 3-4)
- NB2 : style_match=80, bust=70, framing=70, background=0 (le modèle a "perdu" le fond contextuel et produit un fond blanc).
- Pro : style_match=100, framing=80, bust=**0** (la torse "se dissout dans le blanc"), background=0.

Pro est meilleur en style/cadrage **mais beaucoup plus enclin au "fade-out bust"** sur un text-to-image full regen, alors que NB2 produit un buste plus opaque.

### Effet bloquant : `clean-avatar-background`
Sur les 2 tests edit, le pipeline a généré une image acceptable (bust 86 et 97) puis le passage chroma-key l'a abîmée (50 et 60 → rollback). **C'est le maillon faible identifié, indépendant du modèle de génération.** Voir l'audit précédent sur QA bust.

## 4. Recommandation

| Étape | Modèle conseillé | Justification |
|---|---|---|
| `MODEL_PREVIEW` (aperçu rapide) | NB2 (inchangé) | Latence faible, qualité suffisante pour itérer. |
| `MODEL_FINAL` (text-to-image) | **NB2 par défaut, Pro en option opérateur** | NB2 dissout moins le buste en full regen ; Pro améliore le style mais aggrave le "fade-out". Inutile de basculer tout le monde sur Pro. |
| `MODEL_EDIT` (image-to-image) | **Pro pour les attributs sensibles** (`avatar_body_type`, `avatar_beard`, `avatar_hair_type` côté édition douce, `avatar_age_range`) | Différence mesurée : bust 97 vs 86 avant clean. Pro applique la transformation tout en respectant mieux la zone garment line. Coût ~3-5× plus élevé acceptable car édition ponctuelle. |
| `MODEL_EDIT` (autres attributs) | NB2 | Pas de gain mesuré sur cosmétiques légers (couleur cheveux, vêtements, expression). |
| `MODEL_QA` | Gemini 2.5 Flash (inchangé) | Performant pour le scoring structuré. |
| `clean-avatar-background` | **À revoir séparément** | Modèle ≠ problème : c'est l'étape chroma-key qui détruit le buste validé. Hors périmètre de cet audit. |

### Routage sensible proposé (à implémenter si validé)
```ts
// _shared/avatarArtDirection.ts
const SENSITIVE_EDIT_KEYS = new Set([
  "avatar_body_type", "avatar_age_range",
  "avatar_beard", "avatar_hair_type"
]);
export function pickEditModel(changedKeys: string[]): string {
  return changedKeys.some(k => SENSITIVE_EDIT_KEYS.has(k))
    ? "google/gemini-3-pro-image"   // Pro
    : "google/gemini-3.1-flash-image-preview"; // NB2
}
```

## 5. Limites de cet audit

1. Les 4 tests reposent sur 1 seule bénéficiaire (Léa). Pour 200 avatars, idéalement répéter sur 3 phénotypes (peau claire/médiane/foncée) × 2 genres.
2. Les tests 3-4 (hair_type) ont déclenché un full regen text-to-image — pas une vraie comparaison "édition sensible". Pour évaluer Pro sur édition hair_type sans full regen, il faudrait soit reclasser `avatar_hair_type` en MEDIUM, soit ajouter un mode `edit_force_sensitive`.
3. Le pipeline `clean-avatar-background` masque la performance réelle des modèles en édition. Les scores pre-clean (86 et 97) sont une mesure plus juste de la qualité du modèle.
4. Aucun jugement humain visuel collecté ici — recommandation : ouvrir les 4 URLs ci-dessus et noter à l'œil la fidélité à `heavy` / `coily` ainsi que la préservation d'identité.

## 6. Instrumentation ajoutée

`supabase/functions/generate-avatar/index.ts` accepte désormais un champ optionnel `model_override` (string) dans le body de la requête. Allow-list : `google/gemini-3.1-flash-image-preview`, `google/gemini-3-pro-image`, `google/gemini-3.1-flash-image`, `google/gemini-2.5-flash-image`. Tout autre valeur est ignorée avec un warning log. Aucun impact sur le flux par défaut (omitter le champ = comportement identique).
