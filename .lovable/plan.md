
# Audit grammaire visuelle Avatar Studio — value-par-value

Audit en lecture seule. Aucune modification de code. Toutes les références pointent vers `supabase/functions/_shared/avatarArtDirection.ts` (`AD`) et `_shared/avatarTraits.ts` (`AT`) ; les libellés FR proviennent de `src/lib/avatarVocabLabels.ts`.

Légende statut :
- ✅ clair — valeur visuellement distincte, prompt explicite
- 🟡 à renforcer — interprétée mais signal faible
- 🟠 trop proche — risque de confusion avec une valeur voisine
- 🔴 fantôme — non injectée dans le prompt, aucun effet
- ⚪ doublon — chevauche un autre attribut

---

## 1. CORPULENCE — `avatar_body_type`

Mapping : `BODY_TYPE_DESC` (AD:86–92). Injecté en création seulement si `≠ average` (AD:185). Édition : `EDIT_VALUE_LABELS.avatar_body_type` (AD:393) + bloc `TRANSFORM_BLOCKS.avatar_body_type` (AD:439-447).

| UI FR | Technique | Prompt création | Prompt édition (fragment) | Effet attendu | Vs voisin | Statut |
|---|---|---|---|---|---|---|
| Très mince | `very_thin` | "very slender, slim build, narrow shoulders and thin face" | idem | visage fin, épaules étroites | vs `thin`: ajoute "narrow shoulders" | 🟡 à renforcer (différence vs `thin` ténue) |
| Mince | `thin` | "slim build, lean face" | idem | silhouette mince naturelle | vs `very_thin`: pas d'épaules ; vs `average`: rien (référence) | 🟡 à renforcer |
| Moyenne | `average` | **(non injectée)** | idem (filtre côté création) | baseline neutre | référence | ✅ |
| Légèrement enveloppée | `chubby` | "slightly heavier build, rounder face and softer features" | idem | visage plus rond, traits plus doux | vs `heavy`: pas d'épaules larges | ✅ |
| Forte corpulence | `heavy` | "noticeably heavier build, fuller face, rounded cheeks and broader shoulders" | idem + bloc SAME PERSON | visage plein, joues, épaules larges | clairement plus marqué que `chubby` | ✅ |

**Verdict** : create/edit cohérents. Bloc "same person transformed" appliqué en édition. À renforcer : `very_thin` doit être nettement plus marqué (« gaunt cheekbones, very narrow neck, slim collarbone visible ») et `thin` mieux différencié de la baseline (« visibly slim, slim neck »).

---

## 2. TYPE DE CHEVEUX — `avatar_hair_type`

Mapping : `HAIR_TYPE_DESC` (AD:72-74) — **simple synonyme anglais, aucune description visuelle**.

| UI FR | Tech | Création | Édition | Effet attendu | Statut |
|---|---|---|---|---|---|
| Lisses | `straight` | "straight" | idem | cheveux lisses sans vague | ✅ |
| Ondulés | `wavy` | "wavy" | idem | vagues en S | ✅ |
| Bouclés | `curly` | "curly" | idem | boucles définies | 🟠 vs `coily` |
| Crépus | `coily` | "coily" | idem | texture serrée 4A-4C | 🟠 vs `curly` |

**Verdict** : `curly` vs `coily` trop proche dans le langage du modèle. À renforcer : `coily` → « tightly coiled afro-textured hair, densely packed coils, type 4 hair » ; `curly` → « defined ringlet curls, type 3 hair, springy spirals ».

---

## 3. LONGUEUR CHEVEUX — `avatar_hair_length`

Mapping : `HAIR_LENGTH_DESC` (AD:357-363). Création : descripteur inline non utilisé (le prompt construit `${hairLength}` brut via `replace(/_/g, " ")` AD:168) — **HAIR_LENGTH_DESC n'est utilisé QU'EN ÉDITION**.

| UI FR | Tech | Création (brut) | Édition | Effet | Statut |
|---|---|---|---|---|---|
| Très courts | `very_short` | "very short" | "very short hair" | rasés / buzz cut | ✅ |
| Courts | `short` | "short" | "short hair" | sous l'oreille | ✅ |
| Mi-longs (épaules) | `shoulder` | "shoulder" | "shoulder-length hair" | jusqu'aux épaules | 🟠 vs `medium` |
| Mi-longs | `medium` | "medium" | "medium-length hair" | longueur moyenne | 🟠 vs `shoulder` |
| Longs | `long` | "long" | "long hair" | très longs | ✅ |

**Verdict** : `shoulder` et `medium` sont quasi-synonymes en FR comme en EN. Recommandation : **fusionner** (garder `shoulder`, supprimer `medium`) OU rebadger `medium` en « mi-longs au menton » avec descripteur « chin-length hair, just below the jawline ». Note : incohérence subtile entre création (mot brut) et édition (descripteur dictionnaire).

---

## 4. VOLUME CHEVEUX — `avatar_hair_volume`

Mapping : `HAIR_VOLUME_DESC` (AD:364-368). Même observation : utilisé en édition ; en création, prompt envoie `${hairVolume}` brut (AD:170).

| UI FR | Tech | Création (brut) | Édition | Effet | Statut |
|---|---|---|---|---|---|
| Fins | `fine` | "fine" | "fine, thin hair volume" | cheveux fins clairsemés | 🟠 vs `light` |
| Naturels | `natural` | "natural" | "natural hair volume" | densité moyenne | ✅ |
| Légers | `light` | "light" | "light hair volume" | volume aéré | 🟠 vs `fine` |
| Épais | `thick` | "thick" | "thick, dense hair volume" | dense, fourni | ✅ |

**Verdict** : `fine` et `light` ambigus (FR "fins" et "légers" désignent quasi la même chose, et "light" en anglais peut signifier couleur claire → confusion). **Recommandation : supprimer `light` ou le renommer `airy_volume` avec « airy, lifted hair with bounce »**.

---

## 5. COIFFURE — `avatar_hair_style`

Mapping : `HAIR_STYLE_DESC` (AD:370-383). Utilisé en édition. Création envoie brut.

| UI FR | Tech | Édition | Statut |
|---|---|---|---|
| Coupe nette | `clean_cut` | "clean-cut hairstyle" | 🟡 (générique) |
| Décoiffés | `tousled` | "tousled hairstyle" | ✅ |
| Raie de côté | `side_parted` | "side-parted hairstyle" | ✅ |
| Détachés | `loose` | "loose flowing hairstyle" | 🟠 redondant avec `hair_type=wavy/straight` détachés par défaut |
| Attachés souples | `softly_tied` | "softly tied back hairstyle" | 🟠 vs `half_up` |
| Demi-queue | `half_up` | "half-up hairstyle" | 🟠 vs `softly_tied` |
| Vagues naturelles | `natural_waves` | "natural waves hairstyle" | ⚪ doublon avec `hair_type=wavy` |
| Chignon | `bun` | "neat bun hairstyle" | ✅ |
| Tresse simple | `braided_simple` | "simple braid hairstyle" | ✅ |
| Tresses collées | `cornrows` | "cornrows hairstyle" | ✅ |
| Tresses longues | `box_braids` | "box braids hairstyle" | ✅ |
| Tresses relevées | `braided_updo` | "braided updo hairstyle" | ✅ |

**Verdict** : 4 valeurs problématiques : `loose`, `natural_waves`, `softly_tied`, `half_up`. Recommandation : supprimer `natural_waves` (doublon avec hair_type) et `loose` (état par défaut) ; renforcer `softly_tied` → « low loose ponytail » et `half_up` → « top half of hair pulled up, bottom half loose ».

---

## 6. EXPRESSION — `avatar_expression`

Mapping : `EXPRESSION_DESCRIPTIONS` (AD:6-17). Création + édition (+ bloc TRANSFORM_BLOCKS).

| UI FR | Tech | Prompt | Statut |
|---|---|---|---|
| Sourire doux | `gentle_smile` | "a gentle, sincere smile, warm eyes" | ✅ |
| Empli d'espoir | `hopeful` | "a hopeful, soft expression, eyes looking slightly upward" | ✅ (regard vers le haut = signal fort) |
| Calme | `calm` | "a calm, peaceful expression, relaxed mouth" | 🟠 vs `reserved`, `serious_soft` |
| Sourire discret | `discreet_smile` | "a discreet, almost imperceptible smile, kind eyes" | 🟠 vs `gentle_smile` (intensité seule) |
| Fatigué mais chaleureux | `tired_but_warm` | "subtle fatigue around the eyes but warmth and humanity preserved" | ⚪ doublon avec `tired_level` |
| Résilient | `resilient` | "a resilient, composed expression, quiet strength" | 🟡 abstrait |
| Sérieux et doux | `serious_soft` | "a serious but soft expression, gentle gaze, no harshness" | 🟠 vs `calm`, `reserved` |
| Songeur | `thoughtful` | "a thoughtful, contemplative expression, eyes slightly downward" | ✅ (regard bas = signal) |
| Pensif | `pensive` | "a pensive expression, looking slightly away, introspective" | 🟠 vs `thoughtful` |
| Réservé | `reserved` | "a reserved, modest expression, soft gaze" | 🟠 vs `calm`, `serious_soft` |

**Verdict** : 10 valeurs → ~5 visuels distincts réellement reconnaissables. Cluster ambigu : `{calm, serious_soft, reserved}` et `{thoughtful, pensive}` et `{gentle_smile, discreet_smile}`. Recommandation : conserver 6-7 expressions et fusionner les doublons.

---

## 7. FATIGUE VISIBLE — `avatar_tired_level` (slider 0-5)

Logique seuil (AD:188-189) :
- `<1` → rien
- `1-2` → "slight tiredness in the eyes"
- `≥3` → "noticeably tired eyes"

**3 états visuels pour 6 positions de slider.** Levels 1=2 produisent strictement la même image. Levels 3=4=5 idem.

**Verdict** : 🟡 slider trompeur. Recommandation : convertir en select 3 valeurs (Aucun / Léger / Marqué) OU exploiter les paliers intermédiaires (1, 2, 3, 4, 5 = 5 fragments distincts gradués).

---

## 8. TONALITÉ ÉMOTIONNELLE — `avatar_emotional_brightness` (slider 0-5)

Logique seuil (AD:190-191) :
- `≤1` → "low emotional brightness, subdued gaze"
- `2-3` → **rien injecté**
- `≥4` → "bright, warm gaze"

**3 états visuels (sombre / neutre / lumineux) pour 6 positions.** Levels 2 et 3 = baseline silencieuse.

**Verdict** : 🟡 identique au précédent. Recommandation : 3 valeurs explicites ou 5 paliers réellement gradués.

---

## 9. POSTURE — `avatar_posture`

Mapping : `POSTURE_DESCRIPTIONS` (AD:19-25).

| UI FR | Tech | Prompt | Statut |
|---|---|---|---|
| Debout, posé | `upright_calm` | "upright posture, shoulders relaxed" | ✅ |
| Légèrement penché | `leaning_slightly` | "leaning slightly forward, engaged" | ✅ |
| Détendu | `relaxed` | "relaxed natural posture" | 🟠 vs `upright_calm` |
| Protecteur | `protective` | "protective posture, slightly turned, conveying care" | ✅ |
| Assis, digne | `seated_dignified` | "seated, dignified posture" | ✅ (mais nécessite buste, peut conflicter avec FRAMING « collarbone only ») |

**Verdict** : `relaxed` vs `upright_calm` faiblement distincts. `seated_dignified` techniquement peu visible vu le cadrage collarbone — recommander de **supprimer `seated_dignified`** ou de l'autoriser uniquement avec `mobility_aid` (wheelchair).

---

## 10. FORME DU VISAGE — `avatar_face_shape`

Pas de dictionnaire dédié. Création envoie `${faceShape.replace(/_/g, " ")} face shape` (AD:176). **Aucun descripteur visuel.**

| UI FR | Tech | Prompt | Statut |
|---|---|---|---|
| Ovale | `oval` | "oval face shape" | ✅ |
| Rond | `round` | "round face shape" | ✅ |
| Carré adouci | `square_soft` | "square soft face shape" | 🟡 (ambigu en EN) |
| Cœur | `heart` | "heart face shape" | 🟠 (peut être interprété comme décoration emoji) |
| Allongé | `long` | "long face shape" | ⚪ ambigu avec `hair_length=long` |

**Verdict** : à enrichir avec un `FACE_SHAPE_DESC` (« square soft » → "soft square jawline with rounded corners" ; « heart » → "heart-shaped face with wider forehead and pointed chin" ; « long » → "elongated oval face, longer than wide").

---

## 11. FORME DES YEUX — `avatar_eye_shape`

Mapping : `EYE_SHAPE_DESC` (AD:304-312). Édition seulement ; création envoie `${eye_shape} ${eye_color} eyes` brut (AD:178).

| UI FR | Tech | Édition | Statut |
|---|---|---|---|
| En amande | `almond` | "almond-shaped eyes" | ✅ |
| Ronds | `round` | "round, open eyes" | ✅ |
| Doux | `soft` | "soft-shaped eyes" | 🟡 vague |
| Étirés | `narrow` | "narrow eyes" | ✅ |
| Paupières tombantes | `hooded` | "hooded eyelids" | ✅ |
| Fatigués | `tired` | "subtly tired eyes" | ⚪ doublon avec `tired_level` |
| Enfoncés | `deep_set` | "deep-set eyes" | ✅ |

**Verdict** : retirer `tired` (doublon `tired_level`) et clarifier `soft` (« softly rounded eyes with gentle slope »).

---

## 12. NEZ — `avatar_nose`

Mapping : `NOSE_DESC` (AD:76-84). Bien différencié.

| UI FR | Tech | Prompt | Statut |
|---|---|---|---|
| Droit | `straight` | "a straight, balanced nose" | ✅ |
| Aquilin | `aquiline` | "an aquiline nose with a softly curved bridge" | ✅ |
| Arrondi | `rounded` | "a softly rounded nose with a gentle tip" | ✅ |
| Large | `wide` | "a wide nose with broad nostrils" | ✅ |
| Fin | `narrow` | "a narrow, slim nose" | ✅ |
| Arête basse | `flat_bridge` | "a nose with a low, flat bridge" | ✅ |
| Retroussé | `upturned` | "a slightly upturned nose" | ✅ |

**Verdict** : best-in-class. Aucune action.

---

## 13. BARBE — `avatar_beard`

Mapping : `BEARD_DESC` (AD:313-319). Création réservée aux hommes (AD:192).

| UI FR | Tech | Création | Édition | Statut |
|---|---|---|---|---|
| Aucune | `none` | (skipped) | "clean-shaven (no beard)" | ✅ |
| Légère | `light` | "light beard" | "light stubble beard" | ✅ |
| Fournie | `full` | "full beard" | "full trimmed beard" | ✅ |
| Grisonnante | `grey` | "grey beard" | "neatly trimmed grey beard" | 🟡 mélange forme + couleur |
| Religieuse (longue) | `religious_long` | bloc dédié AD:194 | idem édition | ✅ très distinct |

**Verdict** : `grey` est un signal couleur mélangé à un signal forme. Cohérent avec l'usage (personne âgée à barbe blanche), mais pourrait être séparé en deux champs (longueur + grisonnement). Acceptable en l'état.

---

## 14. MOUSTACHE — `avatar_moustache`

`MOUSTACHE_DESC` (AD:320-324) : none / "light thin moustache" / "full moustache". ✅ 3 valeurs clairement différenciées.

---

## 15. CALVITIE — `avatar_bald_level` (slider 0-100, homme uniquement)

Logique seuil (AD:201-202) :
- `<30` → rien
- `30-69` → "partial baldness on top"
- `≥70` → "mostly bald"

**3 états pour 20 crans de slider (step=5).** Identique problème `tired_level`.

**Verdict** : 🟡. Recommandation : 4 paliers (Aucune / Tonsure / Marquée / Totale) avec fragments distincts.

---

## 16. RECUL CHEVEUX — `avatar_hair_recession`

Création (AD:203-205) : `${value} hair recession at temples`. Édition : mêmes mots dans `EDIT_VALUE_LABELS`. Pas de dictionnaire.

| UI FR | Tech | Prompt | Statut |
|---|---|---|---|
| Aucun | `none` | (skipped) | ✅ |
| Léger | `light` | "light hair recession at temples" | 🟡 |
| Modéré | `moderate` | "moderate hair recession at temples" | 🟡 |
| Marqué | `strong` | "strong hair recession at temples" | 🟡 |

**Verdict** : Gemini n'a pas de vocabulaire fort pour ces paliers. À renforcer avec descriptions visuelles : `light` → « slight widow's peak with mildly receded temples » ; `moderate` → « clearly receded hairline forming an M-shape » ; `strong` → « pronounced receding hairline with high temples ».

---

## 17. STYLE VESTIMENTAIRE — `avatar_clothing_style`

Mapping : `CLOTHING_STYLE_DESC` (AD:27-34).

| UI FR | Tech | Prompt | Statut |
|---|---|---|---|
| Sobre du quotidien | `casual_modest` | "modest casual clothing, simple cotton sweater or shirt" | 🟠 |
| Couches simples | `simple_layered` | "simple layered everyday clothing" | 🟠 |
| Pratique et chaud | `practical_warm` | "practical warm clothing, cardigan or jumper" | 🟠 |
| Classique épuré | `classic_simple` | "classic simple clothing, soft knit" | 🟠 |
| Gilet doux | `soft_cardigan` | "soft cardigan over a simple top" | ✅ |
| Modeste et chaleureux | `modest_warm` | "modest warm clothing, shawl or wool layer" | ✅ (châle = signal) |

**Verdict** : 6 valeurs ⇒ 3 visuels (pull / cardigan / châle). Les 4 premières produisent quasi la même image (pull simple sobre). Recommandation : **fusionner en 3-4 valeurs distinctes** (Pull simple / Chemise / Cardigan / Châle).

---

## 18. PALETTE VESTIMENTAIRE — `avatar_clothing_color_palette`

Mapping : `PALETTE_DESC` (AD:36-42). 5 palettes nommées avec couleurs explicites — ✅ best-in-class avec NOSE_DESC.

---

## 19. AIDE MOBILITÉ — `avatar_mobility_aid`

Mapping : Création dans bloc inline `MOBILITY` (AD:239-251), édition `MOBILITY_DESC` (AD:325-335). **Légère divergence** (création plus riche : "dignified posture", "hands on the lap", etc. ; édition plus brève).

9 valeurs, chacune avec un objet visuel distinct. ✅ Tous différenciés. Recommandation mineure : aligner création et édition en utilisant le même dictionnaire pour éviter une dérive visuelle entre les deux modes.

---

## 20. COUVRE-CHEF — `avatar_head_covering`

Mapping : Création inline `HEAD_COVERING` (AD:207-214), édition `HEAD_COVERING_DESC` (AD:336-344). **Idem mobility : deux dictionnaires séparés, légèrement divergents** (création plus contextuelle).

7 valeurs, ✅ toutes distinctes. Recommandation : factoriser en un dictionnaire unique partagé.

---

## 21. STYLE CULTUREL — `avatar_cultural_style`

Mapping : `CULTURAL_STYLE_DESC` (AD:44-50).

| UI FR | Tech | Prompt | Statut |
|---|---|---|---|
| Européen neutre | `neutral_european` | **""** (chaîne vide) | 🔴 fantôme |
| Moderne sobre | `soft_modern` | **""** (chaîne vide) | 🔴 fantôme |
| Méditerranéen subtil | `subtle_mediterranean` | "with subtle Mediterranean styling cues (kept understated)" | 🟡 vague |
| Afrique de l'Ouest, subtil | `subtle_west_african` | "with subtle West African styling cues (kept understated, no traditional dress)" | 🟡 |
| Afrique centrale, subtil | `subtle_central_african` | "with subtle Central African styling cues (kept understated)" | 🟡 |

**Verdict** : 2 fantômes (`neutral_european`, `soft_modern`) qui n'ont aucun effet — acceptable comme « baseline », mais à documenter. Les 3 autres trop abstraits pour Gemini : « subtle cues » ne produit quasi rien. Recommandation : renforcer avec un détail concret tolérable (« warm earth tones in the garment, simple silver pendant », etc.) ou retirer.

---

## Récapitulatif transversal

### Valeurs trop proches (à fusionner ou renommer)
1. `hair_length`: `shoulder` ≈ `medium`
2. `hair_volume`: `fine` ≈ `light`
3. `hair_type`: `curly` ≈ `coily` (visuellement chez Gemini)
4. `hair_style`: `softly_tied` ≈ `half_up`, `loose` ≈ baseline, `natural_waves` ≈ hair_type=wavy
5. `expression`: cluster `{calm, serious_soft, reserved}` + `{thoughtful, pensive}` + `{gentle_smile, discreet_smile}`
6. `posture`: `relaxed` ≈ `upright_calm`
7. `clothing_style`: `casual_modest` ≈ `simple_layered` ≈ `classic_simple` ≈ `practical_warm`
8. `body_type`: `very_thin` ≈ `thin` (différence ténue)

### Valeurs fantômes (aucun effet visuel)
- `avatar_cultural_style`: `neutral_european`, `soft_modern` (chaînes vides)
- `avatar_dignity_level` (audit précédent confirmé)

### Doublons inter-attributs
- `tired_level` ⟷ `fatigue_level` ⟷ `expression=tired_but_warm` ⟷ `eye_shape=tired`
- `hair_type=wavy` ⟷ `hair_style=natural_waves`

### Sliders à granularité trompeuse (états visuels < positions UI)
- `tired_level` (6 positions → 3 états)
- `emotional_brightness` (6 → 3, dont baseline silencieuse)
- `bald_level` (20 crans → 3 états)
- `resilience_level` (6 → 2, ≥4 ou rien)
- `fatigue_level` (6 → 2, ≥3 ou rien)

### Incohérence création vs édition
- `hair_length`, `hair_volume`, `hair_style`, `face_shape`, `eye_shape` : **création** envoie la valeur brute (snake_case → espaces), **édition** utilise un dictionnaire riche. Les avatars générés en mode création reçoivent un signal plus faible que ceux édités. À unifier (utiliser le dictionnaire dans les deux modes).
- `mobility_aid`, `head_covering` : deux dictionnaires séparés (inline création vs `_DESC` édition), légères divergences.

### Vérification "same person transformed"
Les blocs `TRANSFORM_BLOCKS` (AD:438-458) couvrent : `body_type`, `age_range`, `expression`. **Manquent** :
- `hair_color`, `hair_length`, `hair_style`, `hair_volume` (changer la coiffure d'une même personne devrait préserver visage/identité)
- `clothing_style`, `clothing_color_palette` (mêmes garanties identité)
- `fatigue_level`, `tired_level`, `emotional_brightness` (transformations émotionnelles)
- `beard`, `moustache`, `bald_level`, `hair_recession` (transformations capillaires masculines)
- `head_covering` (ajout/retrait d'un foulard ne doit pas changer le visage)
- `mobility_aid`, `forehead_mark` (ajout d'un accessoire neutre)

Sans ces blocs, ces attributs reposent uniquement sur les clauses « PRESERVE STRICTLY » génériques de `buildEditPrompt` — globalement suffisantes mais sans la directive explicite « same person whose X has changed ».

---

## Recommandations prioritaires (par ordre d'impact)

### P1 — Élimine la confusion utilisateur (fantômes + sliders trompeurs)
1. Retirer les 2 fantômes `cultural_style` (ou les enrichir).
2. Convertir les 5 sliders en selects à paliers réels (ou enrichir leurs seuils pour rendre chaque palier visuellement distinct).
3. Retirer les doublons `expression=tired_but_warm`, `eye_shape=tired`, `hair_style=natural_waves`.

### P2 — Différenciation visuelle réelle
4. Enrichir `hair_type` (`curly` vs `coily`), `hair_recession`, `face_shape` avec descripteurs visuels concrets.
5. Aligner création et édition : utiliser les `_DESC` dictionnaires dans les deux modes (1 source de vérité).
6. Fusionner `hair_length.shoulder/medium`, `hair_volume.fine/light`, simplifier `clothing_style` (4 → 3 valeurs distinctes).

### P3 — Same person transformed
7. Ajouter `TRANSFORM_BLOCKS` pour `hair_*`, `clothing_*`, `beard`, `moustache`, `bald_level`, `hair_recession`, `head_covering`, `mobility_aid`.

### P4 — Refonte expression
8. Réduire `expression` de 10 à 6-7 valeurs : { gentle_smile, hopeful, calm, thoughtful, resilient, reserved, serious_soft } — supprimer les chevauchements.

---

## Plan de test visuel (à exécuter après chaque correctif P1-P4)

**Protocole** : 3 bénéficiaires de référence (Léa, Irina, 1 homme).

Pour chaque attribut révisé :
1. Partir d'un avatar validé.
2. Générer N avatars couvrant toutes les valeurs de l'enum (1 valeur = 1 image).
3. Présenter les N images **sans étiquette** à un évaluateur humain.
4. Demander : « ces images sont-elles visuellement distinctes ? »
5. Critère de validation : ≥ 80 % des valeurs doivent être identifiables sans connaître l'étiquette.
6. Reporter le taux de différenciation par attribut dans un CSV.

**Cas particuliers** :
- `body_type` : tester séquence `very_thin → thin → average → chubby → heavy` sur Léa — chaque étape doit montrer une progression visible.
- `hair_type` : tester sur 3 ethnies (peau claire / médiane / foncée) pour vérifier `coily` rendu cohérent.
- `expression` : test paire-à-paire pour chaque cluster ambigu.
- `sliders` (tired / brightness / bald / fatigue / resilience) : générer les 6 positions, vérifier visuellement chaque palier.

---

## Périmètre du livrable

Cet audit ne modifie aucun fichier. Aucune table, aucun prompt, aucun composant n'a été touché. Document à valider avant ouverture éventuelle d'une phase d'implémentation (qui ferait l'objet d'un plan séparé respectant les contraintes UI stables et identité préservée).
