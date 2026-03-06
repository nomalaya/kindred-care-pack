

## Plan: 7 UI Theme Previews for CashForCause

### Approach

Create a dedicated **Theme Comparison page** (`/themes`) with a floating theme switcher. Each theme overrides CSS variables at runtime — no layout or component changes needed.

The page will:
1. Show the current CashForCause interface (homepage hero, cause cards, donation slider, buttons, etc.) rendered as a **scrollable showcase** of key UI sections
2. Provide a **sticky palette selector bar** at the top to switch between Palette 1–7 + the current default
3. Apply the selected theme by setting CSS custom properties on `document.documentElement`

### Implementation

**New file: `src/lib/themes.ts`**
Define 7 theme objects, each mapping CSS variable names to HSL values converted from the provided hex colors:

| Variable | Mapped from |
|---|---|
| `--primary` | Primary #1 (main CTA) |
| `--secondary` | Primary #2 (hover/accents) |
| `--cta` | Primary #1 (same as primary for CTA buttons) |
| `--accent` | Primary #3 (badges, highlights) |
| `--background` | Secondary #3 (lightest) |
| `--foreground` | Secondary #2 (darkest) |
| `--card` | White/near-white from secondary |
| `--muted` | Derived from Secondary #1 |
| `--muted-foreground` | Secondary #1 |
| `--border` | Lightened Secondary #1 |

Each hex will be pre-converted to HSL format (H S% L% without commas, matching the existing CSS variable format).

**New file: `src/pages/ThemeShowcase.tsx`**
A single page that renders representative UI sections inline (not iframes):
- Navbar preview strip
- Hero section (simplified)
- 3 cause cards
- Donation slider + impact preview
- Button samples (primary, secondary, outline, CTA)
- Progress bar
- Card with badge
- Emergency upsell pack preview

A sticky top bar with 8 buttons (Default + Palette 1–7), each showing a small color swatch. Clicking applies the theme by setting CSS variables on `:root`. The active palette is highlighted.

**Update `src/App.tsx`**
Add route: `<Route path="/themes" element={<ThemeShowcase />} />`

### Color Conversions (hex → HSL)

All 7 palettes will be converted. For example:
- Theme 1: `#DF48A6` → `325 70% 58%`, `#2326C1` → `239 70% 45%`, `#DDA120` → `41 76% 50%`
- Theme 5: `#3F9F8B` → `168 43% 44%`, `#E3BB1A` → `47 85% 50%`, `#CB5426` → `17 68% 47%`
- (All 7 fully converted in implementation)

### Key Constraints
- No layout/typography/spacing changes — only CSS variable overrides
- All text remains in French
- WCAG AA contrast ensured by pairing dark foregrounds with light backgrounds (and vice versa)
- Theme selection is ephemeral (not persisted) — refreshing resets to default
- The showcase page reuses existing components directly, so the theme applies authentically

### Files

| File | Action |
|---|---|
| `src/lib/themes.ts` | Create — 7 theme definitions as CSS variable maps |
| `src/pages/ThemeShowcase.tsx` | Create — showcase page with palette switcher |
| `src/App.tsx` | Edit — add `/themes` route |

