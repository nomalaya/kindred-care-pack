import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DONATION_STEPS, TAX_DEDUCTION_RATE } from "@/lib/constants";

const STEPS = DONATION_STEPS as unknown as number[];

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const STEP_INCREMENT = 15;

function getPrevAmount(current: number): number {
  const idx = DONATION_STEPS.indexOf(current);
  if (idx > 0) return DONATION_STEPS[idx - 1];
  if (idx === 0) return current; // already at minimum
  // Beyond predefined steps — go down by increment
  const prev = current - STEP_INCREMENT;
  const lastStep = DONATION_STEPS[DONATION_STEPS.length - 1];
  return prev >= lastStep ? prev : lastStep;
}

function getNextAmount(current: number): number {
  const idx = DONATION_STEPS.indexOf(current);
  if (idx >= 0 && idx < DONATION_STEPS.length - 1) return DONATION_STEPS[idx + 1];
  // At or beyond last step — increment by STEP_INCREMENT
  const lastStep = DONATION_STEPS[DONATION_STEPS.length - 1];
  if (current < lastStep) {
    // Find next step above current
    const next = DONATION_STEPS.find((s) => s > current);
    return next || current + STEP_INCREMENT;
  }
  return current + STEP_INCREMENT;
}

const DonationAmountSelector = ({ value, onChange }: Props) => {
  const deduction = Math.round(value * TAX_DEDUCTION_RATE);
  const realCost = value - deduction;
  const isMin = value <= DONATION_STEPS[0];

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <div className="flex items-center justify-center gap-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 shrink-0"
          onClick={() => onChange(getPrevAmount(value))}
          disabled={isMin}
        >
          <Minus className="h-5 w-5" />
        </Button>

        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-5xl font-bold text-primary tabular-nums min-w-[120px] text-center"
          >
            {value}€
          </motion.span>
        </AnimatePresence>

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 shrink-0"
          onClick={() => onChange(getNextAmount(value))}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Fiscal display */}
      <div className="mt-5 flex justify-center gap-8">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Déduction fiscale</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={deduction}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 4, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold text-primary"
            >
              −{deduction}€
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-0.5">Coût réel</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={realCost}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 4, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold text-foreground"
            >
              {realCost}€
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Réduction de 66% pour les dons aux associations d'intérêt général.
      </p>
    </div>
  );
};

export default DonationAmountSelector;
