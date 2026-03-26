import { useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { getUpsellsForAmount, type UpsellOption } from "@/lib/constants";
import { useState } from "react";

const UpsellDonation = () => {
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    donationAmount: number;
    beneficiaryName: string;
  } | null;

  const donationAmount = state?.donationAmount || 35;
  const upsellOptions = getUpsellsForAmount(donationAmount);

  const [selectedOption, setSelectedOption] = useState<UpsellOption | null>(null);

  const handleSkip = () => {
    navigate(`/checkout/${beneficiaryId}`, {
      state: { emergencyPack: null, ...(location.state || {}) },
    });
  };

  const handleContinue = () => {
    navigate(`/checkout/${beneficiaryId}`, {
      state: { emergencyPack: selectedOption, ...(location.state || {}) },
    });
  };

  const totalAmount = donationAmount + (selectedOption?.amount || 0);

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

          <div className={`grid grid-cols-1 gap-4 mb-8 ${
            upsellOptions.length === 2 ? "sm:grid-cols-2 max-w-md mx-auto" : "sm:grid-cols-3"
          }`}>
            {upsellOptions.map((option) => {
              const isSelected = selectedOption?.id === option.id;
              const optionTotal = donationAmount + option.amount;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedOption(isSelected ? null : option)}
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
                  <div className="text-3xl mb-3">{option.icon}</div>
                  <div className="text-base font-semibold text-foreground mb-1">
                    {option.description}
                  </div>
                  <div className="text-lg font-bold text-primary">{option.amount}€</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total du don : {optionTotal}€
                  </div>
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

            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  size="lg"
                  onClick={handleContinue}
                  className="bg-cta text-cta-foreground hover:bg-cta/90"
                >
                  Ajouter {selectedOption.amount}€ — Total {totalAmount}€ <ArrowRight className="ml-2 h-4 w-4" />
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
