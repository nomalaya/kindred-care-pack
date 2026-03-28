import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DONATION_STEPS, STEP_INCREMENT, MAX_DONATION } from "@/lib/constants";
import TaxDeductionOptionC from "@/components/TaxDeductionOptionC";

const STEPS = DONATION_STEPS as unknown as number[];

interface Props {
  value: number;
  onChange: (value: number) => void;
}

function getPrevAmount(current: number): number {
  const idx = STEPS.indexOf(current);
  if (idx > 0) return STEPS[idx - 1];
  if (idx === 0) return current;
  const prev = current - STEP_INCREMENT;
  const lastStep = STEPS[STEPS.length - 1];
  return prev >= lastStep ? prev : lastStep;
}

function getNextAmount(current: number): number {
  const idx = STEPS.indexOf(current);
  if (idx >= 0 && idx < STEPS.length - 1) return STEPS[idx + 1];
  const lastStep = STEPS[STEPS.length - 1];
  if (current < lastStep) {
    const next = STEPS.find((s) => s > current);
    return next || current + STEP_INCREMENT;
  }
  return Math.min(current + STEP_INCREMENT, MAX_DONATION);
}

const DonationAmountSelector = ({ value, onChange }: Props) => {
  const isMin = value <= STEPS[0];
  const isMax = value >= MAX_DONATION;

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
          disabled={isMax}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-6">
        <TaxDeductionOptionC amount={value} />
      </div>
    </div>
  );
};

export default DonationAmountSelector;
