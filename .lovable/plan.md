

## Plan: Advanced Donation Conversion Mechanisms

### 1. Emergency Micro-Donation Upsell

**New component: `src/components/EmergencyUpsell.tsx`**
- Displays 3 toggleable pack cards (5€ alimentaire, 8€ hygiène, 10€ bébé) with subtle pulse animation on the heart icon
- Only one pack selectable at a time (radio-style toggle)
- framer-motion scale-in animation when pack is selected
- Props: `selectedPack`, `onSelectPack`, callback pattern

**Update `DonationFlow.tsx`**:
- Add state `emergencyPack: { name, amount } | null`
- Insert `EmergencyUpsell` between `DonationBasket` and the donate button
- Update `TaxDeduction` to receive `amount + emergencyPack.amount`
- Update donate button text to show total: "Donner {total}€"
- On submit, store emergency pack info in the `products_sent` JSONB field alongside main products

**Update `TaxDeduction.tsx`**:
- Accept optional `extraAmount` and `extraLabel` props to show the breakdown (Don actuel / Ajout pack / Total / Déduction / Coût réel) — switch from 3-col to 5-row layout when extra is present

### 2. Social Proof System

**New component: `src/components/SocialProof.tsx`**
- Accepts a `variant` prop: `"homepage"`, `"cause"`, `"donation"`, `"confirmation"`
- Queries donation stats from DB via a lightweight RPC or direct count query on `donations` table
- Displays contextual messages in French:
  - Homepage: "{X} personnes ont aidé quelqu'un aujourd'hui." + "Plus de {Y} colis solidaires envoyés."
  - Donation page: "Les donateurs qui aident {name} donnent en moyenne {avg}€." near the CTA
  - Confirmation: "{X} donateurs ont déjà aidé cette semaine."
- Subtle fade-in animation, muted styling, small Users icon

**DB function (migration)**: `get_donation_stats()` — returns `today_count`, `week_count`, `total_count`, `avg_amount_for_beneficiary(id)` using simple aggregates on the donations table. Security definer, accessible to anon.

**Integration points**:
- `Index.tsx`: Add `<SocialProof variant="homepage" />` in the stats section
- `CauseSelection.tsx`: Add below the header
- `DonationFlow.tsx`: Add near the donate button
- `DonationConfirmation.tsx`: Add after the delivery timeline

### 3. Visible Impact System

**New component: `src/components/DonationImpact.tsx`**
- Receives `amount` prop
- Computes and displays impact metrics based on amount thresholds:
  - Products count (interpolated: ~6 at 32€, ~10 at 45€, ~14 at 60€, ~18 at 75€)
  - Meals supported (~4 at 32€, scaling up)
  - Days of essential support (~3 at 32€, ~7 at 75€)
- Each metric shown with an icon (Package, UtensilsCrossed, Calendar) and animated counter
- Progress bars fill as amount increases
- framer-motion `AnimatePresence` for smooth transitions when values change

**Integration**: Insert in `DonationFlow.tsx` between the slider and tax deduction sections

### 4. Enhanced Impact Storytelling (Confirmation)

**Update `DonationConfirmation.tsx`**:
- Accept `emergencyPack` prop to show it if selected
- Add `<SocialProof variant="confirmation" />` 
- Add impact summary section (reuse `DonationImpact` or inline): "Votre don de {X}€ permet {Y} produits essentiels et {Z} jours de soutien."
- Enhance delivery timeline with connecting line between steps (vertical line with dots)

### 5. Conversion-Optimized UI Polish

**Update `DonationSlider.tsx`**:
- Add tier-reached celebration: when slider crosses a tier threshold, briefly highlight the tier label with a scale animation and color pulse
- Add a subtle glow effect on the active tier marker

**Update `DonationBasket.tsx`**:
- Add a gentle background color transition when new products appear (brief green tint)
- Enhance the basket total with a counting animation

**Update donate button in `DonationFlow.tsx`**:
- Add a subtle pulse animation class when amount >= 45€ (higher tiers)
- Warm gradient background shift based on donation amount

---

### Files to Create/Edit

| File | Action |
|---|---|
| `src/components/EmergencyUpsell.tsx` | Create — micro-donation pack selector |
| `src/components/SocialProof.tsx` | Create — social proof messages |
| `src/components/DonationImpact.tsx` | Create — visible impact metrics |
| `src/components/TaxDeduction.tsx` | Edit — support extra pack amount in breakdown |
| `src/pages/DonationFlow.tsx` | Edit — integrate upsell, impact, social proof |
| `src/components/DonationConfirmation.tsx` | Edit — enhanced storytelling + social proof |
| `src/components/DonationSlider.tsx` | Edit — tier celebration animations |
| `src/components/DonationBasket.tsx` | Edit — enhanced entry animations |
| `src/pages/Index.tsx` | Edit — add social proof |
| `src/pages/CauseSelection.tsx` | Edit — add social proof |
| `src/lib/constants.ts` | Edit — add emergency pack definitions + impact thresholds |
| SQL migration | Create `get_donation_stats` RPC function |

### DB Migration

```sql
CREATE OR REPLACE FUNCTION public.get_donation_stats(p_beneficiary_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'today_count', (SELECT count(*) FROM donations WHERE created_at >= CURRENT_DATE),
    'week_count', (SELECT count(*) FROM donations WHERE created_at >= date_trunc('week', now())),
    'total_count', (SELECT count(*) FROM donations),
    'avg_amount', COALESCE(
      (SELECT round(avg(amount)::numeric, 0) FROM donations WHERE beneficiary_id = p_beneficiary_id),
      55
    )
  ) INTO result;
  RETURN result;
END;
$$;
```

No other schema changes needed — emergency packs are stored in the existing `products_sent` JSONB column and `amount` includes the pack total.

