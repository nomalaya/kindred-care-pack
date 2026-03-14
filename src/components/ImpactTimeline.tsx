import { motion } from "framer-motion";

const steps = [
  { icon: "❤️", label: "Votre don aujourd'hui" },
  { icon: "📦", label: "Colis préparé demain" },
  { icon: "🎁", label: "Colis distribué après-demain" },
];

const ImpactTimeline = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="bg-card rounded-2xl p-6 border shadow-card"
  >
    <div className="flex flex-col items-start gap-0 pl-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-4">
          {/* Vertical connector */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-base">
              {step.icon}
            </div>
            {i < steps.length - 1 && (
              <div className="w-0.5 h-6 bg-primary/20" />
            )}
          </div>
          <span className="text-sm text-foreground font-medium pt-1.5">{step.label}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export default ImpactTimeline;
