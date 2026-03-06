import { TAX_DEDUCTION_RATE } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  amount: number;
}

const TaxDeduction = ({ amount }: Props) => {
  const deduction = Math.round(amount * TAX_DEDUCTION_RATE * 100) / 100;
  const realCost = Math.round((amount - deduction) * 100) / 100;

  return (
    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Don</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={amount}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold text-foreground"
            >
              {amount}€
            </motion.div>
          </AnimatePresence>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Déduction fiscale</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={deduction}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold text-primary"
            >
              −{deduction.toFixed(0)}€
            </motion.div>
          </AnimatePresence>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Coût réel</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={realCost}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold text-foreground"
            >
              {realCost.toFixed(0)}€
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Estimation basée sur le taux de 66% pour les dons aux associations d'intérêt général.
      </p>
    </div>
  );
};

export default TaxDeduction;
