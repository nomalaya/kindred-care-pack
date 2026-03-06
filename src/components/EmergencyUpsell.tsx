import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { EMERGENCY_PACKS, type EmergencyPack } from "@/lib/constants";

interface Props {
  selectedPack: EmergencyPack | null;
  onSelectPack: (pack: EmergencyPack | null) => void;
}

const EmergencyUpsell = ({ selectedPack, onSelectPack }: Props) => {
  const handleToggle = (pack: EmergencyPack) => {
    onSelectPack(selectedPack?.id === pack.id ? null : pack);
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

      <div className="grid grid-cols-3 gap-3">
        {EMERGENCY_PACKS.map((pack) => {
          const isSelected = selectedPack?.id === pack.id;
          return (
            <motion.button
              key={pack.id}
              onClick={() => handleToggle(pack)}
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
              <div className="text-2xl mb-2">{pack.icon}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{pack.amount}€</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{pack.description}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EmergencyUpsell;
