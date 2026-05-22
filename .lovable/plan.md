## Problèmes

1. Le champ **Corpulence** est dans la section « Vêtements & posture » alors qu'il devrait être dans « Visage & regard ».
2. La valeur sélectionnée pour `avatar_body_type` est bien sauvegardée en base, mais elle n'est **jamais injectée dans le prompt** envoyé au modèle d'image — l'image ignore donc complètement ce critère.

## Modifications

### 1. Déplacer Corpulence dans « Visage & regard »

**`src/pages/AvatarStudio.tsx`**
- Retirer `"avatar_body_type"` de `clothingKeys` (ligne 922).
- Ajouter `"avatar_body_type"` à `faceKeys` (la liste utilisée par la section « Visage »).
- Retirer le `<SelectField>` Corpulence du bloc « Posture » (ligne 1046).
- Ajouter le `<SelectField>` Corpulence dans le bloc « Visage » (après Teint, avant Expression), même props :
  `icon={FIELD_ICONS.avatar_body_type}`, `accentToken={FIELD_ACCENT.avatar_body_type}`, `labelFor={labelFor("body_type")}`.

Pas de changement sur les couleurs ni les pictos déjà définis.

### 2. Faire en sorte que Corpulence influence réellement l'avatar

**`supabase/functions/_shared/avatarTraits.ts`**
- Ajouter `avatar_body_type?: string | null` dans `BeneficiaryInput`.
- Ajouter `avatar_body_type?: string` dans `AvatarTraits`.
- Dans `inferAvatarTraits`, ajouter le pass-through : `avatar_body_type: b.avatar_body_type ?? undefined`.

**`supabase/functions/_shared/avatarArtDirection.ts`**
- Ajouter une table de descriptions :
  ```ts
  const BODY_TYPE_DESC: Record<string, string> = {
    very_thin:  "very slender, slim build, narrow shoulders and thin face",
    thin:       "slim build, lean face",
    average:    "average build",
    chubby:     "slightly heavier build, rounder face and softer features",
    heavy:      "noticeably heavier build, fuller face, rounded cheeks and broader shoulders",
  };
  ```
- Dans `buildAvatarPrompt`, après la construction de `subject`, pousser dans `extras` :
  ```ts
  if (t.avatar_body_type && BODY_TYPE_DESC[t.avatar_body_type] && t.avatar_body_type !== "average") {
    extras.push(BODY_TYPE_DESC[t.avatar_body_type]);
  }
  ```
  (On exclut `average` car neutre.) Pour `heavy` / `chubby`, l'instruction sur le visage et les épaules force le modèle à modifier morphologie ET visage, ce qui corrige le cas Nguyen.

### Hors périmètre

- Pas de changement de schéma BDD (`avatar_body_type` existe déjà).
- Pas de modification du moteur de matching, ni de `composeBasket`, ni d'`evaluateAvatarRules`.
- Pas d'auto-inférence : la corpulence reste un champ manuel.
- L'utilisateur devra cliquer sur « Générer » à nouveau pour voir l'effet sur les avatars existants (les anciens PNG ne sont pas régénérés automatiquement).
