# Refonte Avatar Studio

Objectif : simplifier et fluidifier l'Avatar Studio sans toucher à la logique métier (génération, sauvegarde, RLS, edge functions). Toutes les modifications restent dans `src/pages/AvatarStudio.tsx` et composants UI associés.

## 1. Layout 2 colonnes (au lieu de 3)

- Colonne gauche fixe : liste des bénéficiaires (largeur ~320px).
- Colonne droite : panneau principal avec onglets **Visuel** / **Attributs** (au lieu d'afficher les deux côte à côte).
- En dessous de 1280px : la liste devient un Sheet (drawer) ouvert par un bouton dans le header.

## 2. Bouton "Générer" unifié

- Split-button unique : action principale = dernier mode utilisé (Aperçu par défaut), caret ouvre menu (Aperçu / HD / Importer une image).
- "Nettoyer le fond" devient un bouton-overlay sur l'image (comme le bouton Zoom actuel).
- "Approuver" et "Verrouiller" déplacés dans un footer sticky du panneau Visuel.

## 3. Trois onglets de workflow

Remplacer les 6 pills de filtre par 3 onglets clairs :
- **À faire** (draft + failed)
- **À valider** (generated)
- **Validés** (approved + locked)

Sous-filtre discret "uniquement échecs" dans À faire.

## 4. Auto-save silencieux + raccourcis visibles

- Supprimer les badges "Sauvegarde…" clignotants ; n'afficher qu'en cas d'erreur (toast).
- Afficher les raccourcis (P, G, A, L) en hint sous chaque bouton.
- Corriger les flèches ↑/↓ pour sélectionner + scroller la liste vers l'élément actif.

## 5. Éditeur d'attributs amélioré

- Badge "modifié" par section (Identité, Apparence, etc.).
- Bouton "Réinitialiser cette section" à partir des valeurs inférées.
- Popover "Pourquoi cette valeur ?" par champ inféré.

## 6. Carrousel de versions

- Remplacer la grille 8 miniatures par un carrousel horizontal scrollable (jusqu'à 20 versions).
- Version active mise en avant à gauche.
- Comparaison via Shift+clic sur 2 miniatures (overlay split-view).

## 7. Quick wins

- Titre "Avatar Studio" + compteur "200 bénéficiaires" fusionnés dans la toolbar.
- Badge debug déplacé en tooltip sur l'image.
- Header sticky en haut du panneau de droite.

## Détails techniques

- Fichier principal : `src/pages/AvatarStudio.tsx` (refactor en sous-composants `<BeneficiaryList />`, `<StudioToolbar />`, `<VisualPanel />`, `<AttributesPanel />`, `<VersionsCarousel />` dans `src/components/avatar-studio/`).
- Composants shadcn utilisés : `Tabs`, `DropdownMenu` (split button), `Sheet` (drawer mobile), `Popover`, `Tooltip`, `ScrollArea`.
- Aucun changement aux edge functions, à la DB, ni aux hooks de génération/sauvegarde — uniquement réorganisation de l'UI et bindings d'événements existants.
- Raccourcis clavier conservés (P, G, A, L) + nouvelles flèches ↑/↓ via `useEffect` keydown.
- Tokens design system existants conservés (Soleil Émeraude, Inter, fond off-white).

## Hors scope

- Pas de modification de la logique de génération Nano Banana / Pro.
- Pas de modification de la table `beneficiary_avatars` ni des RLS.
- Pas de changement des prompts ou du système d'inférence.
