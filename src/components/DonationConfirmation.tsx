import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Package, Truck, Heart, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import { DELIVERY_STATUSES } from "@/lib/constants";
import { useEffect, useState } from "react";

interface Props {
  beneficiaryName: string;
  amount: number;
  products: { id: string; name: string }[];
}

const DonationConfirmation = ({ beneficiaryName, amount, products }: Props) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      {/* Confetti-like animation */}
      {showConfetti && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 3 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: 0, y: 0, scale: 0, opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 600,
                y: (Math.random() - 0.5) * 600,
                scale: Math.random() * 1.5 + 0.5,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 2 + Math.random(), ease: "easeOut" }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ["hsl(var(--primary))", "hsl(var(--cta))", "hsl(var(--secondary))", "#FFD700", "#FF6B6B"][i % 5],
              }}
            />
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
      >
        <PartyPopper className="h-10 w-10 text-primary" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-bold text-foreground mb-3"
      >
        Merci pour votre générosité !
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-muted-foreground mb-8"
      >
        Votre aide va permettre d'envoyer ce colis à <span className="font-semibold text-foreground">{beneficiaryName}</span>.
      </motion.p>

      {/* Products included */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-2xl p-6 border shadow-card mb-6 text-left"
      >
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Contenu du colis – {amount}€</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm text-foreground py-1">
              <Check className="h-3 w-3 text-primary flex-shrink-0" />
              {p.name}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Delivery timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-card rounded-2xl p-6 border shadow-card mb-8 text-left"
      >
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Suivi de livraison</h3>
        </div>
        <div className="space-y-3">
          {DELIVERY_STATUSES.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {s.icon}
              </div>
              <span className={`text-sm ${i === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i === 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">En cours</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Link to="/dashboard">
          <Button className="bg-cta hover:bg-cta/90 text-cta-foreground px-8">
            <Heart className="h-4 w-4 mr-2" />
            Voir mes dons
          </Button>
        </Link>
        <Link to="/causes">
          <Button variant="outline" className="px-8">
            Aider quelqu'un d'autre
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default DonationConfirmation;
