import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BasketItem } from "@/lib/basketEngine";

interface Props {
  basket: BasketItem[];
  situationId?: string;
}

interface ImpactProfile {
  impact_type_1: string;
  impact_type_2: string;
  impact_type_3: string;
  impact_type_4?: string;
}

/** Map impact_type → which product categories/subcategories to count */
const CATEGORY_MAP: Record<string, { categories: string[]; subcategories?: string[]; excludeSubcategories?: string[] }> = {
  meals: { categories: ["alimentaire"], excludeSubcategories: ["biscuit", "confiserie", "snack", "snack_salé", "chocolat"] },
  breakfasts: { categories: [], subcategories: ["céréales_pdj", "céréales", "tartine", "boisson_chaude", "lait"] },
  quick_meals: { categories: [], subcategories: ["conserve", "pâtes", "légumineuses", "sauce"] },
  kids_snacks: { categories: [], subcategories: ["biscuit", "confiserie", "chocolat", "snack"] },
  hygiene_corps: { categories: ["hygiène"] },
  entretien_maison: { categories: ["entretien"] },
  daily_products: { categories: ["autonomie", "santé"] },
  baby_care: { categories: ["bébé"] },
  wellbeing: { categories: ["bien-être", "boissons"] },
  vetements: { categories: ["vêtements"] },
  jouets: { categories: ["enfant"] },
};

const IMPACT_LABELS: Record<string, { emoji: string; label: (v: number) => string }> = {
  meals: { emoji: "🍽️", label: (v) => `${v} produit${v > 1 ? "s" : ""} alimentaire${v > 1 ? "s" : ""}` },
  breakfasts: { emoji: "☕", label: (v) => `${v} petit${v > 1 ? "s" : ""}-déjeuner${v > 1 ? "s" : ""}` },
  quick_meals: { emoji: "🥫", label: (v) => `${v} repas rapide${v > 1 ? "s" : ""}` },
  kids_snacks: { emoji: "🧒", label: (v) => `${v} goûter${v > 1 ? "s" : ""} pour les enfants` },
  hygiene_corps: { emoji: "🧼", label: (v) => `${v} produit${v > 1 ? "s" : ""} d'hygiène` },
  entretien_maison: { emoji: "🏠", label: (v) => `${v} produit${v > 1 ? "s" : ""} ménager${v > 1 ? "s" : ""}` },
  daily_products: { emoji: "🧹", label: (v) => `${v} produit${v > 1 ? "s" : ""} du quotidien` },
  baby_care: { emoji: "👶", label: (v) => `${v} produit${v > 1 ? "s" : ""} bébé` },
  wellbeing: { emoji: "🌿", label: (v) => `${v} produit${v > 1 ? "s" : ""} bien-être` },
  vetements: { emoji: "👕", label: (v) => `${v} vêtement${v > 1 ? "s" : ""}` },
  jouets: { emoji: "🧸", label: (v) => `${v} article${v > 1 ? "s" : ""} enfant${v > 1 ? "s" : ""}` },
};

function countForType(basket: BasketItem[], type: string): number {
  const mapping = CATEGORY_MAP[type];
  if (!mapping) return 0;

  let total = 0;
  for (const item of basket) {
    const cat = item.product.category;
    const sub = item.product.subcategory || "";

    // If subcategories are specified, only count matching subcategories
    if (mapping.subcategories && mapping.subcategories.length > 0) {
      if (mapping.subcategories.includes(sub)) {
        total += item.quantity;
      }
      continue;
    }

    // Category match
    if (mapping.categories.includes(cat)) {
      // Exclude specific subcategories if specified
      if (mapping.excludeSubcategories && mapping.excludeSubcategories.includes(sub)) {
        continue;
      }
      total += item.quantity;
    }
  }
  return total;
}

const DonationImpactCard = ({ basket, situationId }: Props) => {
  const [profile, setProfile] = useState<ImpactProfile | null>(null);

  useEffect(() => {
    if (!situationId) return;
    supabase
      .from("impact_profiles")
      .select("impact_type_1, impact_type_2, impact_type_3, impact_type_4")
      .eq("situation_id", situationId)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as unknown as ImpactProfile);
      });
  }, [situationId]);

  const lines = useMemo(() => {
    if (!profile || basket.length === 0) return [];

    const types = [profile.impact_type_1, profile.impact_type_2, profile.impact_type_3, profile.impact_type_4].filter(Boolean) as string[];
    const result: { emoji: string; text: string; value: number }[] = [];

    for (const type of types) {
      const count = countForType(basket, type);
      if (count <= 0) continue;

      const config = IMPACT_LABELS[type];
      if (!config) continue;

      result.push({
        emoji: config.emoji,
        text: config.label(count),
        value: count,
      });
    }

    return result;
  }, [profile, basket]);

  if (lines.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Impact de votre aide
      </h3>
      <div className="space-y-3">
        {lines.map((line) => (
          <motion.div
            key={line.emoji}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-xl">{line.emoji}</span>
            <span className="text-sm text-foreground">{line.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DonationImpactCard;
