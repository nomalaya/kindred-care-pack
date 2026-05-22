## Objectif

Empêcher toute sauvegarde silencieuse de `short_story` / `emotional_sentence` depuis Avatar Studio vers la fiche publique. L'admin doit confirmer explicitement, après avoir vu un comparatif avant/après.

## Comportement

1. Dans le panneau "Contexte psychosocial" d'Avatar Studio, les boutons **Enregistrer** et **Enregistrer + re-déduire** n'écrivent plus directement en base.
2. Ils ouvrent une boîte de dialogue de confirmation qui :
   - Rappelle clairement : « Ce texte sera **immédiatement visible** par les donateurs sur la fiche publique. »
   - Affiche un diff visuel : ancien texte barré (gris) au-dessus du nouveau texte (encadré primaire), pour chacun des deux champs modifiés.
   - Précise pour le mode re-déduction : les attributs visuels (expression, posture, fatigue…) seront recalculés.
3. Deux actions : **Annuler** (ne sauvegarde rien) ou **Publier sur la fiche** (déclenche la sauvegarde réelle, identique à l'actuelle).
4. Si l'utilisateur ferme le dialogue (Échap / clic extérieur) → équivalent à Annuler.

## Modifications

**`src/features/avatar-studio/ContextPanel.tsx`** (seul fichier touché)
- Ajouter un state `confirmMode: "save" | "reinfer" | null`.
- Les `onClick` des boutons définissent ce state au lieu d'appeler directement `onSave` / `onReinferAndSave`.
- Ajouter un `<AlertDialog>` (shadcn, déjà disponible) piloté par `confirmMode`, contenant le diff avant/après et l'avertissement.
- L'action de confirmation appelle l'ancien handler approprié, puis remet `confirmMode` à `null`.

## Hors périmètre

- Pas de modification de `AvatarStudio.tsx` : les callbacks `onSave` / `onReinferAndSave` restent identiques.
- Pas de migration BDD : le couplage récit ↔ fiche publique reste volontaire (1 narration = 1 source de vérité).
- Pas d'impact sur la sauvegarde des autres attributs visuels (couleur de cheveux, posture…), qui restent en sauvegarde directe.
