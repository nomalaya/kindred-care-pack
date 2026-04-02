import { motion } from "framer-motion";
import { Check, Package, Heart, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import { type UpsellOption } from "@/lib/constants";
import { useEffect, useState } from "react";
import SocialProof from "@/components/SocialProof";
import PostDonSocialBlock from "@/components/PostDonSocialBlock";
import { useAuth } from "@/hooks/useAuth";

import type { BasketItem } from "@/lib/basketEngine";

interface Props {
  beneficiaryName: string;
  amount: number;
  products: { id: string; name: string }[];
  basket?: BasketItem[];
  emergencyPack?: UpsellOption | null;
  beneficiaryId?: string;
}

const DonationConfirmation = ({ beneficiaryName, amount, products, basket, emergencyPack, beneficiaryId }: Props) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      {/* Confetti centré sur le titre */}
      {showConfetti && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 3 }}
          className="absolute inset-x-0 top-0 h-48 pointer-events-none z-50 flex items-center justify-center"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 600,
                y: (Math.random() - 0.5) * 400,
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

      <div className="relative">
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

        {/* Social proof — rang donateur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-4 flex justify-center"
        >
          <SocialProof variant="confirmation" beneficiaryId={beneficiaryId} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-muted-foreground mb-6"
        >
          Votre don va permettre d'aider concrètement et immédiatement <span className="font-semibold text-foreground">{beneficiaryName}</span>.
        </motion.p>
      </div>

      {/* Bloc principal : promesse de livraison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-2xl p-6 border shadow-card mb-6 text-left"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Votre colis sera remis à {beneficiaryName} sous 3 jours maximum.
          </p>
        </div>

        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            Vous recevrez une confirmation par email dès que le colis sera remis à {beneficiaryName}.
          </p>
          <p>
            {user ? (
              <>
                Retrouvez cette confirmation dans{" "}
                <Link to="/dashboard" className="font-semibold text-primary hover:underline">
                  Vos contributions
                </Link>{" "}
                dans votre espace donateur.
              </>
            ) : (
              <>
                <Link to="/auth" className="font-semibold text-primary hover:underline">
                  Créez votre espace donateur
                </Link>{" "}
                pour suivre vos contributions.
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Upsell card — uniquement si sélectionné */}
      {emergencyPack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card rounded-2xl p-6 border shadow-card mb-6 text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-cta" />
            <h3 className="font-semibold text-foreground">{emergencyPack.description}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ce kit sera remis à une autre personne que {beneficiaryName}.
          </p>
        </motion.div>
      )}

      {/* Post-don social block */}
      <PostDonSocialBlock />
    </div>
  );
};

export default DonationConfirmation;
