import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { DONATION_TIERS, MIN_DONATION, MAX_DONATION } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  value: number;
  onChange: (value: number) => void;
  progressPercent: number;
}

const DonationSlider = ({ value, onChange, progressPercent }: Props) => {
  const [celebrateTier, setCelebrateTier] = useState<number | null>(null);
  const prevTierRef = useRef(
    DONATION_TIERS.reduce((acc, tier, i) => (value >= tier.amount ? i : acc), 0)
  );

  useEffect(() => {
    const newTierIndex = DONATION_TIERS.reduce((acc, tier, i) => (value >= tier.amount ? i : acc), 0);
    if (newTierIndex > prevTierRef.current) {
      setCelebrateTier(newTierIndex);
      const t = setTimeout(() => setCelebrateTier(null), 800);
      return () => clearTimeout(t);
    }
    prevTierRef.current = newTierIndex;
  }, [value]);

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <div className="mb-4">
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="text-center mb-6">
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-4xl font-bold text-primary inline-block"
          >
            {value}€
          </motion.span>
        </AnimatePresence>
      </div>

      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={MIN_DONATION}
        max={MAX_DONATION}
        step={1}
        className="mb-4"
      />

      <div className="flex justify-between px-1">
        {DONATION_TIERS.map((tier, i) => {
          const isActive = value >= tier.amount;
          const isCelebrating = celebrateTier === i;
          return (
            <button
              key={tier.amount}
              onClick={() => onChange(tier.amount)}
              className={`text-center transition-all ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              <motion.div
                animate={isCelebrating ? { scale: [1, 1.3, 1], color: "hsl(var(--cta))" } : {}}
                transition={{ duration: 0.5 }}
              >
                <div className={`text-xs font-bold ${isActive ? "text-primary" : ""}`}>
                  {tier.amount}€
                </div>
                <div className="text-[10px]">{tier.label}</div>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="tier-glow"
                  className="h-0.5 bg-primary/40 rounded-full mt-1 mx-auto w-6"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DonationSlider;
