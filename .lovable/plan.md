# Avatar Studio — Pré-filtrage psychosocial intelligent

## Objectif

Transformer Avatar Studio en outil de production rapide : pour chaque bénéficiaire, afficher en permanence son récit + témoignage, et pré-remplir automatiquement les attributs d'avatar à partir d'une analyse fine de ces textes (handicap, maladie, deuil, parentalité, âge, etc.).

Exemple cible — Fatima ("sclérose en plaques", "trois enfants", "mari décédé", "douleur qui me ronge") doit produire automatiquement :
- accessoire mobilité = fauteuil roulant
- expression = tired_but_warm / serious_soft
- fatigue = 4-5
- énergie parentale = tired_but_warm_parent
- posture = seated_dignified

---

## 1. Afficher description + témoignage pour TOUS les bénéficiaires

Dans `src/pages/AvatarStudio.tsx`, panneau de droite (éditeur), ajouter en haut un encart "Contexte psychosocial" toujours visible :

- **Récit** (`short_story`) — bloc lisible, fond muted, italique léger
- **Témoignage** (`emotional_sentence`) — citation stylisée avec guillemets typographiques
- Bouton **« Re-déduire depuis le texte »** (icône Wand2) qui relance l'inférence et re-remplit les champs non verrouillés

L'encart reste visible quel que soit l'onglet actif (Identité / Visage / Cheveux / Vêtements / Émotion).

## 2. Nouveau champ : accessoire de mobilité / aide médicale visible

Ajouter un attribut visuel `avatar_mobility_aid` (impacte directement le prompt image) :

Vocabulaire : `none`, `wheelchair_manual`, `wheelchair_electric`, `cane`, `crutches`, `walker`, `visible_bandage`, `arm_sling`, `oxygen_cannula`.

Champ éditable dans l'onglet "Posture/Émotion" + override admin possible.

## 3. Moteur de pré-filtrage enrichi

Réécrire `src/lib/avatarAutoInfer.ts` (et son miroir serveur `supabase/functions/_shared/avatarTraits.ts`) avec un dictionnaire de signaux structurés. Chaque signal détecte des mots-clés FR dans `short_story + emotional_sentence` et impose des valeurs (ou bornes minimales) :

| Catégorie | Mots-clés | Conséquences avatar |
|---|---|---|
| Mobilité réduite sévère | sclérose en plaques, paraplégie, hémiplégie, fauteuil roulant, ne peut plus marcher | `mobility_aid = wheelchair_electric`, `posture = seated_dignified`, `fatigue ≥ 4` |
| Mobilité réduite légère | canne, béquilles, déambulateur, marche difficilement, hanche | `mobility_aid = cane/walker`, `posture = seated_dignified` |
| Maladie chronique / grave | cancer, chimio, dialyse, maladie, hôpital, traitement lourd | `expression = tired_but_warm` ou `serious_soft`, `fatigue ≥ 3`, `tired_level ≥ 3`, `brightness = 2` |
| Deuil / perte | décès, mort, perdu, veuve, veuf | `expression = serious_soft / thoughtful`, `brightness = 2`, `resilience ↑` |
| Violence / exil | violence, fui, guerre, exil, réfugié | `expression = serious_soft`, `dignity_level = 5`, `resilience = 4` |
| Parentalité solo | seule avec, élève seule, mari décédé + enfants | `parent_energy = tired_but_warm_parent`, `posture = protective` |
| Grossesse | enceinte, grossesse, attend un enfant | `clothing_style = practical_warm`, expression douce |
| Isolement | seul, isolé, personne | `expression = pensive / reserved` |
| Précarité logement | SDF, sans domicile, rue, hébergement | `clothing_style = practical_warm`, `fatigue ≥ 3` |
| Grand âge fragile | très âgé, dépendant, perte d'autonomie | `posture = seated_dignified`, `mobility_aid = cane` si non défini |
| Résilience / espoir | se bat, garde espoir, courage, avenir | `resilience ≥ 4`, `expression = resilient / hopeful` |

Règles de combinaison :
- Les signaux **médicaux** dominent toujours les signaux émotionnels positifs (ex: "se bat" + "sclérose" → fauteuil + résilient, pas juste hopeful).
- Les valeurs déjà saisies par l'admin (verrouillées via le statut `approved`/`locked`) ne sont jamais écrasées.
- Le bouton "Re-déduire" écrase uniquement les champs non touchés depuis la dernière inférence (tracking via un champ `auto_inferred_fields` côté state local).

## 4. Intégration dans le prompt image

Mettre à jour `supabase/functions/_shared/avatarArtDirection.ts` et `generate-avatar/index.ts` pour traduire `avatar_mobility_aid` en directive visuelle explicite dans le prompt (ex: "seated in a modern electric wheelchair, hands resting calmly, dignified posture, indoor soft lighting").

## 5. Migration DB

Ajouter la colonne `avatar_mobility_aid TEXT DEFAULT 'none'` sur `beneficiaries`.

---

## Détails techniques

**Fichiers modifiés** :
- `supabase/migrations/...` — ajout colonne `avatar_mobility_aid`
- `src/lib/avatarTraits.ts` — ajout `mobility_aid` au vocab + `FIELD_LABELS`
- `src/lib/avatarAutoInfer.ts` — refonte moteur signaux
- `supabase/functions/_shared/avatarTraits.ts` — miroir serveur
- `supabase/functions/_shared/avatarArtDirection.ts` — directive visuelle mobilité
- `src/pages/AvatarStudio.tsx` — encart contexte permanent + bouton re-déduire + champ mobility_aid dans l'onglet émotion/posture

**Hors scope** : pas de modification du flow de don, ni du composant `BeneficiaryAvatar`.
