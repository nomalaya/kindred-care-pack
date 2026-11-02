import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Hero initial : photo solidarité en dégradé, message à gauche,
 * boutons « Je donne » et « Comment ça marche ». Aucun portrait défilant.
 */
const HeroBeneficiaries = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0">
        <img
          src="/hero-solidarity.jpg"
          alt="Des bénévoles préparent des colis solidaires"
          className="w-full h-full object-cover"
          loading="lazy"
        />
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
            Don transparent &amp; centré sur l'humain
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Choisissez qui vous voulez{" "}
            <span className="text-gradient-primary">aider.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Choisissez une cause, découvrez quelqu'un qui a besoin d'aide, et financez un colis personnalisé.
            Ressentez la connexion. Voyez l'impact.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/causes">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-cta hover:bg-cta/90 text-cta-foreground text-lg px-8 py-6 shadow-warm-lg"
                >
                  Je donne <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/comment-ca-marche">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 backdrop-blur-sm">
                Comment ça marche
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBeneficiaries;
