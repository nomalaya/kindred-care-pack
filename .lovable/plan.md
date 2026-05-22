## Problème

Les infobulles sur les boutons « Enregistrer » et « Enregistrer + re-déduire » n'apparaissent pas dans le panneau « Contexte psychosocial » d'Avatar Studio. Deux causes probables :

1. Le panneau est rendu à l'intérieur d'une `Popover` Radix. Un `Tooltip` Radix imbriqué dans une `Popover` est rendu dans un autre portail dont le z-index passe **en-dessous** du contenu Popover ouvert → la bulle existe dans le DOM mais reste invisible.
2. Même si elles s'affichaient, le survol n'est pas un mode de découverte adapté pour des actions admin à fort impact (publication sur la fiche publique).

## Solution

Remplacer le pattern « tooltip au survol » par une **aide pédagogique inline toujours visible**, plus un comportement de découverte progressive :

### 1. Bloc d'aide toujours visible
Sous les deux boutons (uniquement quand `dirty === true`), afficher un petit bloc info compact en deux colonnes :

```
┌──────────────────────────┬──────────────────────────┐
│ 💾 Enregistrer            │ ✨ Enregistrer + re-déduire│
│ Sauvegarde uniquement     │ Sauvegarde + recalcule    │
│ les textes. Les attributs │ tous les attributs visuels│
│ visuels restent inchangés.│ (expression, posture…).   │
└──────────────────────────┴──────────────────────────┘
```

- Texte 10–11px, `text-muted-foreground`, icônes assorties aux boutons.
- Sur mobile, passage en stack vertical.
- Toujours visible dès qu'il y a une modification → impossible à manquer.

### 2. Avertissement régénération
Sous le bloc info, une ligne unique en jaune ambré :

> ⚠️ L'avatar existant n'est pas régénéré automatiquement — cliquez sur « Générer » après pour produire un nouveau portrait.

### 3. Suppression des tooltips Radix
Retirer le `TooltipProvider` + `Tooltip` + `TooltipTrigger` + `TooltipContent` du fichier (cause du bug + redondants avec le bloc inline).

## Modifications

**`src/features/avatar-studio/ContextPanel.tsx`** (seul fichier touché)
- Supprimer l'import et l'usage de `Tooltip*`.
- Garder les boutons simples (sans `TooltipTrigger asChild`).
- Ajouter sous les boutons un `<div>` en grille 2 colonnes (`grid grid-cols-1 sm:grid-cols-2 gap-2`) avec le contenu pédagogique.
- Ajouter en-dessous la ligne d'avertissement régénération.

## Hors périmètre

- Pas de changement de la `AlertDialog` de confirmation (déjà claire).
- Pas de changement de `AvatarStudio.tsx`.
- Pas de changement d'autres composants Avatar Studio.
