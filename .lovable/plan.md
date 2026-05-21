
## Objectif

Garantir que **100% des avatars** suivent le même style graphique : illustration cartoon vectorielle plate (référence : avatar Khaled / avatar Valérie fournis), jamais une peinture, jamais une photo, jamais reconnaissable.

Aujourd'hui le prompt mentionne déjà « cartoon » mais le modèle dérive vers du painterly/Pixar-réaliste (cf. Fatima validée). Il faut **durcir l'art direction** et **régénérer tout le catalogue** existant.

## Plan

### 1. Durcir l'art direction (`supabase/functions/_shared/avatarArtDirection.ts`)

Réécrire `ART_DIRECTION_INVARIANTS` et `NEGATIVE_PROMPT` pour verrouiller un seul style :

- **Style cible explicite** : « flat vector cartoon avatar illustration, clean bold outlines, simple cel-shaded flat colors, minimal detail, sticker-like, Adobe Illustrator style »
- Référence verbale forte : « in the visual style of modern app illustration packs (e.g. Storyset, unDraw character packs, Notion-style avatars) »
- Cadrage : **chest-up bust on plain white background**, pas de gradient sand/ivory (le fond doit être blanc pur et uniforme pour homogénéité catalogue)
- **Anonymat renforcé** : « generic archetypal character, intentionally non-specific facial features, never resemble any real person, no identifying marks »
- Negative prompt élargi : ajouter `no painterly style, no Pixar 3D, no Disney render, no Studio Ghibli, no semi-realistic, no detailed shading, no textured brushstrokes, no painted portrait, no realistic skin, no recognizable likeness, no celebrity resemblance`

### 2. Forcer le modèle d'aperçu ET de génération finale sur le même modèle

Actuellement preview = Flash Image, final = Pro Image → ça produit deux esthétiques différentes. Passer les deux sur `google/gemini-2.5-flash-image` (Nano Banana) qui rend mieux le cartoon plat demandé, ou tester les deux et garder le plus stable. À valider rapidement avec 2-3 aperçus avant d'arrêter le choix.

### 3. QA : ajouter un critère « style conformity »

Dans `supabase/functions/qa-avatar/index.ts`, ajouter au scoring un critère bloquant :
- `style_match` (0-100) : pénalise toute image painterly / 3D / photo / semi-réaliste
- Si `style_match < 70` → rejet automatique même si le reste passe

### 4. Reset + régénération du catalogue

- Marquer les avatars actuellement `validated` comme `draft` (l'avatar Fatima painterly et les ~7 autres existants doivent être refaits)
- Vider `avatar_url` pour qu'ils n'apparaissent plus en prod tant qu'un nouvel aperçu conforme n'est pas validé
- L'utilisateur relance manuellement la génération depuis Avatar Studio (ou via `generate-avatar-batch`)

Migration SQL :
```sql
UPDATE beneficiaries
SET avatar_status = 'draft',
    avatar_workflow_status = 'draft',
    avatar_url = NULL,
    avatar_preview_url = NULL,
    avatar_qa_score = NULL,
    avatar_qa_report = NULL
WHERE avatar_url IS NOT NULL OR avatar_preview_url IS NOT NULL;
```

### 5. Garde-fou UI (`AvatarStudio.tsx`)

Petit rappel visuel dans le panneau de droite : badge « Style : cartoon vectoriel plat — verrouillé » sous l'aperçu, pour bien matérialiser que c'est non négociable.

## Points à confirmer avant implémentation

- OK pour **reset complet** des avatars déjà validés (Fatima, Amadou, Chloé, Diogo, Irina, Jean-Pierre, etc. — ~7 profils) ? Ils repasseront tous par une génération + validation manuelle.
- OK pour **fond blanc pur** plutôt que sable/ivoire (la mémoire `style/visual-direction` parle de blanc cassé chaleureux pour le site, mais pour les avatars un blanc franc donne un catalogue plus homogène façon Storyset) ?
