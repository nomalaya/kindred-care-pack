import { motion, AnimatePresence } from "framer-motion";
import { Package, UtensilsCrossed, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MIN_DONATION, MAX_DONATION, IMPACT_METRICS } from "@/lib/constants";

interface Props {
  amount: number;
}

const lerp = (min: number, max: number, t: number) => Math.round(min + (max - min) * t);

const DonationImpact = ({ amount }: Props) => {
  const t = Math.min(1, Math.max(0, (amount - MIN_DONATION) / (MAX_DONATION - MIN_DONATION)));

  const metrics = [
    { icon: Package, label: "Produits essentiels", value: lerp(IMPACT_METRICS.products.min, IMPACT_METRICS.products.max, t), max: IMPACT_METRICS.products.max },
    { icon: UtensilsCrossed, label: "Repas soutenus", value: lerp(IMPACT_METRICS.meals.min, IMPACT_METRICS.meals.max, t), max: IMPACT_METRICS.meals.max },
    { icon: Calendar, label: "Jours de soutien", value: lerp(IMPACT_METRICS.days.min, IMPACT_METRICS.days.max, t), max: IMPACT_METRICS.days.max },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Votre don permet</h3>
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
              <Progress value={(m.value / m.max) * 100} className="h-1.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationImpact;
