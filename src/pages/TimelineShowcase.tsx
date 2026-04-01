import { motion } from "framer-motion";
import { Heart, Package, Truck, Gift, ShieldCheck } from "lucide-react";
import Layout from "@/components/Layout";
import { useIsMobile } from "@/hooks/use-mobile";

const STEPS = [
  { icon: Heart, label: "Votre don aujourd'hui", time: "Aujourd'hui" },
  { icon: Package, label: "Colis préparé pour Fatima", time: "Demain" },
  { icon: Truck, label: "En route vers Fatima", time: "Sous 24h" },
  { icon: Gift, label: "Remis à Fatima", time: "Sous 48h" },
];

const TransparencyBlock = () => (
  <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-muted/50">
    <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
    <p className="text-xs text-muted-foreground">
      Vous recevez une confirmation dès que le colis est remis.{" "}
      <span className="text-primary/80">Retrouvez cette confirmation dans votre espace donateur.</span>
    </p>
  </div>
);

// ─── SOLUTION A — Timeline linéaire animée ───
const SolutionA = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`relative ${isMobile ? "flex flex-col gap-0 pl-2" : "flex items-start justify-between"}`}>
      {/* Ligne de connexion animée */}
      {!isMobile && (
        <motion.div
          className="absolute top-5 left-5 right-5 h-0.5 bg-primary/20 origin-left"
          style={{ zIndex: 0 }}
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          />
        </motion.div>
      )}
      {isMobile && (
        <motion.div
          className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-primary/20"
          style={{ zIndex: 0 }}
        >
          <motion.div
            className="w-full bg-primary"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ transformOrigin: "top" }}
          />
        </motion.div>
      )}

      {STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.25, duration: 0.4 }}
            className={`relative z-10 ${isMobile ? "flex items-start gap-4 mb-6 last:mb-0" : "flex flex-col items-center flex-1"}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className={isMobile ? "pt-1" : "text-center mt-2"}>
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <span className="text-xs text-muted-foreground">{step.time}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── SOLUTION B — Step Cards ───
const SolutionB = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? "flex flex-col gap-3" : "grid grid-cols-4 gap-3"}`}>
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            className={`relative rounded-xl p-4 border transition-all ${
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/50 bg-card/50 opacity-70"
            }`}
          >
            {/* Connecteur pointillé */}
            {!isMobile && i < STEPS.length - 1 && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 border-t border-dashed border-primary/30 z-20" />
            )}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground leading-tight">{step.label}</p>
                <span className={`text-xs ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>{step.time}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── SOLUTION C — Progress bar avec milestones ───
const SolutionC = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="relative pl-2">
        {/* Barre verticale bg */}
        <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-border" />
        {/* Barre verticale remplie */}
        <motion.div
          className="absolute left-[18px] top-5 w-0.5 bg-primary"
          initial={{ height: 0 }}
          animate={{ height: "15%" }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2, duration: 0.4 }}
              className="flex items-start gap-4 mb-6 last:mb-0 relative z-10"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-primary/50 border-primary/20"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="pt-1">
                <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                <span className={`text-xs ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>{step.time}</span>
              </div>
              {isActive && (
                <motion.div
                  className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Barre horizontale bg */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
      {/* Barre horizontale remplie */}
      <motion.div
        className="absolute top-5 left-5 h-0.5 bg-primary"
        initial={{ width: 0 }}
        animate={{ width: "10%" }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      <div className="flex justify-between relative z-10">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.4 }}
              className="flex flex-col items-center flex-1 relative"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-primary/50 border-primary/20"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              {isActive && (
                <motion.div
                  className="absolute top-0 w-10 h-10 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span className={`text-xs mt-1 font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.time}</span>
              <p className={`text-sm mt-1 text-center ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── SOLUTION D — Reveal progressif ───
const SolutionD = () => {
  return (
    <div className="flex flex-col gap-4">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3, duration: 0.5, ease: "easeOut" }}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
              isActive ? "bg-primary/5 border border-primary/20" : ""
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {step.time}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── PAGE SHOWCASE ───
const TimelineShowcase = () => {
  const solutions = [
    { id: "A", title: "Solution A — Timeline linéaire animée", desc: "Nœuds reliés par une ligne qui se remplit progressivement", Component: SolutionA },
    { id: "B", title: "Solution B — Step Cards", desc: "Mini-cards avec connecteurs pointillés, première active", Component: SolutionB },
    { id: "C", title: "Solution C — Progress bar avec milestones", desc: "Barre de progression, premier nœud actif avec pulse, les suivants en projection", Component: SolutionC },
    { id: "D", title: "Solution D — Reveal progressif", desc: "Étapes apparaissent une par une, effet storytelling", Component: SolutionD },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comparaison des timelines</h1>
          <p className="text-muted-foreground mt-1">Choisissez la solution qui vous convient le mieux</p>
        </div>

        {solutions.map(({ id, title, desc, Component }) => (
          <section key={id} className="bg-card rounded-2xl border shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
            <Component />
            <TransparencyBlock />
          </section>
        ))}
      </div>
    </Layout>
  );
};

export default TimelineShowcase;
