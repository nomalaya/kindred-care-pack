# Avatar Studio — Simulations de diff

15 scénarios, simulation pure (`buildTraitDiffFromKeys` + `classifyDiff`). Aucun appel IA.

| Attribut | Avant | Après | Niveau | Mode attendu | Full regen | Image-to-image |
|---|---|---|---|---|:-:|:-:|
| `avatar_body_type` | `average` | `heavy` | medium | edit_hd | non | oui |
| `avatar_hair_type` | `curly` | `coily` | structural | requires_confirmation (structural → full regen) | oui | non |
| `avatar_hair_color` | `white` | `dark_brown` | light | edit | non | oui |
| `avatar_hair_length` | `medium` | `short` | medium | edit_hd | non | oui |
| `avatar_hair_style` | `loose` | `bun` | medium | edit_hd | non | oui |
| `avatar_expression` | `reserved` | `gentle_smile` | light | edit | non | oui |
| `avatar_posture` | `upright_calm` | `leaning_slightly` | light | edit | non | oui |
| `avatar_beard` | `none` | `full` | medium | edit_hd | non | oui |
| `avatar_mobility_aid` | `none` | `cane` | medium | edit_hd | non | oui |
| `avatar_head_covering` | `none` | `hijab_full` | structural | requires_confirmation (structural → full regen) | oui | non |
| `avatar_skin_tone` | `light` | `dark` | structural | requires_confirmation (structural → full regen) | oui | non |
| `avatar_nose` | `straight` | `aquiline` | structural | requires_confirmation (structural → full regen) | oui | non |
| `avatar_forehead_mark` | `none` | `bindi_red` | light | edit | non | oui |
| `avatar_clothing_style` | `casual_modest` | `soft_cardigan` | light | edit | non | oui |
| `avatar_parent_energy` | `none` | `protective_parent` | light | edit | non | oui |
