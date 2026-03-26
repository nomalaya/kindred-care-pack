import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { getUpsellsForAmount, type UpsellOption } from "@/lib/constants";

interface Props {
  donationAmount: number;
  selectedPack: UpsellOption | null;
  onSelectPack: (pack: UpsellOption | null) => void;
}

const EmergencyUpsell = ({ donationAmount, selectedPack, onSelectPack }: Props) => {
  const upsellOptions = getUpsellsForAmount(donationAmount);

  const handleToggle = (option: UpsellOption) => {
    onSelectPack(selectedPack?.id === option.id ? null : option);
  };

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="h-5 w-5 text-cta fill-cta/30" />
        </motion.div>
        <h3 className="text-lg font-semibold text-foreground">Ajouter un petit geste solidaire</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Aidez aussi une autre personne en situation d'urgence.
      </p>

      <div className={`grid gap-3 ${upsellOptions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {upsellOptions.map((option) => {
          const isSelected = selectedPack?.id === option.id;
          const optionTotal = donationAmount + option.amount;
          return (
            <motion.button
              key={option.id}
              onClick={() => handleToggle(option)}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-xl p-4 border-2 transition-colors text-center ${
                isSelected
                  ? "border-cta bg-cta/5"
                  : "border-border hover:border-primary/30 bg-background"
              }`}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cta flex items-center justify-center"
                  >
                    <span className="text-cta-foreground text-xs">✓</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{option.amount}€</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{option.description}</div>
              <div className="text-[10px] text-primary font-medium mt-1">
                Total : {optionTotal}€
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EmergencyUpsell;
