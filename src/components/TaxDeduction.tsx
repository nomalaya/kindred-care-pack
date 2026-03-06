import { TAX_DEDUCTION_RATE } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  amount: number;
  extraAmount?: number;
  extraLabel?: string;
}

const AnimatedValue = ({ value, className }: { value: string; className?: string }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={value}
      initial={{ y: -5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 5, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {value}
    </motion.div>
  </AnimatePresence>
);

const TaxDeduction = ({ amount, extraAmount, extraLabel }: Props) => {
  const total = amount + (extraAmount || 0);
  const deduction = Math.round(total * TAX_DEDUCTION_RATE);
  const realCost = total - deduction;
  const hasExtra = extraAmount && extraAmount > 0;

  if (hasExtra) {
    return (
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Don actuel</span>
            <AnimatedValue value={`${amount}€`} className="font-semibold text-foreground" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{extraLabel || "Ajout pack urgence"}</span>
            <AnimatedValue value={`+${extraAmount}€`} className="font-semibold text-cta" />
          </div>
          <div className="border-t border-primary/10 pt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Total don</span>
            <AnimatedValue value={`${total}€`} className="text-lg font-bold text-foreground" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Déduction fiscale estimée</span>
            <AnimatedValue value={`−${deduction}€`} className="font-bold text-primary" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coût réel après déduction</span>
            <AnimatedValue value={`${realCost}€`} className="font-bold text-foreground" />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Estimation basée sur le taux de 66% pour les dons aux associations d'intérêt général.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Don</div>
          <AnimatedValue value={`${amount}€`} className="text-lg font-bold text-foreground" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Déduction fiscale</div>
          <AnimatedValue value={`−${deduction}€`} className="text-lg font-bold text-primary" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Coût réel</div>
          <AnimatedValue value={`${realCost}€`} className="text-lg font-bold text-foreground" />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Estimation basée sur le taux de 66% pour les dons aux associations d'intérêt général.
      </p>
    </div>
  );
};

export default TaxDeduction;
