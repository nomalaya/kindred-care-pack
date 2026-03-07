

## Audit Results and Correction Plan

### Problem 1: Fewer than 4 beneficiaries displayed

**Root cause:** The database only has 3 beneficiaries for situation `b1000000-...-000000000001`. The `get_empathy_beneficiaries` RPC simply queries `WHERE situation_id = X` with no fallback logic. If fewer than 4 exist, fewer are shown.

**Fix — Two-layer approach:**

1. **Database: Enhance the `get_empathy_beneficiaries` RPC** to implement a fallback waterfall:
   - First, fetch beneficiaries matching the exact `situation_id`
   - If count < 4, fetch additional beneficiaries from the same **cause** (via `situations.cause_id`), excluding already-selected IDs
   - If still < 4, fetch from any active beneficiary with compatible `profile_type`
   - Always return exactly `p_limit` rows (default 4)

2. **Frontend: Loading skeleton** — Change the loading placeholder from 3 to 4 skeleton cards (line 91 of `BeneficiarySelection.tsx`: `[...Array(3)]` → `[...Array(4)]`)

### Problem 2: English text visible in the UI

**Root cause:** The `short_story` and `emotional_sentence` columns in the `beneficiaries` table contain English text for the 3 seed beneficiaries. These are displayed directly on:
- Beneficiary selection cards (`BeneficiarySelection.tsx` lines 148, 151)
- Donation flow profile card (`DonationFlow.tsx` lines 236, 239)

**Fix:**

1. **Data update via SQL:** Update the 3 existing beneficiaries to have French text:
   - `c1000000-...-01` (Samira): `short_story` → "À 31 ans, elle élève seule ses deux enfants et peine à assurer des repas réguliers." / `emotional_sentence` → "Je fais toujours en sorte que mes enfants mangent avant moi."
   - `c1000000-...-02` (Marie): `short_story` → "Après le départ de son compagnon, Marie s'est retrouvée seule avec un nouveau-né et un bambin." / `emotional_sentence` → "Mes enfants sont ma force, même dans les moments les plus difficiles."
   - `c1000000-...-03` (Fatou): `short_story` → "Fatou travaille comme femme de ménage la nuit pour pouvoir s'occuper de ses 3 enfants la journée." / `emotional_sentence` → "Le sommeil est un luxe auquel j'ai renoncé pour que mes enfants aient un avenir."

2. **Also update `children_count`** which is currently 0 for all three mothers (should reflect their stories): Samira → 2, Marie → 2, Fatou → 3.

No other visible English text found in the UI components — all buttons, labels, headings, tooltips, and navigation are already in French.

### Technical Details

**RPC modification** — Replace `get_empathy_beneficiaries` with a function that uses a CTE waterfall:

```text
1. exact_matches   ← WHERE situation_id = p_situation_id (up to p_limit)
2. same_cause      ← JOIN situations to find same cause_id, exclude already selected
3. any_fallback    ← Any active beneficiary, exclude already selected
4. UNION ALL → LIMIT p_limit
```

**Files changed:**
- 1 database migration (new RPC function)
- 1 data update (French translations + children_count)
- `src/pages/BeneficiarySelection.tsx` — skeleton count 3 → 4

**No UI structure changes.** Only data content and backend logic are modified.

