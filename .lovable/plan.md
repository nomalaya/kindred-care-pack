

## Plan: Update Palette 1 Colors

**File:** `src/lib/themes.ts` (lines 11–34)

Replace Palette 1 with the new colors:

| Variable | New HSL value | Source |
|---|---|---|
| `--primary` | `235 60% 31%` | #20277D |
| `--secondary` | `334 88% 60%` | #F24392 |
| `--cta` | `243 96% 52%` | #180EFB |
| `--accent` | `138 73% 63%` | #59e67d |
| `--background` | `25 27% 96%` | Default |
| `--card` | `0 0% 100%` | Default |
| `--foreground` | `0 0% 18%` | Default |
| `--muted` | `25 15% 92%` | Default |
| `--ring` | `235 60% 31%` | Matches primary |

Swatches updated to `["#20277D", "#F24392", "#59e67d"]`. Accent foreground set to dark for contrast on the bright green.

Single file edit, ~20 lines changed.

