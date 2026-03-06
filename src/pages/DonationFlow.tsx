import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import DonationConfirmation from "@/components/DonationConfirmation";
import DonationSlider from "@/components/DonationSlider";
import TaxDeduction from "@/components/TaxDeduction";
import DonationBasket from "@/components/DonationBasket";
import EmergencyUpsell from "@/components/EmergencyUpsell";
import DonationImpact from "@/components/DonationImpact";
import SocialProof from "@/components/SocialProof";
import { Button } from "@/components/ui/button";
import { DONATION_TIERS, MIN_DONATION, MAX_DONATION, type EmergencyPack } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin, Quote } from "lucide-react";
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
  avatar_url?: string;
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
  const [donationAmount, setDonationAmount] = useState(MIN_DONATION);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [emergencyPack, setEmergencyPack] = useState<EmergencyPack | null>(null);

  const currentTierIndex = DONATION_TIERS.reduce((acc, tier, i) => donationAmount >= tier.amount ? i : acc, 0);
  const currentTier = DONATION_TIERS[currentTierIndex];
  const includedProducts = products.filter(p => p.tier <= currentTier.tier);
  const totalAmount = donationAmount + (emergencyPack?.amount || 0);

  const getProductQuantity = (product: Product) => {
    if (product.tier === 1 && donationAmount >= 45) return 2;
    return 1;
  };

  useEffect(() => {
    Promise.all([
      supabase.from("beneficiaries_public").select("*").eq("id", beneficiaryId).single(),
      supabase.from("products").select("*").order("tier").order("name"),
    ]).then(([bRes, pRes]) => {
      setBeneficiary(bRes.data as unknown as Beneficiary);
      setProducts((pRes.data as unknown as Product[]) || []);
      setLoading(false);
    });

    supabase.functions.invoke("track-profile-view", {
      body: { beneficiary_id: beneficiaryId, event_type: "view" },
    });
  }, [beneficiaryId]);

  const handleDonate = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour faire un don");
      navigate("/auth");
      return;
    }
    setSubmitting(true);

    try {
      const productsSent = [
        ...includedProducts.map(p => ({ id: p.id, name: p.name, qty: getProductQuantity(p) })),
        ...(emergencyPack ? [{ id: `emergency_${emergencyPack.id}`, name: emergencyPack.name, qty: 1 }] : []),
      ];

      const { error } = await supabase.from("donations").insert({
        donor_id: user.id,
        beneficiary_id: beneficiaryId,
        amount: totalAmount,
        products_sent: productsSent,
        delivery_status: "confirmed",
      } as any);

      if (error) throw error;
      setConfirmed(true);
    } catch (err: any) {
      toast.error("Une erreur est survenue : " + err.message);
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
          <p className="text-muted-foreground">Bénéficiaire introuvable.</p>
        </div>
      </Layout>
    );
  }

  if (confirmed) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <DonationConfirmation
            beneficiaryName={beneficiary.alias_first_name}
            amount={totalAmount}
            products={includedProducts.map(p => ({ id: p.id, name: p.name }))}
            emergencyPack={emergencyPack}
            beneficiaryId={beneficiary.id}
          />
        </div>
      </Layout>
    );
  }

  const progressPercent = ((donationAmount - MIN_DONATION) / (MAX_DONATION - MIN_DONATION)) * 100;
  const isHighTier = donationAmount >= 45;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <button onClick={() => window.history.back()} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
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
                  avatarUrl={beneficiary.avatar_url}
                  size="lg"
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground text-center">
                {beneficiary.alias_first_name} – {beneficiary.approx_age} ans
              </h2>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1 mb-3">
                <MapPin className="h-3 w-3" /> {beneficiary.region}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{beneficiary.short_story}</p>
              <div className="flex items-start gap-2 text-sm italic text-primary/80">
                <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                « {beneficiary.emotional_sentence} »
              </div>
            </div>
          </div>

          {/* Donation options */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Choisissez votre don</h2>
              <p className="text-muted-foreground">Ajustez le montant pour composer le colis de {beneficiary.alias_first_name}.</p>
            </div>

            <DonationSlider value={donationAmount} onChange={setDonationAmount} progressPercent={progressPercent} />

            <DonationImpact amount={donationAmount} />

            <TaxDeduction
              amount={donationAmount}
              extraAmount={emergencyPack?.amount}
              extraLabel={emergencyPack?.name}
            />

            <DonationBasket
              products={includedProducts}
              getProductQuantity={getProductQuantity}
              amount={donationAmount}
              progressPercent={progressPercent}
            />

            <EmergencyUpsell selectedPack={emergencyPack} onSelectPack={setEmergencyPack} />

            {/* Social proof near CTA */}
            <SocialProof
              variant="donation"
              beneficiaryName={beneficiary.alias_first_name}
              beneficiaryId={beneficiary.id}
            />

            {/* Donate button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleDonate}
                disabled={submitting}
                className={`w-full text-cta-foreground text-lg py-6 shadow-warm-lg transition-all ${
                  isHighTier
                    ? "bg-gradient-to-r from-cta to-cta/80 hover:from-cta/90 hover:to-cta/70 animate-[pulse_3s_ease-in-out_infinite]"
                    : "bg-cta hover:bg-cta/90"
                }`}
                size="lg"
              >
                {submitting ? (
                  "Traitement en cours..."
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Donner {totalAmount}€ à {beneficiary.alias_first_name}
                  </>
                )}
              </Button>
            </motion.div>

            <p className="text-xs text-center text-muted-foreground">
              Paiement sécurisé. Votre don est utilisé à 100% pour le colis.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DonationFlow;
