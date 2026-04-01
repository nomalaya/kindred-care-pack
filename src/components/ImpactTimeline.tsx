import { motion } from "framer-motion";
import { Heart, Package, Truck, Gift, ShieldCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  beneficiaryName?: string;
}

const PULSE_SHADOW = {
  animate: {
    boxShadow: [
      "0 0 0 0px hsla(157, 68%, 33%, 0.3)",
      "0 0 0 8px hsla(157, 68%, 33%, 0)",
      "0 0 0 0px hsla(157, 68%, 33%, 0.3)",
    ],
  },
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
};

const ImpactTimeline = ({ beneficiaryName }: Props) => {
  const name = beneficiaryName || "cette personne";
  const isMobile = useIsMobile();

  const steps = [
    { icon: Heart, label: "Vous déclenchez une aide ultra-concrète", time: "Aujourd'hui" },
    { icon: Package, label: `Colis préparé pour ${name}`, time: "Demain" },
    { icon: Truck, label: `Colis en route vers ${name}`, time: "Sous 2 j" },
    { icon: Gift, label: `${name} reçoit votre aide`, time: "Sous 3 j" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card/80 backdrop-blur-sm border border-white/20 rounded-2xl p-5 shadow-warm"
    >
      <div className="relative">
        {!isMobile && (
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-primary/10 z-0">
            <motion.div className="h-full bg-primary/60" initial={{ width: 0 }} animate={{ width: "10%" }} transition={{ duration: 1, ease: "easeOut" }} />
          </div>
        )}
        {isMobile && (
          <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-primary/10 z-0">
            <motion.div className="w-full bg-primary/60" initial={{ height: 0 }} animate={{ height: "15%" }} transition={{ duration: 1, ease: "easeOut" }} />
          </div>
        )}

        <div className={isMobile ? "flex flex-col gap-4" : "flex items-start justify-between relative z-10"}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.4 }}
                className={`relative z-10 ${isMobile ? "flex items-start gap-4" : "flex flex-col items-center flex-1"}`}
              >
                {isActive ? (
                  <motion.div
                    animate={PULSE_SHADOW.animate}
                    transition={PULSE_SHADOW.transition}
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary/15 backdrop-blur text-primary/50 border border-white/20">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <div className={isMobile ? "pt-1" : "text-center mt-2"}>
                  <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.time}</span>
                  <p className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-muted/50">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Vous recevrez une confirmation dès que le colis lui sera remis.
        </p>
      </div>
    </motion.div>
  );
};

export default ImpactTimeline;
