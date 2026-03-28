import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BackButton from "@/components/BackButton";
import { motion } from "framer-motion";
import {
  Heart, ShieldCheck, FileText, CheckCircle,
  Calendar, ClipboardList, Wallet, Download,
  Lock, Clock, ArrowRight,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import TaxDeductionOptionC from "@/components/TaxDeductionOptionC";
import { TAX_DEDUCTION_RATE } from "@/lib/constants";
import { ANIM } from "@/lib/designSystem";

const TaxAdvantage = () => {
  const [amount, setAmount] = useState(50);
  const deduction = Math.round(amount * TAX_DEDUCTION_RATE);
  const realCost = amount - deduction;

  const examples = [
    { don: 50, real: 17 },
    { don: 90, real: 30.6 },
    { don: 100, real: 34 },
  ];

  const steps = [
    { icon: Heart, title: "Vous faites un don", desc: "Choisissez une cause et un montant qui vous parle." },
    { icon: FileText, title: "Vous recevez votre reçu fiscal", desc: "Disponible immédiatement dans votre espace donateur." },
    { icon: CheckCircle, title: "Vous le déclarez en ligne", desc: "Rien à joindre, conservez simplement votre reçu." },
  ];

  const timeline = [
    { icon: Calendar, label: "Don effectué en 2026" },
    { icon: ClipboardList, label: "Déclaration au printemps 2027" },
    { icon: Wallet, label: "Remboursement été 2027" },
  ];

  const reassurance = [
    { icon: Lock, title: "Paiement 100% sécurisé", desc: "Vos données bancaires sont protégées par un chiffrement de niveau bancaire." },
    { icon: ShieldCheck, title: "Organisme reconnu", desc: "CashForCause agit dans un cadre d'intérêt général reconnu par l'État français." },
    { icon: Clock, title: "3 minutes pour déclarer", desc: "La déclaration est simple et rapide, directement en ligne." },
  ];

  return (
    <Layout>
      {/* 1. Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div {...ANIM.fadeInUp}>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"
            >
              <Heart className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Donner vous coûte moins que vous ne le pensez
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              66 % de votre don vous est remboursé sous forme de réduction d'impôt.
              Un don de 50 € ne vous coûte réellement que <span className="font-bold text-primary">17 €</span>.
            </p>
            <Link to="/causes">
              <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground">
                Faire un don <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Combien ça coûte vraiment */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...ANIM.fadeInUp} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Combien ça vous coûte vraiment ?
            </h2>
            <p className="text-muted-foreground">
              Déplacez le curseur pour voir le coût réel de votre don.
            </p>
          </motion.div>

          <div className="bg-card rounded-2xl border shadow-card p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>20 €</span>
                <span className="font-semibold text-foreground text-lg">{amount} €</span>
                <span>150 €</span>
              </div>
              <Slider
                value={[amount]}
                onValueChange={(v) => setAmount(v[0])}
                min={20}
                max={150}
                step={5}
              />
            </div>

            <TaxDeductionOptionC amount={amount} />
          </div>

          {/* Exemples fixes */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {examples.map((ex) => (
              <motion.div
                key={ex.don}
                {...ANIM.fadeInUp}
                className="bg-primary/5 rounded-2xl p-5 text-center border border-primary/10"
              >
                <p className="text-xs text-muted-foreground mb-1">Don de</p>
                <p className="text-xl font-bold text-foreground">{ex.don} €</p>
                <p className="text-xs text-muted-foreground mt-2 mb-1">Coût réel</p>
                <p className="text-xl font-bold text-primary">{ex.real.toFixed(2).replace(".00", "")} €</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Pourquoi cet avantage */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...ANIM.fadeInUp} className="bg-card rounded-2xl border shadow-card p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">
                  Pourquoi vous avez droit à cet avantage ?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  CashForCause aide des personnes en difficulté dans un cadre reconnu par l'État français.
                  La loi encourage la générosité en vous permettant de déduire <span className="font-semibold text-foreground">66 % de vos dons</span> de
                  vos impôts, dans la limite de 20 % de votre revenu imposable.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Comment ça marche — 3 étapes */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...ANIM.fadeInUp} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Comment ça marche ?</h2>
            <p className="text-muted-foreground">3 étapes, c'est tout.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card rounded-2xl border shadow-card p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Étape {i + 1}
                  </p>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Quand déclarer — Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...ANIM.fadeInUp} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Quand déclarer ?</h2>
            <p className="text-muted-foreground">La réduction s'applique l'année suivant votre don.</p>
          </motion.div>

          <motion.div {...ANIM.fadeInUp} className="bg-card rounded-2xl border shadow-card p-8">
            <div className="flex flex-col items-start gap-0 pl-4">
              {timeline.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {i < timeline.length - 1 && <div className="w-0.5 h-8 bg-primary/20" />}
                    </div>
                    <span className="text-foreground font-medium pt-2">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Vos reçus fiscaux */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...ANIM.fadeInUp} className="bg-card rounded-2xl border shadow-card p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Vos reçus fiscaux</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    Disponibles dans votre espace donateur
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    Téléchargeables à tout moment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    Possibilité de reçu global annuel
                  </li>
                </ul>
                <Link to="/dashboard" className="inline-block mt-4">
                  <Button variant="outline" size="sm">Accéder à mon espace</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. Réassurance */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid md:grid-cols-3 gap-6">
            {reassurance.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card rounded-2xl border shadow-card p-6 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CTA final */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div {...ANIM.fadeInUp} className="bg-primary/5 rounded-2xl border border-primary/10 p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Prêt à faire la différence ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Chaque don compte. Et il vous coûte moins que vous ne le pensez.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/causes">
                <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground">
                  Faire un don <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg">Voir mon impact</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default TaxAdvantage;
