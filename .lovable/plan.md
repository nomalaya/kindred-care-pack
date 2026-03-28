

# Supprimer le badge "Dans votre pays"

## Constat
"Dans votre pays" (score 40) n'apporte aucune valeur émotionnelle — tous les bénéficiaires sont en France, c'est une évidence. Afficher ce badge dilue la crédibilité des vrais badges de proximité.

## Modifications

### 1. `src/lib/badgeStyles.ts`
- Supprimer l'entrée `"Dans votre pays"` du dictionnaire `BADGE_STYLES`
- Dans `getDisplayBadge()`, filtrer : si `proximity_label === "Dans votre pays"`, l'ignorer et passer aux badges suivants (analyse textuelle, context_badge, etc.)

### 2. Aucune modification SQL
Le RPC continuera à retourner `proximity_label = "Dans votre pays"` pour score 40, mais le frontend l'ignorera. Cela respecte la contrainte de ne pas modifier le moteur de matching.

## Résultat
- Score 100 → "Proche de chez vous" (affiché)
- Score 90 → "Dans votre département" (affiché)
- Score 70 → "Dans votre région" (affiché)
- Score 40 → ignoré, le badge contextuel suivant prend le relais (analyse textuelle, DB, nouveau bénéficiaire, ou fallback)

