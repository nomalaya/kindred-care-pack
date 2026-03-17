

# Plan : Fix impact decreasing when donation increases

## Root Causes

1. **Async timing**: `impact_units` are re-fetched every time `basket` changes (line 88-98). During the fetch, the `useMemo` runs with the new basket but stale impact data — new products have no match → impact drops to 0 temporarily.

2. **No monotonicity guarantee**: Even after the fetch completes, a higher donation can produce lower impact because the basket engine adds diverse products (dignity, autonomy) that may not contribute to the displayed impact types (e.g., "meals").

## Fix — Single file: `src/components/DonationImpactCard.tsx`

### A. Fetch ALL impact_units once on mount
Remove the `[basket]` dependency and the `.in("product_id", productIds)` filter. The `impact_units` table has ~219 rows — negligible payload. This eliminates the timing issue entirely.

```typescript
useEffect(() => {
  supabase
    .from("impact_units" as any)
    .select("product_id, impact_type, impact_value")
    .then(({ data }) => {
      if (data) setImpactUnits(data as unknown as ImpactUnit[]);
    });
}, []); // once on mount
```

### B. Add a high-water mark via `useRef`
After computing each impact total, take `Math.max(computed, previousMax)`. This guarantees the displayed value never decreases during a session.

```typescript
const highWaterMark = useRef<Record<string, number>>({});

// Inside useMemo, after computing total for each type:
const displayed = Math.max(total, highWaterMark.current[type] || 0);
highWaterMark.current[type] = displayed;
```

Reset the ref when `situationId` changes (different beneficiary).

### Result
18€ → 36€ → 60€ → 90€: impact strictly increases or stays stable, never drops.

