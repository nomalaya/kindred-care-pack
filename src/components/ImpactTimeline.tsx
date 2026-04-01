import { motion } from "framer-motion";
import { Heart, Package, Gift } from "lucide-react";

interface Props {
  beneficiaryName?: string;
}

const ImpactTimeline = ({ beneficiaryName }: Props) => {
  const name = beneficiaryName || "cette personne";

  const steps = [
    { icon: Heart, label: "Votre don aujourd'hui" },
    { icon: Package, label: `Colis préparé pour ${name}` },
    { icon: Gift, label: "Colis distribué sous 48h" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-2xl p-6 border shadow-card"
    >
      <div className="flex flex-col items-start gap-0 pl-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-6 bg-primary/20" />
                )}
              </div>
              <span className="text-sm text-foreground font-medium pt-1.5">{step.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ImpactTimeline;
