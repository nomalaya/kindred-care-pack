import { DONATION_TIERS } from "./constants";

// ── Types ──────────────────────────────────────────────────

export interface ProductRecord {
  id: string;
  name: string;
  display_name: string | null;
  category: string;
  subcategory: string | null;
  price: number;
  tier: number;
  product_code: string | null;
  cause_relevance: string[] | null;
  emotional_family: string | null;
  emotional_intensity: number | null;
  culture_tags: string[] | null;
  halal_compatible: boolean | null;
  kosher_compatible: boolean | null;
  vegetarian: boolean | null;
  vegan: boolean | null;
  contains_pork: boolean | null;
  contains_alcohol: boolean | null;
  target_groups: string[] | null;
  gender_specific: string | null;
  season_tag: string | null;
  is_visible_public: boolean | null;
  is_active_product: boolean | null;
  stock_quantity: number | null;
  priority_score: number | null;
  situation_relevance: string[] | null;
  labels: string[] | null;
  cultural_origin_tags: string[] | null;
}

export interface ProfileMapping {
  id: string;
  profile_type: string;
  tier1_family: string;
  tier2_family: string;
  tier3_family: string;
  tier4_family: string;
  min_survival_items: number;
  min_dignity_items: number;
  min_childhood_items: number;
  min_autonomy_items: number;
  religious_filter: string | null;
  cultural_weighting: string | null;
}

export interface BasketItem {
  product: ProductRecord;
  quantity: number;
}

// ── Constants ──────────────────────────────────────────────

const FAMILY_MIN_KEY: Record<string, keyof ProfileMapping> = {
  survival: "min_survival_items",
  dignity: "min_dignity_items",
  childhood: "min_childhood_items",
  autonomy: "min_autonomy_items",
};

const TIER_THRESHOLDS = DONATION_TIERS.map((t) => t.amount);

// ── Engine ─────────────────────────────────────────────────

// ── Cultural region → country mapping ────────────────────────
const CULTURE_REGION_MAP: Record<string, string[]> = {
  maghreb: ["Maroc", "Tunisie", "Algérie"],
  afrique_ouest: ["Sénégal", "Mali", "Côte d'Ivoire", "Guinée", "Cap-Vert", "Togo", "Bénin", "Burkina Faso", "Ghana"],
  afrique_centre: ["Cameroun", "Congo", "RD Congo", "Gabon"],
  afrique_est: ["Comores", "Madagascar", "Maurice"],
  dom: ["Guadeloupe", "Martinique", "Guyane", "Réunion", "Mayotte"],
  portugal: ["Portugal", "Cap-Vert"],
  europe_sud: ["Italie", "Espagne", "Grèce"],
  europe_est: ["Roumanie", "Pologne", "Serbie", "Bulgarie", "Moldavie", "Albanie"],
  turquie: ["Turquie"],
  armenie: ["Arménie", "Géorgie"],
  asie_sud_est: ["Vietnam", "Cambodge", "Laos", "Thaïlande", "Philippines"],
  asie_sud: ["Inde", "Sri Lanka", "Pakistan", "Bangladesh", "Afghanistan"],
  asie_est: ["Chine", "Japon", "Corée du Sud"],
  moyen_orient: ["Liban", "Syrie", "Iran", "Irak", "Égypte", "Palestine", "Jordanie"],
  caraibes: ["Haïti", "Brésil", "Colombie", "Suriname"],
  france: ["France"],
};

interface BasketInput {
  products: ProductRecord[];
  profileMapping: ProfileMapping;
  causeKey: string;
  donationAmount: number;
  dietaryFilters?: string[];
  situationId?: string;
  emotionalNudge?: string;
  cultureTags?: string[];
}

/**
 * Compose a dynamic basket of products based on:
 * - The beneficiary's profile mapping (priority emotional families + minimums)
 * - The donation cause (filters products by cause_relevance)
 * - The donation amount (unlocks families at each tier threshold)
 * - Dietary/religious compatibility filters
 *
 * Algorithm:
 * 1. Filter products by cause, stock, and dietary compatibility
 * 2. Determine active emotional families based on donation amount thresholds
 * 3. Fill minimum required items per family (cheapest first)
 * 4. Fill remaining budget with additional items from active families
 * 5. If budget remains, increase quantities of cheapest basket items
 */
export function composeBasket({
  products,
  profileMapping,
  causeKey,
  donationAmount,
  dietaryFilters = [],
  situationId,
  emotionalNudge,
  cultureTags = [],
}: BasketInput): BasketItem[] {
  // 1. Filter products by cause relevance, stock, and visibility
  let pool = products.filter(
    (p) =>
      (p.cause_relevance ?? []).includes(causeKey) &&
      (p.stock_quantity ?? 0) > 0 &&
      p.is_active_product !== false &&
      p.is_visible_public !== false
  );

  // 1b. Boost products with situation_relevance matching the current situation
  if (situationId) {
    pool = pool.map((p) => ({
      ...p,
      priority_score: (p.situation_relevance ?? []).includes(situationId)
        ? Math.min((p.priority_score ?? 3) + 2, 5)
        : (p.priority_score ?? 3),
    }));
  }

  // 1c. Boost products matching the beneficiary's cultural background
  if (cultureTags.length > 0) {
    const expandedCountries = cultureTags.flatMap(
      (tag) => CULTURE_REGION_MAP[tag] ?? [tag]
    );
    pool = pool.map((p) => {
      const origins = p.cultural_origin_tags ?? [];
      const hasMatch = origins.some((o) =>
        expandedCountries.some((c) => c.toLowerCase() === o.toLowerCase())
      );
      return hasMatch
        ? { ...p, priority_score: Math.min((p.priority_score ?? 3) + 1, 5) }
        : p;
    });
  }

  if (dietaryFilters.includes("halal")) {
    pool = pool.filter(
      (p) => p.halal_compatible && !p.contains_pork && !p.contains_alcohol
    );
  }
  if (dietaryFilters.includes("kosher")) {
    pool = pool.filter((p) => p.kosher_compatible);
  }
  if (dietaryFilters.includes("vegetarian")) {
    pool = pool.filter((p) => p.vegetarian);
  }
  if (dietaryFilters.includes("vegan")) {
    pool = pool.filter((p) => p.vegan);
  }

  // 3. Determine which emotional families are active at this donation amount
  const familyOrder = [
    profileMapping.tier1_family,
    profileMapping.tier2_family,
    profileMapping.tier3_family,
    profileMapping.tier4_family,
  ];

  const activeFamilies: string[] = [];
  for (let i = 0; i < familyOrder.length; i++) {
    if (donationAmount >= TIER_THRESHOLDS[i]) {
      // Avoid duplicates (e.g. comfort appears in multiple tiers)
      if (!activeFamilies.includes(familyOrder[i])) {
        activeFamilies.push(familyOrder[i]);
      }
    }
  }

  // 4. Build basket — first pass: fill minimums per family
  const basket: BasketItem[] = [];
  const usedIds = new Set<string>();
  let remainingBudget = donationAmount;

  for (const family of activeFamilies) {
    const familyProducts = pool
      .filter((p) => p.emotional_family === family && !usedIds.has(p.id))
      .sort((a, b) => (b.priority_score ?? 3) - (a.priority_score ?? 3) || a.price - b.price);

    const minKey = FAMILY_MIN_KEY[family];
    const minItems = minKey ? ((profileMapping[minKey] as number) || 0) : 0;

    let added = 0;
    for (const product of familyProducts) {
      if (added >= minItems) break;
      if (product.price <= remainingBudget) {
        basket.push({ product, quantity: 1 });
        usedIds.add(product.id);
        remainingBudget -= product.price;
        added++;
      }
    }
  }

  // 5. Second pass: fill remaining budget with more products (priority order)
  // If emotionalNudge is set, prioritize that family first
  const fillOrder = emotionalNudge
    ? [emotionalNudge, ...activeFamilies.filter((f) => f !== emotionalNudge)]
    : activeFamilies;

  for (const family of fillOrder) {
    const familyProducts = pool
      .filter((p) => p.emotional_family === family && !usedIds.has(p.id))
      .sort((a, b) => (b.priority_score ?? 3) - (a.priority_score ?? 3) || a.price - b.price);

    for (const product of familyProducts) {
      if (remainingBudget < 1) break;
      if (product.price <= remainingBudget) {
        basket.push({ product, quantity: 1 });
        usedIds.add(product.id);
        remainingBudget -= product.price;
      }
    }
  }

  // 6. If budget still remains, increase quantities of cheapest items
  if (remainingBudget >= 1 && basket.length > 0) {
    const sortedByPrice = [...basket].sort(
      (a, b) => a.product.price - b.product.price
    );
    for (const item of sortedByPrice) {
      while (remainingBudget >= item.product.price) {
        item.quantity++;
        remainingBudget -= item.product.price;
      }
    }
  }

  return basket;
}

// ── Impact Metrics ─────────────────────────────────────────

export interface BasketImpact {
  totalProducts: number;
  familiesCount: number;
  categoriesCount: number;
  families: string[];
  categories: string[];
}

export function computeBasketImpact(basket: BasketItem[]): BasketImpact {
  const totalProducts = basket.reduce((sum, item) => sum + item.quantity, 0);
  const families = [...new Set(basket.map((i) => i.product.emotional_family).filter(Boolean))] as string[];
  const categories = [...new Set(basket.map((i) => i.product.category))];

  return {
    totalProducts,
    familiesCount: families.length,
    categoriesCount: categories.length,
    families,
    categories,
  };
}
