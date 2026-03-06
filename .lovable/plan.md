

## Plan : Appliquer la palette "Soleil Émeraude" sur tout le site

### Approche

Remplacer les variables CSS par défaut dans `src/index.css` (`:root`) par les valeurs de la palette "Soleil Émeraude" définie dans `src/lib/themes.ts`.

### Changement

**Fichier** : `src/index.css`, lignes 8-49

Remplacer les variables actuelles par celles de Soleil Émeraude :

| Variable | Avant | Après |
|---|---|---|
| `--primary` | `160 60% 30%` | `157 68% 33%` |
| `--secondary` | `160 44% 53%` | `107 45% 53%` |
| `--cta` | `5 86% 66%` | `330 65% 52%` |
| `--accent` | `25 27% 93%` | `44 100% 42%` |
| `--accent-foreground` | `0 0% 18%` | `0 0% 100%` |
| `--ring` | `160 60% 30%` | `157 68% 33%` |
| `--sidebar-primary` | `160 60% 30%` | `157 68% 33%` |
| `--sidebar-ring` | `160 60% 30%` | `157 68% 33%` |

Les variables background, card, muted, border, foreground restent identiques (même fond off-white).

