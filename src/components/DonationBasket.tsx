import { AnimatePresence, motion } from "framer-motion";
import { Check, Package, Trophy, Leaf, CircleCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useMemo } from "react";
import { EMOTIONAL_FAMILY_LABELS, DONATION_TIERS } from "@/lib/constants";
import type { BasketItem } from "@/lib/basketEngine";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  items: BasketItem[];
  amount: number;
  progressPercent: number;
}

// Dietary/cultural badge config
const DIET_BADGES: Record<string, { label: string; emoji: string; color: string }> = {
  halal: { label: "Halal", emoji: "☪️", color: "border-emerald-400 text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300" },
  kosher: { label: "Casher", emoji: "✡️", color: "border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300" },
  vegan: { label: "Végan", emoji: "🌱", color: "border-green-400 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300" },
  vegetarian: { label: "Végétarien", emoji: "🥬", color: "border-lime-400 text-lime-700 bg-lime-50 dark:bg-lime-950 dark:text-lime-300" },
  sans_porc: { label: "Sans porc", emoji: "🚫🐷", color: "border-orange-400 text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-300" },
  sans_alcool: { label: "Sans alcool", emoji: "🚫🍷", color: "border-rose-400 text-rose-700 bg-rose-50 dark:bg-rose-950 dark:text-rose-300" },
};

function getProductDietBadges(product: BasketItem["product"]): string[] {
  const badges: string[] = [];
  // Only show halal badge if product is specifically halal-certified AND not just a default
  if (product.halal_compatible && (product.contains_pork === false || product.contains_alcohol === false)) {
    badges.push("halal");
  }
  if (product.kosher_compatible && product.category === "alimentaire") badges.push("kosher");
  if (product.vegan) badges.push("vegan");
  else if (product.vegetarian) badges.push("vegetarian");
  // Show "sans porc" only for food items that explicitly exclude pork
  if (product.contains_pork === false && product.category === "alimentaire" && !badges.includes("halal")) {
    badges.push("sans_porc");
  }
  // Show "sans alcool" only for beverages
  if (product.contains_alcohol === false && product.subcategory === "boisson") badges.push("sans_alcool");
  return badges;
}

// Family completion status
const FAMILY_ORDER = ["survival", "dignity", "childhood", "autonomy", "comfort"];
const FAMILY_ICONS: Record<string, string> = {
  survival: "🍞",
  dignity: "🧴",
  childhood: "📚",
  autonomy: "💼",
  comfort: "✨",
};

const DonationBasket = ({ items, amount, progressPercent }: Props) => {
  const [flash, setFlash] = useState(false);
  const [prevCount, setPrevCount] = useState(items.length);

  useEffect(() => {
    if (items.length > prevCount) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      setPrevCount(items.length);
      return () => clearTimeout(t);
    }
    setPrevCount(items.length);
  }, [items.length, prevCount]);

  // Group items by emotional family
  const grouped = items.reduce<Record<string, BasketItem[]>>((acc, item) => {
    const family = item.product.emotional_family || "other";
    if (!acc[family]) acc[family] = [];
    acc[family].push(item);
    return acc;
  }, {});

  const totalProducts = items.reduce((sum, i) => sum + i.quantity, 0);

  // Gamification: which families are filled
  const activeFamilies = Object.keys(grouped);
  const completedFamilies = activeFamilies.filter(
    (f) => f !== "other" && grouped[f].length >= 2
  );

  // Next unlock hint
  const nextTier = DONATION_TIERS.find((t) => t.amount > amount);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        animate={flash ? { backgroundColor: ["hsl(var(--card))", "hsl(157 68% 33% / 0.05)", "hsl(var(--card))"] } : {}}
        transition={{ duration: 0.6 }}
        className="bg-card rounded-2xl p-6 border shadow-card"
      >
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Contenu du colis</h3>
        </div>

        <Progress value={progressPercent} className="h-1.5 mb-4" />

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {Object.entries(grouped).map(([family, familyItems]) => (
              <motion.div
                key={family}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {EMOTIONAL_FAMILY_LABELS[family] || family}
                </p>
                <div className="space-y-1.5">
                  {familyItems.map((item) => {
                    const dietBadges = getProductDietBadges(item.product);
                    return (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, scale: 0.8, height: 0 }}
                        animate={{ opacity: 1, scale: 1, height: "auto" }}
                        exit={{ opacity: 0, scale: 0.8, height: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-background"
                      >
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground flex-1">
                          {item.product.name}
                          {item.quantity > 1 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-1 text-xs font-medium text-primary"
                            >
                              ×{item.quantity}
                            </motion.span>
                          )}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Next unlock hint */}
        {nextTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-xs text-muted-foreground text-center bg-muted/50 rounded-lg py-2 px-3"
          >
            🔓 +{nextTier.amount - amount}€ pour débloquer <span className="font-semibold text-foreground">{nextTier.label}</span>
          </motion.div>
        )}

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <AnimatePresence mode="wait">
            <motion.span
              key={totalProducts}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-sm text-muted-foreground"
            >
              <span className="font-semibold text-foreground">{totalProducts}</span> articles
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={amount}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 4, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xl font-bold text-primary"
            >
              {amount}€
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default DonationBasket;
