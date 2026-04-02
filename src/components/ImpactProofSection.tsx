import { motion } from "framer-motion";
import { Package, Truck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIAL_LINKS } from "@/lib/socialLinks";

const PROOF_ITEMS = [
  { icon: Package, label: "Colis préparés", count: "+2 847", sub: "cette semaine" },
  { icon: Truck, label: "Distributions", count: "+1 432", sub: "ce mois" },
  { icon: Heart, label: "Actions concrètes", count: "+8 210", sub: "depuis le lancement" },
];

const ImpactProofSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.5, duration: 0.6 }}
    className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 text-center space-y-5"
  >
    <h3 className="text-lg font-semibold text-foreground">Voir l'impact réel</h3>

    <div className="grid grid-cols-3 gap-4">
      {PROOF_ITEMS.map(({ icon: Icon, label, count, sub }) => (
        <div key={label} className="space-y-1">
          <Icon className="h-6 w-6 text-primary mx-auto" />
          <p className="text-lg font-bold text-foreground">{count}</p>
          <p className="text-xs text-muted-foreground leading-tight">
            {label}<br />{sub}
          </p>
        </div>
      ))}
    </div>

    <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="sm">
        Voir les actions
      </Button>
    </a>
  </motion.div>
);

export default ImpactProofSection;
