## Confirmation : oui, le badge "HD" est faux pour les aperçus

**Cause** — `src/pages/AvatarStudio.tsx` ligne 1032 :
```ts
const isHD = !!v.qa_score || (v.image_url && !v.image_url.includes("/preview/"));
```
Mais l'edge function `generate-avatar` archive les aperçus sous `versions/{id}/preview-{ts}.png` (tiret, pas slash). La chaîne `/preview/` n'apparaît donc jamais dans l'URL → tous les aperçus rapides sont étiquetés "HD" à tort.

À noter : actuellement `MODEL_PREVIEW` et `MODEL_FINAL` pointent tous les deux vers `google/gemini-3.1-flash-image-preview` dans `_shared/avatarArtDirection.ts`. Donc la qualité réelle est identique entre les deux modes, mais le badge doit quand même refléter le mode demandé (un "Aperçu rapide" doit s'afficher AP, pas HD).

## Correctif (1 ligne, frontend only)

`src/pages/AvatarStudio.tsx` ligne 1032 → détecter via le préfixe réel du fichier :
```ts
const url = v.image_url || "";
const isPreview = url.includes("/preview-") || url.includes("/preview/");
const isHD = !isPreview && (!!v.qa_score || url.includes("/final-"));
```

Comportement :
- Fichier `versions/{id}/preview-...png` (aperçu rapide) → badge **AP** (ambre)
- Fichier `versions/{id}/final-...png` ou présence d'un `qa_score` → badge **HD** (vert)

Aucun changement backend, aucune régénération nécessaire, les versions existantes seront re-classifiées correctement au prochain rendu.
