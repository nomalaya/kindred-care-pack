# Avatar Studio — Dry-run prompts

> **Mode dry-run — strictement lecture seule.**
> Aucun appel à Nano Banana · aucun appel à Gemini · aucun appel au gateway image ·
> aucun appel à `generate-avatar` · aucun appel à `qa-avatar` ·
> aucune lecture DB · aucune écriture DB · aucune génération d'image.
> Analyse statique du code source uniquement.

Fragments création + édition par valeur, extraits sans envoi au modèle.

### gender.woman
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### gender.man
- **Création** : a 25-35 year old man, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old man, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### gender.person
- **Création** : a 25-35 year old person, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : REFERENCE SUBJECT (must remain the same person):
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### age_range.18-25
- **Création** : a 18-25 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 18-25 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### age_range.25-35
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### age_range.35-45
- **Création** : a 35-45 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 35-45 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### age_range.45-55
- **Création** : a 45-55 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 45-55 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### age_range.55-65
- **Création** : a 55-65 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 55-65 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### age_range.65-75
- **Création** : a 65-75 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 65-75 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### age_range.75-85
- **Création** : a 75-85 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 75-85 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### skin_tone.fair
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), fair skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, fair skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### skin_tone.light
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### skin_tone.medium
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), medium skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, medium skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### skin_tone.olive
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), olive skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, olive skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### skin_tone.tan
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), tan skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, tan skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### skin_tone.medium_dark
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### skin_tone.dark
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), dark skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, dark skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### skin_tone.deep
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), deep skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, deep skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### hair_type.straight
- **Création** : a 25-35 year old woman, with medium straight smooth hair, no waves, sleek strands dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : straight = smooth, no waves. wavy = soft S-shaped waves, no curls. curly = defined curls / ringlets / spirals. coily = tightly coiled afro-textured hair, dense and kinky — clearly distinct from "curly", not just more curls.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### hair_type.wavy
- **Création** : a 25-35 year old woman, with medium wavy hair with soft S-shaped waves, no curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : straight = smooth, no waves. wavy = soft S-shaped waves, no curls. curly = defined curls / ringlets / spirals. coily = tightly coiled afro-textured hair, dense and kinky — clearly distinct from "curly", not just more curls.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### hair_type.curly
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### hair_type.coily
- **Création** : a 25-35 year old woman, with medium tightly coiled afro-textured hair, dense kinky texture with small tight coils — distinctly coily, not merely curly dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, b
- **Édition** : straight = smooth, no waves. wavy = soft S-shaped waves, no curls. curly = defined curls / ringlets / spirals. coily = tightly coiled afro-textured hair, dense and kinky — clearly distinct from "curly", not just more curls.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : structural

### hair_color.black
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls black hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - couleur de cheveux: black
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### hair_color.dark_brown
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### hair_color.brown
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - couleur de cheveux: brown
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### hair_color.light_brown
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls light brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - couleur de cheveux: light brown
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### hair_color.blonde
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls blonde hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - couleur de cheveux: blonde
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### hair_color.red
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls red hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - couleur de cheveux: red
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### hair_color.auburn
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls auburn hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - couleur de cheveux: auburn
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### hair_color.gray
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls gray hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - couleur de cheveux: gray
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### hair_color.white
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls white hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - couleur de cheveux: white
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### hair_length.very_short
- **Création** : a 25-35 year old woman, with very short clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - longueur de cheveux: very short hair
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_length.short
- **Création** : a 25-35 year old woman, with short clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - longueur de cheveux: short hair
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_length.shoulder
- **Création** : a 25-35 year old woman, with shoulder clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - the exact same pose, body angle, head tilt, shoulder position
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_length.medium
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### hair_length.long
- **Création** : a 25-35 year old woman, with long clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - longueur de cheveux: long hair
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_volume.fine
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, fine volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_volume.natural
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### hair_volume.light
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, light volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_volume.thick
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, thick volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - volume de cheveux: thick, dense hair volume
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.clean_cut
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (clean cut style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.tousled
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (tousled style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - coiffure: tousled hairstyle
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.side_parted
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (side parted style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.loose
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### hair_style.softly_tied
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (softly tied style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - coiffure: softly tied back hairstyle
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.half_up
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (half up style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.natural_waves
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (natural waves style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - coiffure: natural waves hairstyle
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.bun
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (bun style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - coiffure: neat bun hairstyle
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.braided_simple
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (braided simple style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.cornrows
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (cornrows style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - coiffure: cornrows hairstyle
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.box_braids
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (box braids style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - coiffure: box braids hairstyle
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_style.braided_updo
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (braided updo style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : - coiffure: braided updo hairstyle
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### nose.straight
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### nose.aquiline
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, an aquiline nose with a softly curved bridge, almond brown eyes.
- **Édition** : - nez: an aquiline nose with a softly curved bridge
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### nose.rounded
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a softly rounded nose with a gentle tip, almond brown eyes.
- **Édition** : - nez: a softly rounded nose with a gentle tip
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### nose.wide
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a wide nose with broad nostrils, almond brown eyes.
- **Édition** : - nez: a wide nose with broad nostrils
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### nose.narrow
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a narrow, slim nose, almond brown eyes.
- **Édition** : - nez: a narrow, slim nose
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### nose.flat_bridge
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a nose with a low, flat bridge, almond brown eyes.
- **Édition** : - nez: a nose with a low, flat bridge
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### nose.upturned
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a slightly upturned nose, almond brown eyes.
- **Édition** : - nez: a slightly upturned nose
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### face_shape.oval
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### face_shape.round
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, round face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, round face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### face_shape.square_soft
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, square soft face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, square soft face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### face_shape.heart
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, heart face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, heart face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### face_shape.long
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, long face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, long face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### eye_shape.almond
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### eye_shape.round
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, round brown eyes.
- **Édition** : - the exact same background (color, texture, edges)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### eye_shape.soft
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, soft brown eyes.
- **Édition** : - forme des yeux: soft-shaped eyes
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### eye_shape.narrow
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, narrow brown eyes.
- **Édition** : - forme des yeux: narrow eyes
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### eye_shape.hooded
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, hooded brown eyes.
- **Édition** : - forme des yeux: hooded eyelids
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### eye_shape.tired
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, tired brown eyes.
- **Édition** : - forme des yeux: subtly tired eyes
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### eye_shape.deep_set
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, deep_set brown eyes.
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### eye_color.brown
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### eye_color.dark_brown
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond dark_brown eyes.
- **Édition** : - couleur des yeux: deep dark brown eyes
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### eye_color.hazel
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond hazel eyes.
- **Édition** : - couleur des yeux: hazel eyes
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### eye_color.green
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond green eyes.
- **Édition** : - couleur des yeux: green eyes
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### eye_color.blue
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond blue eyes.
- **Édition** : - couleur des yeux: blue eyes
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### eye_color.gray
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond gray eyes.
- **Édition** : - couleur des yeux: soft gray eyes
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_style.casual_modest
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### clothing_style.simple_layered
- **Création** : CLOTHING: simple layered everyday clothing in muted neutrals (cream, soft gray, beige).
- **Édition** : - style vestimentaire: simple layered everyday clothing
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_style.practical_warm
- **Création** : CLOTHING: practical warm clothing, cardigan or jumper in muted neutrals (cream, soft gray, beige).
- **Édition** : - style vestimentaire: practical warm clothing, cardigan or jumper
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_style.classic_simple
- **Création** : CLOTHING: classic simple clothing, soft knit in muted neutrals (cream, soft gray, beige).
- **Édition** : - style vestimentaire: classic simple clothing, soft knit
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_style.soft_cardigan
- **Création** : CLOTHING: soft cardigan over a simple top in muted neutrals (cream, soft gray, beige).
- **Édition** : - style vestimentaire: soft cardigan over a simple top
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_style.modest_warm
- **Création** : CLOTHING: modest warm clothing, shawl or wool layer in muted neutrals (cream, soft gray, beige).
- **Édition** : - style vestimentaire: modest warm clothing, shawl or wool layer
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_color_palette.warm_earth
- **Création** : CLOTHING: modest casual clothing, simple cotton sweater or shirt in warm earth tones (terracotta, ochre, sand).
- **Édition** : - palette vestimentaire: warm earth tones (terracotta, ochre, sand)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_color_palette.muted_neutral
- **Création** : CLOTHING: modest casual clothing, simple cotton sweater or shirt in muted neutrals (cream, soft gray, beige).
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### clothing_color_palette.soft_jewel
- **Création** : CLOTHING: modest casual clothing, simple cotton sweater or shirt in soft jewel tones (dusty teal, faded plum, muted rose).
- **Édition** : - palette vestimentaire: soft jewel tones (dusty teal, faded plum, muted rose)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_color_palette.sand_ivory
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### clothing_color_palette.dusty_blue
- **Création** : CLOTHING: modest casual clothing, simple cotton sweater or shirt in dusty blue and sage tones.
- **Édition** : - palette vestimentaire: dusty blue and sage tones
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### expression.gentle_smile
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### expression.hopeful
- **Création** : EXPRESSION: a hopeful, soft expression, eyes looking slightly upward.
- **Édition** : - expression: a hopeful, soft expression, eyes looking slightly upward
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### expression.calm
- **Création** : EXPRESSION: a calm, peaceful expression, relaxed mouth.
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### expression.discreet_smile
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### expression.tired_but_warm
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### expression.resilient
- **Création** : EXPRESSION: a resilient, composed expression, quiet strength.
- **Édition** : - expression: a resilient, composed expression, quiet strength
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### expression.serious_soft
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### expression.thoughtful
- **Création** : EXPRESSION: a thoughtful, contemplative expression, eyes slightly downward.
- **Édition** : - expression: a thoughtful, contemplative expression, eyes slightly downward
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### expression.pensive
- **Création** : EXPRESSION: a pensive expression, looking slightly away, introspective.
- **Édition** : - expression: a pensive expression, looking slightly away, introspective
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### expression.reserved
- **Création** : EXPRESSION: a reserved, modest expression, soft gaze.
- **Édition** : - expression: a reserved, modest expression, soft gaze
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : light

### posture.upright_calm
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### posture.leaning_slightly
- **Création** : POSTURE: leaning slightly forward, engaged.
- **Édition** : - posture: leaning slightly forward, engaged
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### posture.relaxed
- **Création** : EXPRESSION: a calm, peaceful expression, relaxed mouth.
- **Édition** : - posture: relaxed natural posture
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### posture.protective
- **Création** : POSTURE: protective posture, slightly turned, conveying care.
- **Édition** : - posture: protective posture, slightly turned, conveying care
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### posture.seated_dignified
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### parent_energy.none
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### parent_energy.protective_parent
- **Création** : DETAILS: warm protective parental presence, gentle but watchful.
- **Édition** : - énergie parentale: warm protective parental presence
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### parent_energy.practical_parent
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### parent_energy.tired_but_warm_parent
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### cultural_style.neutral_european
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### cultural_style.soft_modern
- **Création** : (non trouvé)
- **Édition** : - style culturel: soft modern
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### cultural_style.subtle_mediterranean
- **Création** : CLOTHING: modest casual clothing, simple cotton sweater or shirt in muted neutrals (cream, soft gray, beige) with subtle Mediterranean styling cues (kept understated).
- **Édition** : - style culturel: subtle mediterranean
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### cultural_style.subtle_west_african
- **Création** : CLOTHING: modest casual clothing, simple cotton sweater or shirt in muted neutrals (cream, soft gray, beige) with subtle West African styling cues (kept understated, no traditional dress).
- **Édition** : - style culturel: subtle west african
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### cultural_style.subtle_central_african
- **Création** : CLOTHING: modest casual clothing, simple cotton sweater or shirt in muted neutrals (cream, soft gray, beige) with subtle Central African styling cues (kept understated).
- **Édition** : - style culturel: subtle central african
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### beard.none
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### beard.light
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### beard.full
- **Création** : IMAGE FORMAT — STRICT: square 1:1 canvas. Full-bleed illustration. The white background MUST extend all the way to the four edges of the image.
- **Édition** : - barbe: full trimmed beard
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### beard.grey
- **Création** : (non trouvé)
- **Édition** : - barbe: neatly trimmed grey beard
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### beard.religious_long
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### moustache.none
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### moustache.light
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### moustache.full
- **Création** : IMAGE FORMAT — STRICT: square 1:1 canvas. Full-bleed illustration. The white background MUST extend all the way to the four edges of the image.
- **Édition** : - moustache: full moustache
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_recession.none
- **Création** : (non trouvé)
- **Édition** : - dégagement frontal: none
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_recession.light
- **Création** : a 25-35 year old woman, with medium clearly curly hair with defined curls, ringlets or spiral curls dark brown hair (loose style, natural volume), light skin, oval face shape, a straight, balanced nose, almond brown eyes.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_recession.moderate
- **Création** : (non trouvé)
- **Édition** : - dégagement frontal: moderate
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### hair_recession.strong
- **Création** : (non trouvé)
- **Édition** : - dégagement frontal: strong
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### head_covering.none
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### head_covering.light_scarf
- **Création** : DETAILS: a light scarf draped softly on the shoulders, hair fully visible.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face, wearing light scarf.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### head_covering.headscarf
- **Création** : DETAILS: wearing a modest headscarf that partially covers the hair, with a few strands visible at the front.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face, wearing headscarf.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### head_covering.hijab_full
- **Création** : (non trouvé)
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face, wearing hijab full.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### head_covering.taqiyah
- **Création** : DETAILS: wearing a small white taqiyah (Muslim skull cap) on the crown of the head.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face, wearing taqiyah.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### head_covering.turban
- **Création** : DETAILS: wearing a neatly wrapped turban in a muted tone.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face, wearing turban.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### head_covering.kippah
- **Création** : DETAILS: wearing a small discreet kippah on the crown of the head.
- **Édition** : 25-35 year old woman, clearly curly hair with defined curls, ringlets or spiral curls hair, light skin, oval face, wearing kippah.
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : structural

### forehead_mark.none
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### forehead_mark.bindi_red
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### forehead_mark.bindi_black
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### forehead_mark.bindi_decorative
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : light

### mobility_aid.none
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### mobility_aid.wheelchair_manual
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### mobility_aid.wheelchair_electric
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### mobility_aid.cane
- **Création** : DETAILS: holding a wooden walking cane with both hands resting in front, seated or standing calmly.
- **Édition** : - aide à la mobilité: holding a wooden walking cane
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### mobility_aid.crutches
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### mobility_aid.walker
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### mobility_aid.visible_bandage
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### mobility_aid.arm_sling
- **Création** : (non trouvé)
- **Édition** : (non trouvé)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### mobility_aid.oxygen_cannula
- **Création** : DETAILS: wearing a discreet nasal oxygen cannula, kept understated and dignified.
- **Édition** : - aide à la mobilité: wearing a discreet nasal oxygen cannula
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : medium

### body_type.very_thin
- **Création** : (non trouvé)
- **Édition** : For a thinner body type (thin, very_thin): visibly reduce facial fullness, slim the cheeks and jawline, narrow the neck, shoulders and upper bust, and let the garment hang loosely on a slim frame.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : medium

### body_type.thin
- **Création** : DETAILS: slim body, lean face and jawline, slender neck and shoulders, garment lightly fitted on a thin frame.
- **Édition** : For a thinner body type (thin, very_thin): visibly reduce facial fullness, slim the cheeks and jawline, narrow the neck, shoulders and upper bust, and let the garment hang loosely on a slim frame.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : medium

### body_type.average
- **Création** : (non trouvé)
- **Édition** : (no diff)
- **Bloc « same person transformed »** : non
- **Niveau classifyDiff** : none

### body_type.chubby
- **Création** : (non trouvé)
- **Édition** : For a heavier/stronger body type (chubby, heavy): visibly increase facial fullness, cheek roundness, chin softness, jawline softness, neck width and thickness, shoulder breadth, upper-bust volume and garment drape over a larger body.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : medium

### body_type.heavy
- **Création** : (non trouvé)
- **Édition** : For a heavier/stronger body type (chubby, heavy): visibly increase facial fullness, cheek roundness, chin softness, jawline softness, neck width and thickness, shoulder breadth, upper-bust volume and garment drape over a larger body.
- **Bloc « same person transformed »** : oui
- **Niveau classifyDiff** : medium

