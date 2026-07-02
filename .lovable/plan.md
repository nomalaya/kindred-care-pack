
Modifications ciblées sur `src/pages/AvatarStudio.tsx`. Aucun changement backend, matching, panier ou schéma.

## 1. Vignettes de la grille (Versions) — nettoyage

Bloc lignes ~1238–1282.

- Retirer le badge « Hist. » (haut-gauche vide pour les non-actives ; badge « Actif » conservé pour l'active).
- Retirer la date relative en bas-gauche.
- Retirer le badge QA en bas-droit (info toujours accessible dans la modale).
- Conservés : ring vert « Actif », badge Aperçu/HD en bas-centre, corbeille en haut-droit.

## 2. Grille tronquée à 4 vignettes

Cause : `flex-1 min-h-0 overflow-y-auto` (ligne 1216) écrasé par la hauteur de la sidebar, scroll interne invisible.

Correctif : remplacer `flex-1 min-h-0 overflow-y-auto auto-rows-max content-start pr-1 pb-1` par `pb-1`. La grille s'étend naturellement, le scroll du panneau parent prend le relais — les 9 vignettes deviennent toutes visibles.

## 3. Modale de détail — refonte compacte

Bloc lignes ~1657–1877.

### 3.1 Titre

- Ligne 1 (DialogTitle) : `Version · {selected.alias_first_name}` + à droite badges `Actif` (si applicable) et `QA {n}` (unique, coloré). Supprimer le badge Type.
- Ligne 2 (DialogDescription) : `selected.short_story` complet, `text-sm text-muted-foreground`.
- Ligne 3 : chips (`Badge variant="secondary"`) des attributs non-nuls, dans l'ordre — Tranche d'âge, Teint, Corpulence, Type de cheveux, Couleur de cheveux, Longueur de cheveux, Tonalité émotionnelle (`avatar_emotional_brightness`), Fatigue visible (`avatar_fatigue_level`). Libellés via `AVATAR_VOCAB`.

### 3.2 Corps — 2 colonnes

**Gauche** (image ~65vh) : image seule, sans overlay QA, sans cartouche « Parcours donateur ».

**Droite** (~260px, fond blanc) :
- **En haut** : rond `<BeneficiaryAvatar size="lg" ...>` seul (fond aléatoire du bucket, cadrage réel), aucun texte, aucun bloc statut/type/QA/fond/date/modèle.
- **En dessous** : bloc d'actions — boutons pleine largeur empilés dans cet ordre :
  1. `Ajuster le cadrage` (visible uniquement si `isActive`) — icône `Crop`
  2. `Nettoyer le fond` (visible si non transparent) — icône `Scissors`
  3. `Utiliser cette version` (variant primaire par défaut, désactivé si `isActive`) — icône `RotateCcw`
  4. `Supprimer` (ghost destructive, libellé sans les points de suspension) — icône `Trash2`

### 3.3 Suppressions

- Supprimer entièrement le `DialogFooter` (lignes 1814–1872).
- Supprimer les boutons `Copier l'URL`, `Télécharger`, `Ouvrir dans un onglet` de la sidebar (lignes 1789–1810) + la fonction `copyUrl`.
- Supprimer le bouton `Fermer` (la croix native de la modale suffit).
- Supprimer `Comparer à l'actif` et tout son écosystème : `compareOpen`, `compareIds`, `canCompareActive`, et le `<Dialog open={compareOpen}>` (lignes 1628–1648).

## Portée

Fichier unique : `src/pages/AvatarStudio.tsx`. Réutilise `AVATAR_VOCAB`, `FIELD_LABELS`, `BeneficiaryAvatar`, `readFramingFromRow` déjà importés. Aucun changement backend, RLS, migration, edge function, matching, panier ou checkout.
