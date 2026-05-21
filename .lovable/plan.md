## Objectif

1. Donner à chaque champ d'Avatar Studio (Genre, Tranche d'âge, Forme du visage…) **sa propre couleur d'accent** appliquée au picto et au libellé, pour faciliter le repérage visuel.
2. Traduire en français **toutes les valeurs** des menus déroulants actuellement en anglais (`woman`, `oval`, `tired_but_warm`, `wheelchair_electric`…), avec un vocabulaire soigné et nuancé.

Aucune modification de la base, des edge functions, ni des moteurs (`evaluateAvatarRules`, `inferStudioDefaultsWithReasons`, `AVATAR_VOCAB`). On garde les **valeurs techniques** intactes ; seul l'affichage change.

---

## 1. Palette de couleurs par champ

Ajout d'une map `FIELD_ACCENT` dans `src/features/avatar-studio/fields.tsx` qui associe chaque clé à une couleur sémantique HSL définie dans `src/index.css` (nouveaux tokens `--field-*`). Exemples d'attribution :

| Champ | Token | Teinte |
|---|---|---|
| `avatar_gender` | `--field-identity` | violet doux |
| `avatar_age_range` | `--field-time` | ambre |
| `avatar_face_shape` | `--field-face` | rose terracotta |
| `avatar_skin_tone` | `--field-skin` | sable |
| `avatar_eye_shape` / `avatar_eye_color` | `--field-eye` | bleu lagon |
| `avatar_hair_*` | `--field-hair` | brun chaud |
| `avatar_beard` / `avatar_moustache` / `avatar_hair_recession` / `avatar_bald_level` | `--field-pilosity` | bronze |
| `avatar_head_covering` / `avatar_cultural_style_override` | `--field-culture` | émeraude |
| `avatar_clothing_style` / `avatar_clothing_color_palette` | `--field-clothing` | indigo |
| `avatar_posture` / `avatar_mobility_aid` | `--field-body` | sarcelle |
| `avatar_expression` / `avatar_emotional_brightness` | `--field-mood` | corail |
| `avatar_parent_energy` | `--field-family` | rose poudré |
| `avatar_fatigue_level` / `avatar_tired_level` | `--field-fatigue` | gris-mauve |
| `avatar_dignity_level` / `avatar_resilience_level` | `--field-dignity` | doré |

Les tokens sont déclarés en HSL dans `:root` et `.dark` (variante adaptée). Le composant `FieldLabel` applique `style={{ color: 'hsl(var(--field-xxx))' }}` au picto et au libellé. Le picto passe à `h-4 w-4` pour mieux porter la couleur, le libellé garde sa taille mais perd `text-muted-foreground` au profit du token couleur.

Les badges « ✨ Déduit du récit » et le compteur des sections restent neutres (gris) pour ne pas saturer.

---

## 2. Traduction française fine du vocabulaire

Création de `src/lib/avatarVocabLabels.ts` exportant `VOCAB_LABELS: Record<vocabKey, Record<value, string>>` avec une traduction nuancée pour chaque valeur. Aperçu (extrait) :

```
gender:        woman → Femme · man → Homme · person → Non précisé
age_range:     18-25 → 18–25 ans · 25-35 → 25–35 ans · …
skin_tone:     fair → Très clair · light → Clair · medium → Médian ·
               olive → Olive · tan → Hâlé · medium_dark → Mat ·
               dark → Foncé · deep → Très foncé
hair_type:     straight → Lisses · wavy → Ondulés · curly → Bouclés · coily → Crépus
hair_color:    black → Noir · dark_brown → Châtain foncé · light_brown → Châtain clair ·
               blonde → Blond · red → Roux · auburn → Auburn · gray → Gris · white → Blanc
hair_length:   very_short → Très courts · short → Courts · shoulder → Mi-longs (épaules) ·
               medium → Mi-longs · long → Longs
hair_volume:   fine → Fins · natural → Naturels · light → Légers · thick → Épais
hair_style:    clean_cut → Coupe nette · tousled → Décoiffés · side_parted → Raie de côté ·
               loose → Détachés · softly_tied → Attachés souples · half_up → Demi-queue ·
               natural_waves → Vagues naturelles · bun → Chignon · braided_simple → Tresse simple
face_shape:    oval → Ovale · round → Rond · square_soft → Carré adouci ·
               heart → Cœur · long → Allongé
eye_shape:     almond → En amande · round → Ronds · soft → Doux · narrow → Étirés ·
               hooded → Paupières tombantes · tired → Fatigués · deep_set → Enfoncés
eye_color:     brown → Marron · dark_brown → Marron foncé · hazel → Noisette ·
               green → Verts · blue → Bleus · gray → Gris
facial_features: subtle_age_lines → Légères rides d'expression · gentle_wrinkles → Rides douces ·
               light_freckles → Quelques taches de rousseur · soft_dimples → Fossettes discrètes ·
               expressive_brows → Sourcils expressifs
clothing_style: casual_modest → Sobre du quotidien · simple_layered → Couches simples ·
               practical_warm → Pratique et chaud · classic_simple → Classique épuré ·
               soft_cardigan → Gilet doux · modest_warm → Modeste et chaleureux
clothing_color_palette: warm_earth → Terres chaudes · muted_neutral → Neutres tamisés ·
               soft_jewel → Pierres précieuses douces · sand_ivory → Sable et ivoire ·
               dusty_blue → Bleu poussiéreux
expression:    gentle_smile → Sourire doux · hopeful → Empli d'espoir · calm → Calme ·
               discreet_smile → Sourire discret · tired_but_warm → Fatigué mais chaleureux ·
               resilient → Résilient · serious_soft → Sérieux et doux ·
               thoughtful → Songeur · pensive → Pensif · reserved → Réservé
posture:       upright_calm → Debout, posé · leaning_slightly → Légèrement penché ·
               relaxed → Détendu · protective → Protecteur · seated_dignified → Assis, digne
parent_energy: none → Sans objet · protective_parent → Parent protecteur ·
               practical_parent → Parent pragmatique · tired_but_warm_parent → Parent fatigué mais chaleureux
cultural_style: neutral_european → Européen neutre · soft_modern → Moderne sobre ·
               subtle_mediterranean → Méditerranéen subtil ·
               subtle_west_african → Afrique de l'Ouest, subtil ·
               subtle_central_african → Afrique centrale, subtil
beard:         none → Aucune · light → Légère · full → Fournie · grey → Grisonnante
moustache:     none → Aucune · light → Fine · full → Fournie
hair_recession: none → Aucun · light → Léger · moderate → Modéré · strong → Marqué
head_covering: none → Aucun · optional → Optionnel · required → Requis
mobility_aid:  none → Aucune · wheelchair_manual → Fauteuil manuel ·
               wheelchair_electric → Fauteuil électrique · cane → Canne ·
               crutches → Béquilles · walker → Déambulateur ·
               visible_bandage → Bandage visible · arm_sling → Bras en écharpe ·
               oxygen_cannula → Lunettes à oxygène
workflow_status: draft → Brouillon · generated → Généré · approved → Approuvé · locked → Verrouillé
```

Ces libellés sont injectés dans `SelectField` via un nouveau prop optionnel `labelFor?: (value: string) => string`. Dans `AvatarStudio.tsx`, chaque appel `<SelectField … options={AVATAR_VOCAB.xxx} />` reçoit `labelFor={v => VOCAB_LABELS.xxx[v] ?? v}`. La **valeur stockée reste l'identifiant technique** (`woman`, `oval`…), seul le texte affiché dans le menu et le trigger est francisé.

---

## Fichiers touchés

- **créés** : `src/lib/avatarVocabLabels.ts`
- **édités** :
  - `src/index.css` — nouveaux tokens `--field-*` (mode clair + sombre)
  - `src/features/avatar-studio/fields.tsx` — `FIELD_ACCENT`, `FieldLabel` colorée, prop `labelFor` sur `SelectField`
  - `src/pages/AvatarStudio.tsx` — passe `labelFor` à chaque `SelectField`

## Hors périmètre

- Pas de changement du schéma DB ni des valeurs `AVATAR_VOCAB` (compatibilité du moteur d'inférence et des règles).
- Les sliders (`SliderField`) reçoivent aussi la couleur du picto/label mais leur poignée Radix reste sur la couleur primaire.
- Pas de refonte de la mise en page de l'accordéon.
