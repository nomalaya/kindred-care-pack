import { motion, AnimatePresence } from "framer-motion";

interface Props {
  amount: number;
}

const AnimatedValue = ({ value }: { value: string }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ y: -5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 5, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const TaxDeductionOptionB = ({ amount }: Props) => {
  const deduction = Math.round(amount * 0.75);
  const realCost = amount - deduction;
  const recoveredPct = 75;
  const costPct = 25;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-center mb-4">
        <span className="text-sm text-muted-foreground">Votre don : </span>
        <span className="text-xl font-bold text-foreground">
          <AnimatedValue value={`${amount}€`} />
        </span>
      </div>

      <div className="relative w-full">
        {/* Badge 75% above junction */}
        <div className="flex justify-center mb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold"
            style={{ marginLeft: `${recoveredPct - 10}%` }}
          >
            −75%
          </motion.div>
        </div>

        {/* Bar */}
        <div className="flex w-full h-12 rounded-lg overflow-hidden border border-border">
          <motion.div
            layout
            className="bg-primary/15 flex items-center justify-center"
            style={{ width: `${recoveredPct}%` }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-sm font-semibold text-primary whitespace-nowrap">
              Récupéré : <AnimatedValue value={`${deduction}€`} />
            </span>
          </motion.div>
          <motion.div
            layout
            className="bg-cta flex items-center justify-center"
            style={{ width: `${costPct}%` }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-xs font-bold text-cta-foreground whitespace-nowrap">
              <AnimatedValue value={`${realCost}€`} />
            </span>
          </motion.div>
        </div>

        {/* Labels below */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Réduction fiscale</span>
          <span className="font-semibold text-foreground">Coût réel</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Loi Coluche : réduction d'impôt de 75% dans la limite de 2 000€
      </p>
    </div>
  );
};

export default TaxDeductionOptionB;
