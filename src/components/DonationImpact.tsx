import { motion, AnimatePresence } from "framer-motion";
import { Package, Layers, Heart, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { EMOTIONAL_FAMILY_LABELS } from "@/lib/constants";
import type { BasketItem } from "@/lib/basketEngine";
import { computeBasketImpact } from "@/lib/basketEngine";
import { useMemo } from "react";

interface Props {
  amount: number;
  basket?: BasketItem[];
}

const DonationImpact = ({ amount, basket }: Props) => {
  const impact = useMemo(() => {
    if (!basket || basket.length === 0) return null;
    return computeBasketImpact(basket);
  }, [basket]);

  const metrics = impact
    ? [
        { icon: Package, label: "Produits essentiels", value: impact.totalProducts, max: 25 },
        { icon: Layers, label: "Catégories couvertes", value: impact.categoriesCount, max: 8 },
        { icon: Heart, label: "Familles émotionnelles", value: impact.familiesCount, max: 5 },
      ]
    : [
        { icon: Package, label: "Produits essentiels", value: Math.round(6 + (amount - 32) * 0.28), max: 25 },
        { icon: Layers, label: "Catégories couvertes", value: Math.min(8, Math.round(2 + (amount - 32) * 0.12)), max: 8 },
        { icon: Heart, label: "Familles émotionnelles", value: Math.min(5, Math.round(1 + (amount - 32) * 0.09)), max: 5 },
      ];

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Votre don permet</h3>
      </div>
      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <m.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{m.label}</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={m.value}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-bold text-primary"
                  >
                    {m.value}
                  </motion.span>
                </AnimatePresence>
              </div>
              <Progress value={Math.min(100, (m.value / m.max) * 100)} className="h-1.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Show active families */}
      {impact && impact.families.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-3 border-t flex flex-wrap gap-1.5"
        >
          {impact.families.map((f) => (
            <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {EMOTIONAL_FAMILY_LABELS[f] || f}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default DonationImpact;
