## Objectif

1. **Retirer la couleur du libellé** des champs (Genre, Tranche d'âge, etc.) — n'appliquer la couleur d'accent **qu'au picto**.
2. **Réviser les tokens couleur** pour qu'ils soient mnémotechniques (l'utilisateur associe instantanément couleur ↔ attribut).

## Fichiers modifiés

### `src/features/avatar-studio/fields.tsx`

**`FieldLabel`** (lignes 136–159) — retirer l'application de `color` sur le `<Label>` :
- supprimer `style={color ? { color } : undefined}` sur le `<Label>` (ligne 150)
- conserver `style={color ? { color } : undefined}` sur le `<Icon>` uniquement
- résultat : libellé toujours en `text-foreground` neutre, picto coloré

### `src/index.css` — palette `--field-*` raffinée

Conserve la logique sémantique (un token par famille) mais resserre l'évocation :

| Token | Avant | Après (light) | Justification |
|---|---|---|---|
| `--field-identity` (Genre) | violet 275 55% 50% | inchangé | violet = identité, neutre |
| `--field-time` (Âge) | ambre 40 90% 45% | inchangé | ambre = horloge / sablier |
| `--field-face` (Visage) | magenta 325 60% 50% | rose chair 12 65% 55% | évoque le visage humain |
| `--field-skin` (Teint) | terracotta 18 70% 48% | inchangé | parfait pour la peau |
| `--field-build` (Corpulence) | vert mousse 110 35% 38% | gris ardoise 215 15% 45% | morphologie = neutre, pas végétal |
| `--field-mood` (Expression / Luminosité) | corail 5 80% 55% | inchangé | corail = émotion |
| `--field-eye` (Yeux) | bleu cyan 205 80% 42% | inchangé | bleu = iris classique |
| `--field-fatigue` | mauve gris 255 25% 50% | inchangé | mauve = cernes |
| `--field-hair` (Cheveux) | brun 22 55% 30% | inchangé | brun = cheveux |
| `--field-pilosity` (Barbe/Moustache) | olive 90 35% 35% | brun chaud 28 50% 38% | barbe = même registre que cheveux mais distinct |
| `--field-culture` (Couvre-chef, style) | émeraude 150 55% 35% | inchangé | symbolique culturelle douce |
| `--field-clothing` (Vêtements) | indigo 235 55% 55% | inchangé | indigo = textile / denim |
| `--field-body` (Posture, mobilité) | sarcelle 175 65% 32% | inchangé | sarcelle = corps en mouvement |
| `--field-family` (Énergie parentale) | rose poudré 345 65% 58% | inchangé | parental / lien |
| `--field-dignity` (Dignité, résilience) | doré 48 90% 42% | inchangé | doré = valeur, force |

Ajustement parallèle du bloc `.dark` (lignes 121–135) avec les versions désaturées correspondantes pour `--field-face`, `--field-build`, `--field-pilosity`.

### `src/features/avatar-studio/fields.tsx` — `FIELD_ACCENT` (lignes 74–105)

Réassignations pour mieux refléter l'attribut :

- `avatar_emotional_brightness` : `--field-mood` → `--field-dignity` (icône `Sun` → couleur dorée solaire)
- `avatar_body_type` : `--field-build` (qui devient gris ardoise — neutre morphologie)
- Autres mappings inchangés (déjà adaptés)

## Hors scope

- Pas de modification de la logique métier ni des sections.
- Le picto et l'ordre des champs restent identiques.
- Les sliders gardent la couleur d'accent uniquement sur l'icône.
