# Simplification : 1 terme = 1 action + info-bulles contextuelles

Vous avez choisi **Option B** : fusionner "image affichée" et "base de retouche". L'image active sert toujours de point de départ pour la prochaine retouche. Un seul badge, un seul bouton.

## Changements UI (frontend uniquement)

**Vignettes de versions (`src/pages/AvatarStudio.tsx`)**
- Supprimer le badge **Source** (redondant avec Actif).
- Garder uniquement les badges : **Actif**, **HD**, **QA**, date.
- **Info-bulles au survol** :
  - Badge **Actif** : "C'est l'avatar affiché publiquement. Les prochaines retouches partiront de cette image."
  - Bouton **"Utiliser cette version"** : "Remplace l'avatar actif par cette version et en fait la base des futures retouches."
- Menu `…` d'une vignette : retirer "Définir comme base de retouche". Conserver uniquement **"Utiliser cette version"**, Télécharger, Nettoyer le fond, Supprimer.

**Modale d'aperçu**
- Conserver **"Utiliser cette version"** comme action principale.
- **Info-bulle au survol** du bouton : même texte que ci-dessus.
- Retirer toute mention de "base de retouche" / "source".
- Supprimer l'encadré indicateur d'édition contrôlée.

**Panneau central**
- Supprimer l'encadré "Les modifications d'attributs s'appliqueront sur l'avatar actif sans repartir de zéro." (l'utilisateur comprend via les info-bulles).
- Retirer toute étiquette "Source utilisée".

## Changements logique (léger, frontend + un champ backend)

- La prochaine génération `edit`/`edit_hd` prend toujours l'**avatar actif** comme image de base (au lieu de lire un champ `avatar_source_url` distinct).
- Le champ `avatar_source_url` en base n'est plus piloté par l'utilisateur : il est automatiquement aligné sur `avatar_url` à chaque `restoreVersion` / génération réussie. Aucune migration destructive, aucune perte de données historiques (les versions restent dans la table `avatar_versions`).

## Règle finale

| Terme | Effet |
|---|---|
| **Actif** (badge) | Image affichée publiquement ET base de la prochaine retouche |
| **Utiliser cette version** (bouton) | Rend cette version active (et donc base de retouche) |

Aucune régénération IA déclenchée par ce changement.
