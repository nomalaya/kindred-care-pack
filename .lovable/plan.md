

# Page Showcase — Comparaison des 4 solutions Timeline

## Objectif
Créer une page temporaire `/timeline-showcase` qui affiche les 4 solutions côte à côte (A, B, C, D) avec le prénom "Fatima" en exemple, pour que vous puissiez les voir, les comparer et choisir.

## Fichier à créer

### `src/pages/TimelineShowcase.tsx`

Page avec 4 sections, chacune contenant une implémentation fonctionnelle :

**Solution A — Timeline linéaire animée**
- 4 nœuds reliés par une ligne qui se remplit (framer-motion `scaleX`/`scaleY`)
- Horizontal sur desktop, vertical sur mobile
- Nœuds en stagger

**Solution B — Step Cards**
- 4 mini-cards avec icônes, titres, repères temporels
- Première card "active" (bordure primary), les autres en projection (opacité réduite, connecteurs pointillés)
- Horizontal desktop, empilées mobile

**Solution C — Progress bar avec milestones**
- Barre de progression avec 4 points d'arrêt
- Premier nœud rempli (actif), les suivants en outline (à venir)
- Animation de remplissage de la barre
- Pulse léger sur le premier nœud

**Solution D — Reveal progressif**
- Les 4 étapes apparaissent une par une avec un délai de 0.3s
- Fade + slide depuis la gauche
- Effet storytelling

**Commun à toutes** : les 4 étapes (Heart/Aujourd'hui, Package/Demain, Truck/Sous 24h, Gift/Sous 48h) + mention de transparence ShieldCheck + lien espace donateur.

## Fichier à modifier

### `src/App.tsx`
- Ajouter route `/timeline-showcase` → `TimelineShowcase`

## Après choix
La solution retenue remplacera le composant `ImpactTimeline.tsx` et la route showcase sera supprimée.

