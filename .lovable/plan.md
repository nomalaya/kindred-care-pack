
# Diagnostic du pipeline Avatar Studio actuel

## Réponse directe à votre analyse

Le système est aujourd'hui en **Mode C uniquement** : *toujours* une régénération complète text-to-image, même quand un avatar approuvé existe déjà. Il n'existe **aucun mécanisme d'édition contrôlée** d'un avatar existant. Les boutons "Aperçu rapide" et "Générer en HD" produisent strictement la même chose à un modèle près.

## Pipeline actuel — fichiers et flux

### 1. Déclenchement (frontend)
**`src/pages/AvatarStudio.tsx`** — fonction `generate(mode)` (lignes ~289-310)
- Appelle `supabase.functions.invoke("generate-avatar", { body: { beneficiary_id, mode } })`
- `mode = "preview"` → bouton **Aperçu rapide** (raccourci `P`)
- `mode = "final"` → bouton **Générer en HD** (raccourci `G`)
- Aucune image existante n'est transmise. Aucun mécanisme "modifier seulement X".

### 2. Génération (backend)
**`supabase/functions/generate-avatar/index.ts`**
- Charge le bénéficiaire (`select *`)
- Appelle `inferAvatarTraits(b)` pour reconstituer tous les attributs phénotypiques depuis les colonnes `avatar_*`
- Construit un prompt complet via `buildAvatarPrompt(traits)` — **texte pur, aucune image de référence**
- Envoie à `ai.gateway.lovable.dev/v1/chat/completions` avec :
  - `MODEL_PREVIEW = google/gemini-3.1-flash-image-preview` (mode preview)
  - `MODEL_FINAL = google/gemini-3.1-flash-image-preview` (mode final — **identique**)
- Le mode `final` ajoute uniquement une étape QA (`qa-avatar`) + 1 retry si score borderline
- Sauvegarde dans bucket `avatars/` et écrit `avatar_preview_url` ou `avatar_url`

### 3. Prompt utilisé
**`supabase/functions/_shared/avatarArtDirection.ts` — `buildAvatarPrompt()`**

Données injectées (depuis les colonnes `avatar_*` du bénéficiaire) :
- Genre, tranche d'âge, type/longueur/style/volume/couleur de cheveux
- Teint, forme de visage, nez, forme et couleur d'yeux, traits faciaux
- Morphologie, niveau de fatigue, niveau de luminosité émotionnelle
- Barbe/moustache/calvitie (hommes), couvre-chef, marque frontale
- Expression, posture, vêtements, palette, style culturel
- Aide à la mobilité, énergie parentale

**Cadrage** : forcé par `FRAMING_BLOCK` — coupe à la clavicule, sujet à ~70% du canvas, marges de 15% min sur les 4 côtés.

**Fond** : forcé par `buildBackgroundBlock()` — blanc plein `#FFFFFF` edge-to-edge, sans halo/gradient/ombre.

**Aucune notion de seed visuel persistant** : `avatar_seed` existe mais n'est utilisé que comme nonce de prompt (pas comme seed image). Conséquence : **chaque génération produit un visage différent**, même avec attributs identiques. C'est cohérent avec le diagnostic — il n'y a aucune notion de "même personne".

### 4. Différence Aperçu / HD / Régénération
| Action | Modèle | QA | Stockage | Stratégie |
|---|---|---|---|---|
| Aperçu rapide | flash-image-preview | ❌ | `avatar_preview_url` | 1 appel |
| Générer en HD | flash-image-preview (identique) | ✅ | `avatar_url` | 1-2 appels + scoring |
| Régénération | même chose | — | écrase | aucune préservation |

**Conclusion factuelle** : la "régénération" est une création depuis zéro. Le système ne sait pas qu'un avatar approuvé existait.

## Origine des deux gênes visuelles

1. **Coupure basse (clavicule, parfois bord arrondi/dégradé)** : imposée par `FRAMING_BLOCK` (`avatarArtDirection.ts`) — *"the bottom edge of the canvas crops the body at the COLLARBONE LINE"*. Les arrondis/dégradés que vous voyez sont des défauts du modèle malgré la liste de négatifs.
2. **Fond blanc opaque** : imposé par `buildBackgroundBlock()` — *"Pure plain white background (#FFFFFF)"*. Le détourage (transparent) n'est appliqué qu'après clic manuel sur "Nettoyer le fond" (edge function `clean-avatar-background`).

# Évolution proposée

## A. Détourage automatique post-génération (les 2 modes)

Dans `supabase/functions/generate-avatar/index.ts`, après avoir uploadé l'image générée et avant de finaliser, invoquer **automatiquement** `clean-avatar-background` :
- En mode `preview` : juste après l'upload de `preview/${id}.png`
- En mode `final` : juste après l'upload du `${id}.png` validé QA

Conséquence : les bénéficiaires affichent immédiatement le fond importé du bucket `avatar-backgrounds`, **sans clic manuel**. Le fond blanc reste demandé au modèle (le pipeline est plus fiable comme ça, conformément à votre réponse) mais n'est jamais visible.

## B. Nouveau mode "Édition" (préservation visuelle)

Introduire un troisième mode `edit` dans l'edge function, déclenché automatiquement par le frontend quand :
- `avatar_workflow_status === "approved"` ou `"locked"`, OU
- `avatar_url` existe déjà ET les seuls attributs changés depuis la dernière génération sont des attributs "édition douce"

### Logique de routage (frontend, `AvatarStudio.tsx`)
```text
clic "Aperçu rapide"
  ├── pas d'avatar_url ET pas d'avatar_preview_url → mode "preview" (création complète)
  └── avatar_url existe                            → mode "edit"  (édition contrôlée)

clic "Générer en HD"
  ├── pas d'avatar_url           → mode "final" (création complète + QA)
  └── avatar_url existe          → mode "edit_hd" (édition + QA)
```

### Implémentation backend du mode `edit`

Gemini `gemini-3.1-flash-image-preview` accepte des **images d'entrée** dans `messages[].content` (format multimodal). On envoie :
- L'avatar actuel (`avatar_url`) comme image de référence
- Un prompt d'édition minimaliste qui liste **uniquement les attributs réellement modifiés** depuis la génération précédente

Pour détecter les attributs modifiés on compare la ligne `beneficiaries` courante au snapshot du `avatar_prompt` archivé (les traits qui ont servi à la dernière génération sont déjà stockés colonne par colonne). Une fonction `diffTraits(prev, next)` retourne la liste des changements.

### Prompt d'édition (nouveau, `avatarArtDirection.ts`)
```text
EDIT THE PROVIDED IMAGE — preserve everything except the attributes listed below.

PRESERVE (strict): the exact same person, identity, facial structure, pose,
framing, composition, body angle, camera distance, lighting, background,
clothing style, color palette and artistic style of the reference image.

CHANGE ONLY:
- {{liste des attributs modifiés avec leur nouvelle valeur}}

Do not regenerate from scratch. Do not change the face shape. Do not change
the framing or crop. Do not change the background.
```

Aucune réutilisation des blocs `FRAMING_BLOCK` ni `buildBackgroundBlock` en mode édition — c'est crucial : ces blocs forceraient un re-cadrage.

### Garde-fous
- Si la liste des changements est vide → ne pas appeler le modèle (`skipped: "no_changes"`)
- Si plus de N (≈5) attributs changent simultanément ou si un attribut structurel change (genre, tranche d'âge, type de cheveux) → bascule automatique en mode création complète (édition trop divergente, l'identité ne tient pas)
- Conserver l'historique : chaque édition crée une nouvelle ligne `avatar_versions` avec `model_used`, prompt diff, et image source référencée

### Stockage
- Mode `edit` écrit dans `avatar_preview_url` (l'utilisateur doit valider avant que `avatar_url` ne soit remplacé via le bouton existant "Promouvoir l'aperçu")
- Mode `edit_hd` (édition + QA réussi) écrit directement dans `avatar_url` et préserve `avatar_workflow_status = "approved"`

## C. Indicateurs UI (sans changement structurel)

Dans `AvatarStudio.tsx`, juste sous le bouton principal, afficher un libellé contextuel :
- *"Création complète"* (pas d'avatar existant)
- *"Édition contrôlée — basée sur l'avatar approuvé"* (sinon)

Plus la liste compacte des attributs qui seront modifiés au prochain clic (le diff). Aucun nouveau composant lourd, juste un petit bloc texte.

# Fichiers concernés

| Fichier | Nature du changement |
|---|---|
| `supabase/functions/generate-avatar/index.ts` | Ajout des branches `mode === "edit"` et `"edit_hd"`, appel auto à `clean-avatar-background` après chaque upload |
| `supabase/functions/_shared/avatarArtDirection.ts` | Nouvelle fonction `buildEditPrompt(prevTraits, nextTraits, sourceImageUrl)`. Aucun changement aux fonctions existantes |
| `supabase/functions/_shared/avatarTraits.ts` | Ajout d'un helper `diffTraits(prev, next)` retournant la liste des champs modifiés avec libellé humain |
| `src/pages/AvatarStudio.tsx` | Routage `preview/final/edit/edit_hd` côté `generate()`, label contextuel sous le bouton, raccourcis inchangés |
| `src/features/avatar-studio/fields.tsx` | (optionnel) marquer chaque champ comme `structural` ou `soft` pour le seuil de bascule auto |

Aucune migration DB requise : toutes les colonnes nécessaires existent (`avatar_url`, `avatar_preview_url`, `avatar_prompt`, `avatar_workflow_status`, l'historique `avatar_versions`).

# Livrables attendus à la fin de l'implémentation

1. Le clic "Aperçu rapide" sur Léa (avatar approuvé) ne régénère plus un nouveau visage — il modifie seulement les attributs changés (ex : couleur de cheveux châtain) en gardant pose, cadrage, fond et identité
2. Aucun avatar généré ne présente de fond blanc visible (détourage auto)
3. La coupe basse n'est plus problématique en édition (le cadrage de la source est préservé), et reste contrôlée en création
4. Indicateur clair dans l'UI du mode en cours (création vs édition) et des attributs qui seront modifiés
