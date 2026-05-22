## Conseil sur Aperçu vs HD

**Recommandation : garder les deux**, mais en clarifiant les rôles.

- **Aperçu (Nano Banana 2)** : rapide (~3s) et peu coûteux. Sert à itérer sur le prompt, tester une posture, valider un cadrage. C'est l'outil de travail.
- **HD (Nano Banana Pro)** : plus lent et plus cher. Sert à produire le portrait final approuvable.

Les supprimer reviendrait soit à brûler des crédits HD à chaque essai, soit à priver l'équipe de la qualité finale. Le sélecteur "Modèle" juste à côté fait déjà doublon — c'est lui qu'on peut retirer (le bouton choisit déjà la qualité).

Petit ajustement proposé : retirer le sélecteur "Modèle" devenu redondant et garder les deux boutons **Aperçu** / **HD** avec leur sémantique actuelle.

## Unification des boutons workflow

Remplacer les trois boutons **Approuver / Verrouiller / Déverr.** par **un seul bouton contextuel** qui change de libellé, d'icône et d'action selon l'état actuel :

| État actuel    | Bouton affiché                  | Action            |
|----------------|----------------------------------|-------------------|
| `draft`        | « Approuver » (désactivé + tooltip explicatif) | — |
| `generated`    | « Approuver » (ShieldCheck, primary) | → `approved` |
| `approved`     | « Verrouiller » (Lock, secondary) | → `locked` |
| `locked`       | « Déverrouiller » (Unlock, outline) | → `draft` |

Un second bouton secondaire **« Revenir en arrière »** (icône Undo, petit, ghost) apparaît à droite quand l'état est `approved` (retour à `generated` via `setWorkflow("generated")`) ou `locked` (passe par déverrouillage). Cela remplace la fonction du bouton Déverr. tout en gardant un seul bouton principal mis en avant.

Layout : `flex gap-1.5` avec le bouton principal en `flex-1` et le secondaire en taille auto, au lieu de l'actuelle grille à 3 colonnes.

## Fichier modifié

- `src/pages/AvatarStudio.tsx` (lignes 628–729) :
  - retirer le `<Select>` Modèle (lignes 629–638) et faire passer la rangée à `grid-cols-[1fr_1fr_auto]` pour Aperçu / HD / Importer
  - remplacer le bloc `(() => { ... })()` workflow (lignes 677–729) par le bouton contextuel unique décrit ci-dessus, en réutilisant `workflowHint` pour les tooltips

Aucune modification backend, aucun changement de logique métier — uniquement présentation.
