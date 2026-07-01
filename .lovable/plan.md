
# Objectif

Le panneau central (colonne du milieu de l'Avatar Studio) doit tenir intégralement dans son cadre : aucun élément coupé, et la section **Versions** doit occuper tout l'espace vertical restant sous les actions, avec ses vignettes visibles et non tronquées.

# Diagnostic

Aujourd'hui, tout le contenu (bannières + actions + import + indicateur + busy + Versions) est dans un unique conteneur `flex-1 overflow-y-auto` (ligne 1116). Résultat :

- Quand l'espace vertical est serré (viewport 639 px de haut), on scrolle verticalement pour tout voir → la partie Versions se retrouve tout en bas et est coupée.
- Les vignettes Versions sont dans un carrousel **horizontal** unique (`flex gap-1.5 overflow-x-auto`, `w-28 aspect-square`) : elles ne remplissent jamais la hauteur restante, seulement une bande.

# Changements (UI uniquement, `src/pages/AvatarStudio.tsx`)

## 1. Séparer la zone fixe de la zone Versions

Remplacer le conteneur unique scrollable par une colonne flex :

```text
<section flex flex-col min-h-0>
  header (sticky, shrink-0)                 ← inchangé
  ── zone fixe (shrink-0, p-3, space-y-2) ──
    bannières fresh/failed
    actions génération (split-button)
    bouton Importer
    indicateur édition contrôlée
    bannière busy
  ── zone Versions (flex-1 min-h-0 flex flex-col) ──
    en-tête « Versions (n) » + actions sélection (shrink-0)
    bannière source manquante (shrink-0, si présente)
    grille de vignettes (flex-1 min-h-0 overflow-y-auto)
  footer workflow (sticky, shrink-0)        ← inchangé
</section>
```

Ainsi la zone fixe ne peut pas être « poussée hors du cadre » : elle occupe sa hauteur naturelle, et Versions prend tout ce qui reste.

## 2. Versions : grille verticale au lieu du carrousel horizontal

Remplacer `flex gap-1.5 overflow-x-auto` par une grille responsive qui remplit la hauteur :

```text
grid grid-cols-3 gap-1.5 overflow-y-auto pr-1
(vignettes: aspect-square w-full, on retire w-28 et shrink-0/snap)
```

- Sur écrans très étroits la grille reste à 3 colonnes (les vignettes s'adaptent à la largeur disponible → aucune n'est coupée horizontalement).
- Le défilement devient vertical, contenu à la zone Versions uniquement ; la zone fixe du dessus reste toujours visible.
- L'ordre (Actif puis Source puis reste) reste inchangé — c'est simplement le mode d'affichage qui change.

## 3. Menu contextuel des vignettes

Le menu `…` conserve ses actions existantes (Voir en grand / Base de retouche / Utiliser cette version / Supprimer). Aucun changement.

## 4. Aucune modification hors présentation

- Pas de changement de logique métier, pas de changement backend, pas de changement de génération/QA.
- Les composants supprimés lors des étapes précédentes (grande image, encadré « Source utilisée », bouton « Ajuster le cadrage » du panneau) ne reviennent pas.

# Critères d'acceptation

1. À 1204×639 (viewport actuel), le header, les bannières, les actions de génération, le bouton Importer, l'indicateur « ✏️ Ce visage… » et le footer workflow sont visibles **sans scroll**.
2. La section Versions occupe visuellement toute la hauteur restante entre l'indicateur et le footer.
3. Aucune vignette n'est coupée à droite ni en bas ; le défilement des versions est vertical et confiné à leur zone.
4. Sur écrans plus hauts, la grille Versions grandit et affiche plus de vignettes sans scroll.

# Détails techniques

- Fichier unique modifié : `src/pages/AvatarStudio.tsx`, blocs 1116–1483 (restructuration en deux zones flex) et 1346–1478 (carrousel → grille).
- Classes Tailwind uniquement, aucune dépendance ajoutée.
- Le `TooltipProvider` existant et les composants shadcn utilisés restent inchangés.
