## Objectif

Faire d'Avatar Studio un véritable outil de production (vue dense, scan rapide, actions à portée de main) et l'exposer à `/avatar-studio` (l'ancien `/admin/avatar-studio` redirige).

## 1. Nouvelle route

- `src/App.tsx` : ajouter `<Route path="/avatar-studio" element={<AvatarStudio />} />` et remplacer `/admin/avatar-studio` par un `<Navigate to="/avatar-studio" replace />` (compatibilité liens existants).
- `src/pages/Admin.tsx` (et tout lien interne) : mettre à jour la cible vers `/avatar-studio`.
- Garder la garde admin (`isAdmin`) côté page.

## 2. Refonte de la mise en page

Passage d'un layout 3 colonnes statique à un layout **4 zones** plus fonctionnel, pleine hauteur :

```text
┌──────────────── Topbar (sticky) ────────────────────────────────┐
│  ← Admin   Avatar Studio   [stats: 12 draft · 5 generated · …] │
│  [Recherche]  [Filtres: Tous|Brouillon|Généré|Approuvé|Verrou|Échec]  [Tri ▾]  [⟳]│
└─────────────────────────────────────────────────────────────────┘
┌─ Liste (280px) ─┬──── Aperçu + actions (380px) ────┬──── Éditeur attributs (1fr) ─┐
│ vignettes denses│ image carrée + badges            │  Tabs : Visage | Cheveux |  │
│ recherche locale│ Modèle ▾  [Aperçu] [Générer HD]  │  Masculin | Culturel |      │
│ scroll virtuel  │ Workflow: Approuver/Verrouiller  │  Vêtements | Posture |      │
│                 │ Versions (mini-galerie + Comparer)│  Social                    │
└─────────────────┴──────────────────────────────────┴─────────────────────────────┘
```

Changements clés :

- **Topbar sticky** avec stats globales (compteurs par statut) calculées depuis `beneficiaries`, recherche + filtres déplacés ici → la liste de gauche devient plus compacte (uniquement vignettes).
- **Aperçu déplacé au centre** (focus visuel principal de l'outil) avec actions juste en dessous : sélecteur modèle, boutons Aperçu / Générer HD, ligne workflow (Approuver / Verrouiller / Déverrouiller toujours visibles selon l'état), badge style verrouillé, état d'échec.
- **Éditeur d'attributs à droite** : remplacer l'Accordion par des **Tabs verticales** (Visage, Yeux, Cheveux, Masculin*, Culturel*, Vêtements, Posture, Social) → on voit tous les champs d'une section sans scroll, on change de section en 1 clic. Conditionnels (`isMan`, `hasCulture`) en onglets masqués.
- **Bouton "Déduire depuis le profil"** + **raccourcis clavier** (`G` = générer HD, `P` = aperçu, `A` = approuver, `L` = verrouiller, `/` = focus recherche, `↑`/`↓` = naviguer la liste) affichés dans un petit `?` tooltip.
- **Liste de gauche** : vignettes plus denses (avatar + prénom + badge statut + petit indicateur QA), highlight sélection, indicateur "non généré" plus visible. Garder le filtre Échec.
- **Versions** : passer d'une liste verticale à une **mini-galerie 3 colonnes** scrollable sous l'aperçu, clic = aperçu plein écran, sélection multi pour Comparer.
- **Sauvegarde optimiste** : ajouter un petit indicateur "Sauvegardé" / "Sauvegarde…" à côté du nom du bénéficiaire.
- **Garder strictement** les mêmes appels (`generate-avatar`, `qa-avatar`, table `beneficiaries`, `avatar_versions`) et la même logique de génération / workflow / règles. Seule l'organisation visuelle change.

## 3. Détails techniques

- Aucune migration DB.
- Composants shadcn déjà disponibles (`Tabs`, `Tooltip`, `ScrollArea`, `Dialog`) — pas de nouvelle dépendance.
- Utiliser `useHotkeys`-like custom hook minimal (un seul `useEffect` avec `keydown`) pour les raccourcis, scope = page.
- Stats topbar : `useMemo` sur `beneficiaries.reduce(...)`.
- Conserver `RuleList` tel quel sous chaque onglet.
- Layout : `h-[calc(100vh-...)]` + `overflow-hidden` sur le conteneur, scroll uniquement à l'intérieur des 3 colonnes.

## Fichiers modifiés

- `src/App.tsx` — route `/avatar-studio` + redirect.
- `src/pages/AvatarStudio.tsx` — refonte layout + Tabs + topbar + raccourcis.
- `src/pages/Admin.tsx` — mise à jour du lien vers `/avatar-studio`.

Pas de changement backend, pas de changement de la logique de génération ou du style verrouillé déjà en place.
