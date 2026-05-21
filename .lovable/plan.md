## Objectif

Ajouter un critère **Corpulence** (`avatar_body_type`) dans Avatar Studio, avec 5 niveaux, sans alourdir l'interface — il s'insère naturellement dans la section existante « Vêtements & posture » (qui parle déjà du corps).

## 1. Base de données

Migration : ajout d'une colonne nullable `avatar_body_type text` sur `beneficiaries`. Pas de défaut (laissé vide → champ « Pré-remplir » peut le compléter plus tard si on le souhaite ; pour l'instant pas d'inférence automatique).

## 2. Vocabulaire technique

Dans `src/lib/avatarTraits.ts`, ajout à `AVATAR_VOCAB` :

```
body_type: ["very_thin", "thin", "average", "chubby", "heavy"]
```

Clés techniques en anglais (cohérent avec le reste : `gender`, `skin_tone`…). Le moteur d'inférence et les règles ne sont pas modifiés.

## 3. Traduction française fine

Dans `src/lib/avatarVocabLabels.ts`, ajout d'une entrée `body_type` :

```
very_thin → Très mince
thin      → Mince
average   → Corpulence moyenne
chubby    → Légèrement enveloppée
heavy     → Forte corpulence
```

(formulations neutres et respectueuses, conformes à l'esprit dignité de l'app)

## 4. Habillage visuel

Dans `src/features/avatar-studio/fields.tsx` :

- `FIELD_LABELS.avatar_body_type = "Corpulence"`
- `FIELD_ICONS.avatar_body_type = Scale` (picto inédit, distinct des autres)
- `FIELD_ACCENT.avatar_body_type = "--field-build"`

Dans `src/index.css`, nouveau token de couleur bien séparé des autres :

```
--field-build: 110 35% 38%;   /* vert mousse, clair/sombre */
--field-build (dark): 110 40% 62%;
```

## 5. Intégration dans l'UI

Dans `src/pages/AvatarStudio.tsx` :

- Ajout du champ dans la section **« Vêtements & posture »** (juste après `avatar_posture`, avant `avatar_mobility_aid`), en `<SelectField>` standard avec `accentToken` + `labelFor("body_type")`.
- Mise à jour du tableau `postureKeys` (ou équivalent utilisé pour le compteur de complétion de la section) afin que la corpulence soit comptée.

## 6. Hors périmètre

- Pas de changement de l'edge function `generate-avatar` (le prompt visuel pourra être enrichi dans un second temps si besoin).
- Pas d'auto-inférence à partir du récit (la corpulence est rarement décrite explicitement et toute heuristique serait fragile/intrusive).
- Pas de règle dans `evaluateAvatarRules` pour l'instant.

## Fichiers touchés

- **migration SQL** (nouvelle colonne)
- **édités** : `src/lib/avatarTraits.ts`, `src/lib/avatarVocabLabels.ts`, `src/features/avatar-studio/fields.tsx`, `src/index.css`, `src/pages/AvatarStudio.tsx`
