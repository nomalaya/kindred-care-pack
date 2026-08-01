import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, Award, Clock, Receipt } from "lucide-react";
import { motion } from "framer-motion";

import SocialProof from "@/components/SocialProof";
import HomeBeneficiaries from "@/components/home/HomeBeneficiaries";

const stats = [
  { value: "100%", label: "Reversé aux bénéficiaires" },
  { value: "48h", label: "Livraison en 24 à 48h" },
  { value: "6", label: "Causes à soutenir" },
];

const reassurance = [
  { icon: Award, label: "Association déclarée loi 1901" },
  { icon: Clock, label: "Colis livré en 24 à 48h" },
  { icon: Receipt, label: "Reçu fiscal envoyé automatiquement" },
];

const Index = () => {
  return (
    <Layout>
      {/* 1. Bénéficiaires */}
      <HomeBeneficiaries />

      {/* 2. Hero simplifié */}
      <section className="bg-primary">
        <div className="container mx-auto px-4 py-8 max-h-[180px] flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
            Choisissez qui vous voulez aider.
          </h2>
          <p className="text-primary-foreground/80 text-sm md:text-base mb-4 max-w-2xl">
            Choisissez une cause, découvrez quelqu'un qui a besoin d'aide, et financez un colis
            personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link to="/causes">
              <Button className="bg-cta hover:bg-cta/90 text-cta-foreground">
                Je donne <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/comment-ca-marche">
              <Button
                variant="outline"
                className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Comment ça marche
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Réassurance */}
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

      {/* 4. Stats */}
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

      {/* 5. CTA final avec photo */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto overflow-hidden rounded-xl shadow-warm-lg"
          >
            <div className="relative bg-muted/40">
              <img
                src="/hero-solidarity.jpg"
                alt="Des bénévoles CashForCause préparent des colis solidaires dans l'entrepôt partenaire"
                className="w-full h-full object-cover md:rounded-l-xl md:rounded-r-none"
                loading="lazy"
              />
              <p className="text-xs italic text-muted-foreground px-4 py-2">
                Nos bénévoles préparent votre colis dans notre entrepôt partenaire
              </p>
            </div>

            <div className="bg-primary p-10 md:rounded-r-xl md:rounded-l-none flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Prêt à aider quelqu'un aujourd'hui ?
              </h2>
              <p className="text-[15px] text-primary-foreground/90 mb-6">
                Derrière chaque don, une équipe réelle prépare et expédie votre colis sous 24 à 48h.
                Vous voyez qui vous aidez. Vous savez que ça lui est bien arrivé.
              </p>
              <Link to="/causes">
                <Button className="bg-background text-primary hover:bg-background/90 w-full sm:w-auto">
                  Trouver quelqu'un à aider <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-primary-foreground/70 mt-3">
                Dès 20€ · Reçu fiscal automatique · Livraison garantie sous 48h
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
