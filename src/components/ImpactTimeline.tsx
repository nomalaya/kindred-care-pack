import { motion } from "framer-motion";
import { Heart, Package, Truck, Gift, ShieldCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  beneficiaryName?: string;
}

const steps = [
  { icon: Heart, label: "Votre don aujourd'hui", delay: "Aujourd'hui" },
  { icon: Package, labelTpl: "Colis préparé pour {name}", delay: "Demain" },
  { icon: Truck, labelTpl: "En route vers {name}", delay: "Sous 24h" },
  { icon: Gift, labelTpl: "Remis à {name}", delay: "Sous 48h" },
];

const ImpactTimeline = ({ beneficiaryName }: Props) => {
  const name = beneficiaryName || "cette personne";
  const isMobile = useIsMobile();

  const resolvedSteps = steps.map((s) => ({
    ...s,
    label: s.label || s.labelTpl!.replace("{name}", name),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-2xl p-6 border shadow-card space-y-4"
    >
      {/* Timeline */}
      {isMobile ? (
        <VerticalTimeline steps={resolvedSteps} />
      ) : (
        <HorizontalTimeline steps={resolvedSteps} />
      )}

      {/* Reassurance */}
      <div className="flex items-start gap-2 pt-2 border-t border-border/50">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Vous recevez une confirmation dès que le colis est remis.{" "}
          <span className="text-foreground/70">
            Retrouvez cette confirmation dans votre espace donateur.
          </span>
        </p>
      </div>
    </motion.div>
  );
};

/* ─── Horizontal (Desktop) ─────────────────────────────── */

interface TimelineProps {
  steps: { icon: React.ElementType; label: string; delay: string }[];
}

const HorizontalTimeline = ({ steps }: TimelineProps) => (
  <div className="relative flex items-start justify-between">
    {/* Background track */}
    <div className="absolute top-4 left-[calc(12.5%)] right-[calc(12.5%)] h-0.5 bg-border rounded-full z-0" />

    {/* Animated fill — stops at first node (25% of track) */}
    <motion.div
      className="absolute top-4 left-[calc(12.5%)] h-0.5 bg-primary rounded-full origin-left"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
      style={{ width: "25%" }}
    />

    {steps.map((step, i) => {
      const Icon = step.icon;
      const isActive = i === 0;
      return (
        <motion.div
          key={i}
          className="flex flex-col items-center text-center z-10"
          style={{ width: "25%" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
        >
          {/* Node */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
              isActive
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-primary/10 border-primary/30 text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>

          {/* Delay badge */}
          <span
            className={`mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isActive
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.delay}
          </span>

          {/* Label */}
          <span className="mt-1.5 text-xs text-foreground/80 font-medium leading-tight max-w-[110px]">
            {step.label}
          </span>
        </motion.div>
      );
    })}
  </div>
);

/* ─── Vertical (Mobile) ────────────────────────────────── */

const VerticalTimeline = ({ steps }: TimelineProps) => (
  <div className="relative pl-4">
    {/* Background track */}
    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border rounded-full" />

    {/* Animated fill */}
    <motion.div
      className="absolute left-[19px] top-4 w-0.5 bg-primary rounded-full origin-top"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
      style={{ height: "25%" }}
    />

    {steps.map((step, i) => {
      const Icon = step.icon;
      const isActive = i === 0;
      const isLast = i === steps.length - 1;
      return (
        <motion.div
          key={i}
          className={`flex items-start gap-3 ${isLast ? "" : "pb-5"}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
        >
          {/* Node */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${
              isActive
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-primary/10 border-primary/30 text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="pt-1">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.delay}
            </span>
            <p className="mt-1 text-sm text-foreground/80 font-medium">
              {step.label}
            </p>
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default ImpactTimeline;
