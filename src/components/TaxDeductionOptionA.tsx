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

const TaxDeductionOptionA = ({ amount }: Props) => {
  const deduction = Math.round(amount * 0.75);
  const realCost = amount - deduction;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-full py-8">
        {/* Left circle — donation */}
        <div className="relative z-10 w-40 h-40 rounded-full border-3 border-primary bg-background flex flex-col items-center justify-center text-center shadow-card">
          <span className="text-xs text-muted-foreground mb-1">Je fais un don de</span>
          <span className="text-3xl font-bold text-foreground">
            <AnimatedValue value={`${amount}€`} />
          </span>
        </div>

        {/* SVG curved arrow */}
        <svg
          className="absolute z-20"
          width="80"
          height="60"
          viewBox="0 0 80 60"
          style={{ left: "calc(50% - 40px)", top: "calc(50% - 50px)" }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" className="fill-primary" />
            </marker>
          </defs>
          <path
            d="M 10 50 Q 40 -10 70 50"
            fill="none"
            className="stroke-primary"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        </svg>

        {/* Badge 75% */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute z-30 bg-cta text-cta-foreground rounded-full w-14 h-14 flex items-center justify-center font-bold text-sm shadow-lg"
          style={{ left: "calc(50% - 28px)", top: "calc(50% - 28px)" }}
        >
          75%
        </motion.div>

        {/* Right circle — real cost */}
        <div className="relative z-10 w-32 h-32 rounded-full border-3 border-primary bg-primary/10 flex flex-col items-center justify-center text-center shadow-card -ml-8">
          <span className="text-xs text-muted-foreground mb-1">Mon don me coûte</span>
          <span className="text-2xl font-bold text-primary">
            <AnimatedValue value={`${realCost}€`} />
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Loi Coluche : réduction d'impôt de 75% dans la limite de 2 000€
      </p>
    </div>
  );
};

export default TaxDeductionOptionA;
