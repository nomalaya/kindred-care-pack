import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TAX_DEDUCTION_RATE } from "@/lib/constants";
import TaxInfoLink from "@/components/TaxInfoLink";

interface Props {
  amount: number;
}

const AnimatedValue = ({ value, className }: { value: string; className?: string }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ y: -5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 5, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const TaxDeductionOptionC = ({ amount }: Props) => {
  const deduction = Math.round(amount * TAX_DEDUCTION_RATE);
  const realCost = amount - deduction;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center gap-4 w-full">
        {/* Left card — Donation */}
        <div className="flex-1 bg-card rounded-2xl border border-border p-6 text-center shadow-card">
          <span className="text-xs text-muted-foreground block mb-2">Votre don</span>
          <span className="text-3xl font-bold text-foreground block">
            <AnimatedValue value={`${amount}€`} />
          </span>
        </div>

        {/* Arrow + badge */}
        <div className="relative flex flex-col items-center gap-1 shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="bg-cta text-cta-foreground rounded-full px-3 py-1.5 text-xs font-bold shadow-lg"
          >
            −66%
          </motion.div>
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <ArrowRight className="w-6 h-6 text-primary" />
          </motion.div>
        </div>

        {/* Right card — Real cost */}
        <div className="flex-1 bg-primary/5 rounded-2xl border border-primary/20 p-6 text-center shadow-card">
          <span className="text-xs text-muted-foreground block mb-2">Coût réel après impôt</span>
          <span className="text-3xl font-bold text-primary block">
            <AnimatedValue value={`${realCost}€`} />
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4 inline-flex items-center justify-center w-full">
        Réduction de 66% pour les dons aux associations d'intérêt général
        <TaxInfoLink />
      </p>
    </div>
  );
};

export default TaxDeductionOptionC;
