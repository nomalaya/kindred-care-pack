

# Fix : barre de progression qui passe par-dessus les nœuds

## Problème
La barre (track + fill animé) a le même `z-index` que les nœuds. Les cercles avec icônes ont `z-10` mais la barre est positionnée en `absolute` sans z-index, ce qui selon le rendu du navigateur peut passer par-dessus.

## Correction

### `src/components/ImpactTimeline.tsx`

**Horizontal (desktop)** :
- Track (`bg-border`) : ajouter `z-0`
- Fill animé (`bg-primary`) : ajouter `z-0`
- Les nœuds gardent `z-10` → ils passent au-dessus de la barre

**Vertical (mobile)** :
- Track : ajouter `z-0`
- Fill animé : ajouter `z-0`
- Les nœuds gardent `z-10`

4 lignes modifiées, 1 fichier.

