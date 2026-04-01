import { motion } from "framer-motion";
import { Heart, Package, Truck, Gift, ShieldCheck, ChevronRight, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import { useIsMobile } from "@/hooks/use-mobile";

const STEPS = [
  { icon: Heart, label: "Vous déclenchez une aide ultra-concrète", time: "Aujourd'hui" },
  { icon: Package, label: "Colis préparé pour Aïcha", time: "Demain" },
  { icon: Truck, label: "Colis en route vers Aïcha", time: "Sous 2 j" },
  { icon: Gift, label: "Aïcha reçoit votre aide", time: "Sous 3 j" },
];

const TransparencyBlock = () => (
  <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-muted/50">
    <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
    <p className="text-xs text-muted-foreground">
      Vous recevrez une confirmation dès que le colis lui sera remis.{" "}
      <span className="text-primary/80">Retrouvez cette confirmation dans votre espace donateur.</span>
    </p>
  </div>
);

// ─── Arrow component ───
const Arrow = ({ isMobile }: { isMobile: boolean; className?: string }) =>
  isMobile ? (
    <ChevronDown className="h-4 w-4 mx-auto my-1" />
  ) : (
    <ChevronRight className="h-4 w-4 shrink-0" />
  );

// ─── C1 — Épurée ───
const C1 = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`relative ${isMobile ? "flex flex-col gap-0 pl-2" : ""}`}>
      {/* Progress bar */}
      {!isMobile && (
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border z-0">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: "10%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      )}
      {isMobile && (
        <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-border z-0">
          <motion.div
            className="w-full bg-primary"
            initial={{ height: 0 }}
            animate={{ height: "15%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      )}

      <div className={isMobile ? "flex flex-col" : "flex items-start justify-between relative z-10"}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === 0;
          return (
            <div key={i} className={isMobile ? "" : "flex items-start flex-1"}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.4 }}
                className={`relative z-10 ${isMobile ? "flex items-start gap-4 mb-2" : "flex flex-col items-center"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-primary/50 border-primary/20"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <div className={isMobile ? "pt-1" : "text-center mt-2"}>
                  <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.time}</span>
                  <p className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</p>
                </div>
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`${isMobile ? "flex justify-start pl-3 py-1" : "flex items-center pt-3 px-1"} text-primary/30`}>
                  <Arrow isMobile={isMobile} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── C2 — Fond émeraude doux ───
const C2 = () => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 shadow-warm">
      {/* Progress bar */}
      <div className={`relative ${isMobile ? "" : "mb-0"}`}>
        {!isMobile && (
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-primary/20 z-0">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: "10%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
        {isMobile && (
          <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-primary/20 z-0">
            <motion.div
              className="w-full bg-primary"
              initial={{ height: 0 }}
              animate={{ height: "15%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}

        <div className={isMobile ? "flex flex-col" : "flex items-start justify-between relative z-10"}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === 0;
            return (
              <div key={i} className={isMobile ? "" : "flex items-start flex-1"}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.4 }}
                  className={`relative z-10 ${isMobile ? "flex items-start gap-4 mb-2" : "flex flex-col items-center"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-primary/10 text-primary/50 border-primary/30"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <div className={isMobile ? "pt-1" : "text-center mt-2"}>
                    <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.time}</span>
                    <p className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</p>
                  </div>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className={`${isMobile ? "flex justify-start pl-3 py-1" : "flex items-center pt-3 px-1"} text-primary/40`}>
                    <Arrow isMobile={isMobile} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── C3 — Gradient fond ───
const C3 = () => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border border-primary/10 rounded-2xl p-5">
      <div className={`relative`}>
        {!isMobile && (
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-primary/15 z-0">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: "10%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
        {isMobile && (
          <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-primary/15 z-0">
            <motion.div
              className="w-full bg-primary"
              initial={{ height: 0 }}
              animate={{ height: "15%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}

        <div className={isMobile ? "flex flex-col" : "flex items-start justify-between relative z-10"}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === 0;
            return (
              <div key={i} className={isMobile ? "" : "flex items-start flex-1"}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.4 }}
                  className={`relative z-10 ${isMobile ? "flex items-start gap-4 mb-2" : "flex flex-col items-center"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-card ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-warm"
                      : "bg-background text-primary/50 border border-primary/20"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <div className={isMobile ? "pt-1" : "text-center mt-2"}>
                    <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.time}</span>
                    <p className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</p>
                  </div>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className={`${isMobile ? "flex justify-start pl-3 py-1" : "flex items-center pt-3 px-1"} text-primary/50`}>
                    <Arrow isMobile={isMobile} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── C4 — Cards en relief ───
const C4 = () => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-muted/30 rounded-2xl p-5">
      <div className={isMobile ? "flex flex-col" : "flex items-start justify-between"}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === 0;
          return (
            <div key={i} className={isMobile ? "" : "flex items-start flex-1"}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                whileHover={!isMobile ? { y: -4, transition: { duration: 0.2 } } : undefined}
                className={`relative z-10 rounded-xl p-3 transition-all ${
                  isActive
                    ? "bg-card shadow-warmLg border border-primary/30"
                    : "bg-card shadow-card border border-transparent hover:shadow-cardHover"
                } ${isMobile ? "flex items-start gap-4 mb-2" : "flex flex-col items-center text-center"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={isMobile ? "pt-1" : "mt-2"}>
                  <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.time}</span>
                  <p className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</p>
                </div>
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`${isMobile ? "flex justify-start pl-3 py-1" : "flex items-center pt-5 px-1"} text-muted-foreground`}>
                  <Arrow isMobile={isMobile} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── C5 — Glassmorphism subtil ───
const C5 = () => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-white/20 rounded-2xl p-5 shadow-warm">
      <div className={`relative`}>
        {!isMobile && (
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-primary/10 z-0">
            <motion.div
              className="h-full bg-primary/60"
              initial={{ width: 0 }}
              animate={{ width: "10%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
        {isMobile && (
          <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-primary/10 z-0">
            <motion.div
              className="w-full bg-primary/60"
              initial={{ height: 0 }}
              animate={{ height: "15%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}

        <div className={isMobile ? "flex flex-col" : "flex items-start justify-between relative z-10"}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === 0;
            return (
              <div key={i} className={isMobile ? "" : "flex items-start flex-1"}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.4 }}
                  className={`relative z-10 ${isMobile ? "flex items-start gap-4 mb-2" : "flex flex-col items-center"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/15 backdrop-blur text-primary/50 border border-white/20"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <div className={isMobile ? "pt-1" : "text-center mt-2"}>
                    <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.time}</span>
                    <p className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</p>
                  </div>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className={`${isMobile ? "flex justify-start pl-3 py-1" : "flex items-center pt-3 px-1"} text-primary/25`}>
                    <Arrow isMobile={isMobile} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE SHOWCASE ───
const TimelineShowcase = () => {
  const solutions = [
    { id: "C1", title: "C1 — Épurée", desc: "Fond card, bordure fine, nœuds outline, barre de progression", Component: C1 },
    { id: "C2", title: "C2 — Fond émeraude doux", desc: "Fond teinté primary, ombre chaleureuse, nœuds teintés", Component: C2 },
    { id: "C3", title: "C3 — Gradient fond", desc: "Dégradé subtil primary → secondary → accent, nœuds avec ombre", Component: C3 },
    { id: "C4", title: "C4 — Cards en relief", desc: "Chaque étape en mini-card avec ombre et hover lift", Component: C4 },
    { id: "C5", title: "C5 — Glassmorphism subtil", desc: "Fond semi-transparent, backdrop-blur, nœuds translucides", Component: C5 },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Déclinaisons Solution C</h1>
          <p className="text-muted-foreground mt-1">5 variations design de la timeline de rassurance avec flèches</p>
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
