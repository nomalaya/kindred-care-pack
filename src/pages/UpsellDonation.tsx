import { useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { EMERGENCY_PACKS, type EmergencyPack } from "@/lib/constants";
import { useState } from "react";

const UpsellDonation = () => {
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Receive donation data from DonationFlow via navigation state
  const state = location.state as {
    donationAmount: number;
    beneficiaryName: string;
  } | null;

  const [selectedPack, setSelectedPack] = useState<EmergencyPack | null>(null);

  const handleSkip = () => {
    navigate(`/checkout/${beneficiaryId}`, {
      state: { emergencyPack: null, ...(location.state || {}) },
    });
  };

  const handleContinue = () => {
    navigate(`/checkout/${beneficiaryId}`, {
      state: { emergencyPack: selectedPack, ...(location.state || {}) },
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-10 w-10 text-cta fill-cta/30" />
              </motion.div>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Vous pouvez aussi aider une autre personne
            </h1>
            <p className="text-muted-foreground mb-8">
              Certaines situations urgentes nécessitent un soutien immédiat.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {EMERGENCY_PACKS.map((pack) => {
              const isSelected = selectedPack?.id === pack.id;
              return (
                <motion.button
                  key={pack.id}
                  onClick={() => setSelectedPack(isSelected ? null : pack)}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative rounded-xl p-6 border-2 transition-colors text-center ${
                    isSelected
                      ? "border-cta bg-cta/5"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cta flex items-center justify-center"
                    >
                      <span className="text-cta-foreground text-xs">✓</span>
                    </motion.div>
                  )}
                  <div className="text-3xl mb-3">{pack.icon}</div>
                  <div className="text-base font-semibold text-foreground mb-1">
                    {pack.description}
                  </div>
                  <div className="text-lg font-bold text-primary">{pack.amount}€</div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Non merci, continuer
            </Button>

            {selectedPack && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  size="lg"
                  onClick={handleContinue}
                  className="bg-cta text-cta-foreground hover:bg-cta/90"
                >
                  Ajouter {selectedPack.amount}€ <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpsellDonation;
