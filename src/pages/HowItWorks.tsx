import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, Package, Truck, ArrowRight, ShieldCheck, Eye } from "lucide-react";

const steps = [
  { icon: Heart, title: "Choisissez une cause", desc: "Enfants, femmes, étudiants, seniors, travailleurs, santé — 6 causes à soutenir." },
  { icon: Users, title: "Rencontrez une personne", desc: "Découvrez l'histoire et les émotions d'une vraie personne à travers un profil anonyme." },
  { icon: Package, title: "Composez son colis", desc: "Sélectionnez un montant. Les produits sont ajoutés automatiquement selon les besoins." },
  { icon: Truck, title: "Suivez la livraison", desc: "Suivez le parcours du don jusqu'à la livraison. Recevez une notification à l'arrivée." },
];

const HowItWorks = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Comment ça marche</h1>
        <p className="text-lg text-muted-foreground">
          Nous vous connectons avec de vraies personnes dans le besoin, en protégeant leur identité tout en créant un lien humain authentique.
        </p>
      </div>

      <div className="space-y-12 mb-16">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <step.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold text-primary mb-1">Étape {i + 1}</div>
              <h3 className="text-xl font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-8 border shadow-card mb-12">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Confidentialité & Sécurité</h2>
        </div>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Les vrais noms et adresses ne sont jamais montrés aux donateurs</li>
          <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Les avatars sont générés pour protéger l'identité</li>
          <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Seule l'association a accès aux données privées</li>
        </ul>
      </div>

      <div className="text-center">
        <Link to="/causes">
          <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground text-lg px-8 py-6">
            Commencer à aider <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </Layout>
);

export default HowItWorks;
