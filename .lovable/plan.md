

## Plan: Différencier le hover des boutons outline et ghost

**Fichier:** `src/components/ui/button.tsx`

**Approche:** Donner au `ghost` un hover plus subtil (muted) et conserver `accent` pour `outline`, créant une hiérarchie visuelle claire.

| Variante | Hover actuel | Hover proposé |
|---|---|---|
| `outline` | `hover:bg-accent hover:text-accent-foreground` | Inchangé |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | `hover:bg-muted hover:text-muted-foreground` |

1 fichier, 1 ligne modifiée.

