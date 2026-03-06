

## Plan: Update Palette 3

**File:** `src/lib/themes.ts` (lines 61–85)

Replace Palette 3 colors with the provided hex values converted to HSL, and reset surfaces to match the default theme.

| Variable | New HSL | Source |
|---|---|---|
| `--primary` | `191 44% 20%` | #1c4149 |
| `--primary-foreground` | `0 0% 100%` | White |
| `--secondary` | `133 46% 69%` | #8ed39d |
| `--secondary-foreground` | `0 0% 10%` | Dark on light green |
| `--cta` | `226 48% 36%` | #2f4088 |
| `--cta-foreground` | `0 0% 100%` | White |
| `--accent` | `60 75% 55%` | #e2e33b |
| `--accent-foreground` | `0 0% 10%` | Dark on yellow |
| `--background` | `25 27% 96%` | Default |
| `--foreground` | `0 0% 18%` | Default |
| `--card` | `0 0% 100%` | Default |
| `--card-foreground` | `0 0% 18%` | Default |
| `--popover` | `0 0% 100%` | Default |
| `--popover-foreground` | `0 0% 18%` | Default |
| `--muted` | `25 15% 92%` | Default |
| `--muted-foreground` | `0 0% 40%` | Default |
| `--border` | `25 15% 88%` | Default |
| `--input` | `25 15% 88%` | Default |
| `--ring` | `191 44% 20%` | Matches primary |

Swatches: `["#1c4149", "#8ed39d", "#e2e33b"]`

Single file, ~25 lines changed.

