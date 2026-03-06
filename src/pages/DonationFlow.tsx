import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import { Button } from "@/components/ui/button";
import { DONATION_TIERS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Package, Heart, MapPin, Quote } from "lucide-react";
import { toast } from "sonner";

interface Beneficiary {
  id: string;
  alias_first_name: string;
  approx_age: number;
  region: string;
  short_story: string;
  emotional_sentence: string;
  avatar_gender: string;
  avatar_age_range: string;
  avatar_hair_type: string;
  avatar_skin_tone: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  tier: number;
}

const DonationFlow = () => {
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentTier = DONATION_TIERS[selectedTierIndex];
  const includedProducts = products.filter(p => p.tier <= currentTier.tier);

  useEffect(() => {
    Promise.all([
      supabase.from("beneficiaries_public").select("*").eq("id", beneficiaryId).single(),
      supabase.from("products").select("*").order("tier").order("name"),
    ]).then(([bRes, pRes]) => {
      setBeneficiary(bRes.data as unknown as Beneficiary);
      setProducts((pRes.data as unknown as Product[]) || []);
      setLoading(false);
    });
  }, [beneficiaryId]);

  const handleDonate = async () => {
    if (!user) {
      toast.error("Please sign in to donate");
      navigate("/auth");
      return;
    }
    setSubmitting(true);

    try {
      const { error } = await supabase.from("donations").insert({
        donor_id: user.id,
        beneficiary_id: beneficiaryId,
        amount: currentTier.amount,
        products_sent: includedProducts.map(p => ({ id: p.id, name: p.name })),
        delivery_status: "confirmed",
      } as any);

      if (error) throw error;

      toast.success(`Thank you! Your ${currentTier.amount}€ donation has been confirmed.`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error("Something went wrong: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse max-w-4xl mx-auto bg-card rounded-2xl h-96" />
        </div>
      </Layout>
    );
  }

  if (!beneficiary) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Beneficiary not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <button onClick={() => window.history.back()} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>

        <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-8">
          {/* Beneficiary info */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-2xl p-8 shadow-card border sticky top-24">
              <div className="flex justify-center mb-4">
                <BeneficiaryAvatar
                  name={beneficiary.alias_first_name}
                  gender={beneficiary.avatar_gender}
                  ageRange={beneficiary.avatar_age_range}
                  hairType={beneficiary.avatar_hair_type}
                  skinTone={beneficiary.avatar_skin_tone}
                  size="lg"
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground text-center">
                {beneficiary.alias_first_name} – {beneficiary.approx_age}
              </h2>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1 mb-3">
                <MapPin className="h-3 w-3" /> {beneficiary.region}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{beneficiary.short_story}</p>
              <div className="flex items-start gap-2 text-sm italic text-primary/80">
                <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                "{beneficiary.emotional_sentence}"
              </div>
            </div>
          </div>

          {/* Donation options */}
          <div className="md:col-span-3 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose your donation</h2>
              <p className="text-muted-foreground">Select an amount to build {beneficiary.alias_first_name}'s care package.</p>
            </div>

            {/* Tier selector */}
            <div className="grid grid-cols-2 gap-3">
              {DONATION_TIERS.map((tier, i) => (
                <button
                  key={tier.amount}
                  onClick={() => setSelectedTierIndex(i)}
                  className={`rounded-xl p-4 border-2 transition-all text-left ${
                    selectedTierIndex === i
                      ? "border-primary bg-primary/5 shadow-warm"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="text-2xl font-bold text-foreground">{tier.amount}€</div>
                  <div className="text-sm font-medium text-primary">{tier.label}</div>
                  <div className="text-xs text-muted-foreground">{tier.description}</div>
                </button>
              ))}
            </div>

            {/* Basket */}
            <div className="bg-card rounded-2xl p-6 border shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Care package contents</h3>
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {includedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg bg-background"
                    >
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground flex-1">{product.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{includedProducts.length} items</span>
                <span className="text-xl font-bold text-primary">{currentTier.amount}€</span>
              </div>
            </div>

            {/* Donate button */}
            <Button
              onClick={handleDonate}
              disabled={submitting}
              className="w-full bg-cta hover:bg-cta/90 text-cta-foreground text-lg py-6 shadow-warm-lg"
              size="lg"
            >
              {submitting ? (
                "Processing..."
              ) : (
                <>
                  <Heart className="h-5 w-5 mr-2" />
                  Donate {currentTier.amount}€ to {beneficiary.alias_first_name}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment. Your donation is 100% used for the care package.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DonationFlow;
