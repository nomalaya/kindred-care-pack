import { AnimatePresence, motion } from "framer-motion";
import { Check, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { EMOTIONAL_FAMILY_LABELS } from "@/lib/constants";
import type { BasketItem } from "@/lib/basketEngine";

interface Props {
  items: BasketItem[];
  amount: number;
  progressPercent: number;
}

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

  return (
    <motion.div
      animate={flash ? { backgroundColor: ["hsl(var(--card))", "hsl(160 60% 30% / 0.05)", "hsl(var(--card))"] } : {}}
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
                {familyItems.map((item) => (
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
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.product.subcategory || item.product.category}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{totalProducts} articles</span>
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
  );
};

export default DonationBasket;
