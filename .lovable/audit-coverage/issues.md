# Avatar Studio — Problèmes détectés (priorisés)

> **Mode dry-run — strictement lecture seule.**
> Aucun appel à Nano Banana · aucun appel à Gemini · aucun appel au gateway image ·
> aucun appel à `generate-avatar` · aucun appel à `qa-avatar` ·
> aucune lecture DB · aucune écriture DB · aucune génération d'image.
> Analyse statique du code source uniquement.

76 entrées (P0=47 · P1=28 · P2=1).

## P0 — Bloquants — attributs visibles non fonctionnels

- **gender.woman** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **gender.man** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **gender.person** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **age_range.18-25** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **age_range.25-35** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **age_range.35-45** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **age_range.45-55** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **age_range.55-65** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **age_range.65-75** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **age_range.75-85** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **face_shape.oval** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **face_shape.round** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **face_shape.square_soft** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **face_shape.heart** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **face_shape.long** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **clothing_style.casual_modest** — visible UI mais absent du prompt de création
- **clothing_color_palette.sand_ivory** — visible UI mais absent du prompt de création
- **expression.gentle_smile** — visible UI mais absent du prompt de création
- **expression.discreet_smile** — visible UI mais absent du prompt de création
- **expression.tired_but_warm** — visible UI mais absent du prompt de création
- **expression.serious_soft** — visible UI mais absent du prompt de création
- **posture.upright_calm** — visible UI mais absent du prompt de création
- **posture.seated_dignified** — visible UI mais absent du prompt de création
- **parent_energy.practical_parent** — visible UI mais absent du prompt de création
- **parent_energy.tired_but_warm_parent** — visible UI mais absent du prompt de création
- **beard.grey** — visible UI mais absent du prompt de création
- **beard.religious_long** — visible UI mais absent du prompt de création
- **hair_recession.none** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **hair_recession.light** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **hair_recession.moderate** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **hair_recession.moderate** — visible UI mais absent du prompt de création
- **hair_recession.strong** — visible UI mais absent du prompt d'édition (EDIT_VALUE_LABELS manquant)
- **hair_recession.strong** — visible UI mais absent du prompt de création
- **head_covering.hijab_full** — visible UI mais absent du prompt de création
- **forehead_mark.bindi_red** — visible UI mais absent du prompt de création
- **forehead_mark.bindi_black** — visible UI mais absent du prompt de création
- **forehead_mark.bindi_decorative** — visible UI mais absent du prompt de création
- **mobility_aid.wheelchair_manual** — visible UI mais absent du prompt de création
- **mobility_aid.wheelchair_electric** — visible UI mais absent du prompt de création
- **mobility_aid.crutches** — visible UI mais absent du prompt de création
- **mobility_aid.walker** — visible UI mais absent du prompt de création
- **mobility_aid.visible_bandage** — visible UI mais absent du prompt de création
- **mobility_aid.arm_sling** — visible UI mais absent du prompt de création
- **body_type.very_thin** — visible UI mais absent du prompt de création
- **body_type.chubby** — visible UI mais absent du prompt de création
- **body_type.heavy** — visible UI mais absent du prompt de création
- **avatar_dignity_level** — slider exposé en UI mais non comparé par diffTraits (changement silencieux)

## P1 — Cohérence — grammaire, classification, doublons

- **gender.woman** — grammaire visuelle absente (pas d'entrée *_DESC)
- **gender.man** — grammaire visuelle absente (pas d'entrée *_DESC)
- **gender.person** — grammaire visuelle absente (pas d'entrée *_DESC)
- **age_range.18-25** — grammaire visuelle absente (pas d'entrée *_DESC)
- **age_range.25-35** — grammaire visuelle absente (pas d'entrée *_DESC)
- **age_range.35-45** — grammaire visuelle absente (pas d'entrée *_DESC)
- **age_range.45-55** — grammaire visuelle absente (pas d'entrée *_DESC)
- **age_range.55-65** — grammaire visuelle absente (pas d'entrée *_DESC)
- **age_range.65-75** — grammaire visuelle absente (pas d'entrée *_DESC)
- **age_range.75-85** — grammaire visuelle absente (pas d'entrée *_DESC)
- **face_shape.oval** — grammaire visuelle absente (pas d'entrée *_DESC)
- **face_shape.square_soft** — grammaire visuelle absente (pas d'entrée *_DESC)
- **face_shape.heart** — grammaire visuelle absente (pas d'entrée *_DESC)
- **hair_recession.moderate** — grammaire visuelle absente (pas d'entrée *_DESC)
- **hair_recession.strong** — grammaire visuelle absente (pas d'entrée *_DESC)
- **avatar_gender** — comparé par diffTraits mais sans entrée EDIT_VALUE_LABELS
- **avatar_age_range** — comparé par diffTraits mais sans entrée EDIT_VALUE_LABELS
- **avatar_face_shape** — comparé par diffTraits mais sans entrée EDIT_VALUE_LABELS
- **avatar_hair_recession** — comparé par diffTraits mais sans entrée EDIT_VALUE_LABELS
- **avatar_cultural_style_override** — comparé par diffTraits mais sans entrée EDIT_VALUE_LABELS
- **avatar_emotional_brightness** — comparé par diffTraits mais sans entrée EDIT_VALUE_LABELS
- **avatar_hair_type** — classé `structural` dans le code actuel (STRUCTURAL_TRAIT_KEYS). Le reclassement medium+transformative annoncé dans le plan production-ready N'EST PAS APPLIQUÉ. Tout changement (ex: curly→coily) déclenche `requires_confirmation` + full regen au lieu d'edit_hd image-to-image.
- **hair_type.curly ↔ hair_type.coily** — valeurs trop proches : Texture proche en sortie image — vérifier la grammaire (curly = boucles définies, coily = kinky dense)
- **body_type.chubby ↔ body_type.heavy** — valeurs trop proches : Volumes proches, vérifier que la grammaire heavy reste lisible vs chubby
- **hair_length.medium ↔ hair_length.shoulder** — valeurs trop proches : Différence subtile, risque de no_changes visuel
- **hair_style.tousled ↔ hair_style.loose** — valeurs trop proches : Sémantique proche, possible doublon
- **expression.calm ↔ expression.reserved** — valeurs trop proches : Expressions très proches
- **expression.discreet_smile ↔ expression.gentle_smile** — valeurs trop proches : Sourires proches

## P2 — Confort — labels, sliders fins

- **avatar_clothing_style** — classé `soft`. OK pour édition légère; vérifier que la palette est aussi diffée.

