

## Réorganisation neurodesign de la Palette 8 ("Soleil Émeraude")

L'image source contenait un vert vif caractéristique qui n'apparaît pas dans la palette actuelle. La palette 8 utilise un vert émeraude foncé en primary, un rose en secondary, un jaune en CTA et un orange en accent — mais il manque le vert vif/chartreuse de l'image.

### Analyse du problème
- Le vert vif (~`#59C94B` / vert pomme) de l'image est absent
- L'orange accent (`#D4782A`) n'apporte pas assez de contraste avec le CTA jaune
- Le rose secondary est correct pour l'empathie mais le jaune CTA manque de contraste texte

### Réorganisation proposée

| Rôle | Avant | Après | Hex | Justification |
|------|-------|-------|-----|---------------|
| **Primary** | Émeraude foncé | Émeraude foncé (inchangé) | `#1A8C6A` | Ancrage, confiance — fonctionne bien |
| **Secondary** | Rose `#D98CB8` | Vert vif de l'image | `#5BBF4E` | Le vert manquant — croissance, vitalité, espoir |
| **CTA** | Jaune `#D4A800` | Rose chaud | `#D98CB8` | Le rose crée une urgence empathique douce, meilleur contraste |
| **Accent** | Orange `#D4782A` | Jaune doré | `#D4A800` | Récompense, gamification — complète la triade |

Swatches : `["#1A8C6A", "#5BBF4E", "#D98CB8"]`

### Logique neurodesign
- **Primary foncé > Secondary clair** : contrainte respectée (émeraude foncé > vert vif)
- Le vert vif évoque la nature, le renouveau — très présent dans l'image
- Le rose en CTA est plus efficace qu'en secondary : il crée un point focal émotionnel sur l'action
- Le jaune doré en accent fonctionne pour les badges de récompense sans concurrencer le CTA

### Changement technique
- Modifier l'entrée "Soleil Émeraude" dans `src/lib/themes.ts` (lignes 186-209) :
  - `--secondary` : `107 45% 53%` (vert vif `#5BBF4E`)
  - `--secondary-foreground` : `0 0% 100%`
  - `--cta` : `330 46% 70%` (rose `#D98CB8`)
  - `--accent` : `44 100% 42%` → `40 60% 57%` (jaune doré `#D4A800` → HSL `44 100% 42%` — garder tel quel)
  - Swatches mis à jour

