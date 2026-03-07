

## Fix: Beneficiary Cards Grid Layout

**Problem:** The grid uses `lg:grid-cols-3` which creates a 3+1 layout with 4 cards.

**Fix:** Change the grid class in `BeneficiarySelection.tsx` from `md:grid-cols-2 lg:grid-cols-3` to `md:grid-cols-2` (removing the 3-column breakpoint). This gives a consistent 2×2 grid on desktop/tablet and 1×4 on mobile.

**Single change** — line 97 and line 105 in `src/pages/BeneficiarySelection.tsx`:
- `grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl` → `grid md:grid-cols-2 gap-6 max-w-5xl`

Both the loading skeleton grid and the beneficiary cards grid use the same class and both need updating.

No other files modified. No content, style, or structure changes to the cards themselves.

