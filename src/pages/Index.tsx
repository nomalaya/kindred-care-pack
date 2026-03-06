import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Heart, Users, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-solidarity.jpg";
import SocialProof from "@/components/SocialProof";

const steps = [
  { icon: Heart, title: "Choisissez une cause", desc: "Sélectionnez une cause qui vous tient à cœur parmi 6 catégories." },
  { icon: Users, title: "Découvrez une personne", desc: "Rencontrez une vraie personne dans le besoin à travers son histoire." },
  { icon: Package, title: "Financez un colis", desc: "Composez un colis personnalisé de produits essentiels." },
];

const stats = [
  { value: "100%", label: "Reversé aux bénéficiaires" },
  { value: "48h", label: "Délai moyen de livraison" },
  { value: "6", label: "Causes à soutenir" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Des bénévoles préparent des colis solidaires" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              Don transparent & centré sur l'humain
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Choisissez qui vous voulez{" "}
              <span className="text-gradient-primary">aider concrètement.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Choisissez une cause, découvrez quelqu'un qui a besoin d'aide, et financez un colis personnalisé.
              Ressentez la connexion. Voyez l'impact.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/causes">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground text-lg px-8 py-6 shadow-warm-lg">
                    Je donne <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 backdrop-blur-sm">
                  Comment ça marche
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Trois étapes simples pour changer une vie</h2>
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

      {/* Stats */}
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

      {/* CTA */}
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
              À partir de 32€, offrez des produits essentiels à quelqu'un qui en a vraiment besoin.
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
