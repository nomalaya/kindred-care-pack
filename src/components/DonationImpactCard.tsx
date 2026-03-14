import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import type { BasketItem } from "@/lib/basketEngine";

interface Props {
  beneficiaryName: string;
  basket: BasketItem[];
  hasFamily?: boolean;
}

const AnimatedNum = ({ value }: { value: number }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 6, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="font-bold text-foreground"
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const DonationImpactCard = ({ beneficiaryName, basket, hasFamily }: Props) => {
  const metrics = useMemo(() => {
    let foodProducts = 0;
    let mealProducts = 0;
    let hygieneProducts = 0;

    for (const item of basket) {
      const cat = item.product.category;
      const sub = item.product.subcategory || "";
      if (cat === "alimentaire") {
        foodProducts += item.quantity;
        // Count meal-like products
        if (["conserve", "féculent", "plat", "céréale", "légumineuse"].some((k) => sub.includes(k)) || item.product.name.toLowerCase().includes("repas")) {
          mealProducts += item.quantity;
        }
      }
      if (cat === "hygiene" || cat === "hygiène") {
        hygieneProducts += item.quantity;
      }
    }

    // Estimate meals: at least food products / 2, minimum 1 if food exists
    const meals = foodProducts > 0 ? Math.max(Math.round(foodProducts * 0.7), 1) : 0;

    return { meals, foodProducts, hygieneProducts };
  }, [basket]);

  const lines = [
    metrics.meals > 0 && { emoji: "🍽️", text: `${metrics.meals} repas essentiels`, value: metrics.meals },
    metrics.foodProducts > 0 && { emoji: "🥫", text: `${metrics.foodProducts} produits alimentaires`, value: metrics.foodProducts },
    metrics.hygieneProducts > 0 && { emoji: "🧴", text: `${metrics.hygieneProducts} produits d'hygiène`, value: metrics.hygieneProducts },
    hasFamily && { emoji: "👨‍👩‍👧", text: "Soutien pour sa famille", value: 0 },
  ].filter(Boolean) as { emoji: string; text: string; value: number }[];

  if (lines.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Votre aide pour {beneficiaryName}
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
            <span className="text-sm text-foreground">
              {line.value > 0 ? (
                <>
                  <AnimatedNum value={line.value} />{" "}
                  {line.text.replace(/^\d+\s/, "")}
                </>
              ) : (
                line.text
              )}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DonationImpactCard;
