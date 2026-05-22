## Lien "Voir la fiche donateur" dans Avatar Studio

### Cible du lien
`/donate/:beneficiaryId` — c'est la page que voit le donateur (avatar + alias + récit + phrase émotionnelle). Ouverture dans un **nouvel onglet** pour ne pas perdre l'état de l'éditeur.

### Placement stratégique : 2 endroits complémentaires

**1. Bouton principal — dans le panneau central (preview), juste sous l'image avatar et à côté des badges de workflow** 

C'est l'endroit où l'utilisateur évalue activement le rendu. Un bouton clair :

```
[ Voir la fiche donateur ↗ ]   (variant outline, ExternalLink icon)
```

Placé dans la rangée des badges (ligne 605–613 de `AvatarStudio.tsx`), aligné à droite via `ml-auto`. Visible uniquement quand `selected` existe. Désactivé si l'avatar n'a pas encore d'image (afin d'éviter une fiche vide).

**2. Icône secondaire — dans la liste des bénéficiaires (gauche)**

Petite icône `ExternalLink` discrète à droite de chaque ligne, qui apparaît au survol. Permet de pré-visualiser n'importe quel bénéficiaire sans avoir à le sélectionner d'abord.

### Fichiers modifiés

- **`src/pages/AvatarStudio.tsx`** (zone lignes 605–613) — ajouter le bouton principal :
  ```tsx
  <a
    href={`/donate/${selected.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="ml-auto"
  >
    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
      <ExternalLink className="h-3 w-3" />
      Voir la fiche donateur
    </Button>
  </a>
  ```

- **`src/features/avatar-studio/BeneficiaryListPanel.tsx`** — ajouter une icône `ExternalLink` au survol de chaque ligne, avec `e.stopPropagation()` sur le clic pour ne pas changer la sélection.

- Importer `ExternalLink` depuis `lucide-react` dans les deux fichiers (déjà importé dans `AvatarStudio` ? à vérifier — sinon ajouter).

### Hors scope

- Pas de nouvelle route (réutilisation de `/donate/:beneficiaryId` existante).
- Pas de modification du backend ni du parcours donateur.
- Pas de mode "preview embarqué" (iframe) — la fiche s'ouvre simplement dans un nouvel onglet, plus rapide et plus fidèle.
