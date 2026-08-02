import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import {
  ArrowRight,
  
  HeartHandshake,
  Package,
  PackageCheck,
  Receipt,
  Truck,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import SocialProof from "@/components/SocialProof";
import HeroBeneficiaries from "@/components/home/HeroBeneficiaries";

const steps = [
  {
    icon: Users,
    title: "Vous rencontrez quelqu'un",
    desc: "Un prénom, une région, une situation réelle.",
  },
  {
    icon: Package,
    title: "Vous financez son colis",
    desc: "Des produits essentiels adaptés à sa situation.",
  },
  {
    icon: Truck,
    title: "Il le reçoit sous 48h",
    desc: "Vous êtes notifié de la livraison.",
  },
];

const stats = [
  { value: "200", label: "Personnes en attente d'un colis en France" },
  { value: "48h", label: "Délai moyen de livraison" },
  { value: "75%", label: "Déduction fiscale" },
];

const reassurance = [
  { icon: HeartHandshake, label: "Organisme déclaré d'aide aux personnes en difficulté" },
  { icon: PackageCheck, label: "Envoi d'une preuve de réception" },
  { icon: Receipt, label: "Reçu fiscal automatique" },
];

const Index = () => {
  return (
    <Layout>
      {/* 1. Hero rencontre */}
      <HeroBeneficiaries />



      {/* 3. Trois étapes simples — incarnées */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Trois étapes simples pour changer une vie
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-sm font-semibold text-primary mb-2">Étape {i + 1}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Réassurance */}
      <section className="py-10 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {reassurance.map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-3 text-center">
                <item.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Stats + preuve sociale */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <SocialProof variant="homepage" />
          </div>
        </div>
      </section>

      {/* 6. CTA final (version d'origine) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-12 text-center max-w-3xl mx-auto shadow-warm-lg"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Prêt à faire la différence ?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Dès 20€, offrez des produits essentiels à quelqu'un qui en a vraiment besoin.
            </p>
            <Link to="/causes">
              <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground text-lg px-8 py-6">
                Choisir une cause <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
