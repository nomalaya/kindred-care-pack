import { motion } from "framer-motion";

const steps = [
  { icon: "✅", label: "Votre contribution aujourd'hui" },
  { icon: "📦", label: "Colis préparé le lendemain" },
  { icon: "🎁", label: "Colis distribué le surlendemain" },
];

const ImpactTimeline = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="bg-card rounded-2xl p-6 border shadow-card"
  >
    <div className="flex flex-col items-center gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center">
          {i > 0 && (
            <div className="w-px h-6 bg-border" />
          )}
          <div className="flex items-center gap-3">
            <span className="text-lg">{step.icon}</span>
            <span className="text-sm text-foreground font-medium">{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default ImpactTimeline;
