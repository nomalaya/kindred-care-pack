# Réduire le taux de ressemblance des avatars — remix sous contrainte phénotypique

## Audit rapide (état actuel)

Le moteur `src/lib/avatarAutoInfer.ts` + `src/lib/countryPhenotypes.ts` attribue les traits par **groupe phénotypique** (6 groupes : north_european, mediterranean, mena, sub_saharan_africa, east_asian, south_asian), avec **une seule valeur fixe par groupe et par sexe**.

Conséquence directe : tous les bénéficiaires d'un même groupe/sexe reçoivent exactement les mêmes valeurs de `skin_tone`, `eye_shape`, `eye_color`, `hair_type`, `hair_color`, `face_shape`, `nose`. Exemple : toute femme MENA = tan / almond / dark_brown / wavy / black / oval / aquiline. C'est la cause principale du « effet clone », pas le modèle d'image.

## Attributs à remixer (par pertinence décroissante)

Sûrs et à fort impact visuel, aucun risque phénotypique :
1. `avatar_face_shape` (oval / round / square_soft / heart / long)
2. `avatar_nose` — mais restreint par groupe (voir garde-fous)
3. `avatar_hair_style` et `avatar_hair_length` (compatibles couvre-chef)
4. `avatar_hair_volume`
5. `avatar_eye_shape` — restreint par groupe
6. `avatar_facial_features` (rides, taches de rousseur si peau claire, fossettes, sourcils)
7. `avatar_body_type`
8. `avatar_clothing_style` + `avatar_clothing_color_palette`
9. `avatar_expression` + `avatar_posture` (variation légère, sans contredire les signaux du récit)
10. `avatar_skin_tone` — uniquement **±1 cran à l'intérieur de la plage du groupe**
11. `avatar_hair_color` / `avatar_eye_color` — uniquement dans la palette autorisée du groupe

Jamais touchés : `avatar_gender`, `avatar_age_range`, `avatar_head_covering`, `culture_tags`, ni aucune valeur déjà déduite d'un signal explicite (note privée, récit) ou saisie manuellement.

## Garde-fous phénotypiques (bloquants)

Ajout d'une table de **plages autorisées** par groupe, en plus des valeurs par défaut :

```text
sub_saharan_africa : skin_tone ∈ {medium_dark, dark, deep} | eye_color ∈ {dark_brown, brown}
                     hair_type ∈ {coily, curly} | hair_color ∈ {black, dark_brown}
                     nose ∈ {wide, rounded, flat_bridge} | volume ∈ {natural, thick}
                     interdits : blonde, red, blue, green, gray, fair, light, fine, narrow
east_asian         : hair_type ∈ {straight} | hair_color ∈ {black, dark_brown}
                     eye ∈ {narrow, almond, hooded} | eye_color ∈ {dark_brown, brown}
mena / south_asian : skin ∈ {olive, tan, medium, medium_dark} | eye_color ∈ {dark_brown, brown, hazel}
mediterranean      : skin ∈ {light, olive, tan} | hair ∈ {black, dark_brown, brown} (+ auburn rare)
north_european     : palette large (blonde/red/blue/green autorisés)
```

Règles de cohérence croisées, appliquées après remix :
- couvre-chef (`headscarf`, `hijab_full`, `turban`) ⇒ interdit peau `fair`/`light`, cheveux `blonde`/`red`, yeux `blue`/`green` ; longueur/style de cheveux forcés en valeur discrète
- `light_freckles` autorisé seulement si peau ∈ {fair, light}
- `hair_color = gray/white` seulement si tranche d'âge ≥ 55-65
- `hair_style` de type tresses/cornrows/box_braids réservé aux cheveux coily/curly

## Déterminisme

Le remix est **déterministe par bénéficiaire** : un hash de son `id` sert de graine, donc le même bénéficiaire donne toujours le même remix (reproductible, pas de dérive entre deux exécutions).

## Livrables

1. `src/lib/phenotypeRanges.ts` — plages autorisées + règles de cohérence croisées (+ miroir `supabase/functions/_shared/`).
2. `src/lib/avatarRemix.ts` — `remixAttributes(beneficiary)` : graine par id, remix des seuls champs autorisés, validation finale contre les plages.
3. Intégration dans `src/lib/avatarAutoInfer.ts` : le phénotype fournit la plage, le remix choisit dans la plage ; les signaux explicites et valeurs manuelles gardent la priorité.
4. Bouton **« Diversifier les attributs »** dans l'Avatar Studio (unitaire + lot), avec aperçu du diff avant application — aucune génération d'image déclenchée.
5. Tests unitaires : aucun cas interdit produit (africain aux yeux bleus, femme voilée rousse, asiatique aux cheveux blonds…), stabilité de la graine, non-modification de genre/âge/couvre-chef.
6. Rapport de distribution avant/après sur les 200 bénéficiaires (nombre de combinaisons uniques par groupe/sexe).

## Étapes et validation

- Étape A : moteur + tests + rapport de distribution sur les 200 profils, **sans écriture en base**.
- Étape B : après votre validation du rapport, application des attributs en base (statut avatar inchangé).
- Étape C : régénération des images uniquement sur les profils que vous désignez, par lots avec planche de contrôle — pas de régénération massive sans votre feu vert.

## Détails techniques

Les avatars déjà publiés (`approved`/`locked`) restent intacts en base tant que l'étape B n'est pas validée ; le remix n'écrase jamais un champ dont `reasons[field]` contient un signal `private_note`, `context`, ni un champ modifié manuellement. Le pipeline de cadrage/trombinoscope et la garde alpha ne sont pas touchés.
