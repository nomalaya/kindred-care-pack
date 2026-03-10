import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import DonationConfirmation from "@/components/DonationConfirmation";
import DonationSlider from "@/components/DonationSlider";
import TaxDeduction from "@/components/TaxDeduction";
import DonationBasket from "@/components/DonationBasket";
import DonationImpact from "@/components/DonationImpact";
import SocialProof from "@/components/SocialProof";
import ImpactTimeline from "@/components/ImpactTimeline";
import { Button } from "@/components/ui/button";
import { MIN_DONATION, MAX_DONATION, CAUSE_KEY_MAP } from "@/lib/constants";
import { composeBasket, type ProductRecord, type ProfileMapping } from "@/lib/basketEngine";
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
  profile_type?: string;
  diet_tags?: string[];
  culture_tags?: string[];
  situation_id?: string;
}

const DonationFlow = () => {
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [profileMapping, setProfileMapping] = useState<ProfileMapping | null>(null);
  const [causeKey, setCauseKey] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState(MIN_DONATION);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const totalAmount = donationAmount;
  const progressPercent = ((donationAmount - MIN_DONATION) / (MAX_DONATION - MIN_DONATION)) * 100;
  const isHighTier = donationAmount >= 45;

  // ── Data Loading ─────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      const [bRes, pRes] = await Promise.all([
        supabase.from("beneficiaries_public").select("*").eq("id", beneficiaryId).single(),
        supabase.from("products").select("*").order("price"),
      ]);

      const b = bRes.data as unknown as Beneficiary;
      setBeneficiary(b);
      setProducts((pRes.data as unknown as ProductRecord[]) || []);

      // Load profile mapping if beneficiary has a profile_type
      if (b?.profile_type) {
        const { data: mapping } = await supabase
          .from("profile_mappings" as any)
          .select("*")
          .eq("profile_type", b.profile_type)
          .single();
        if (mapping) setProfileMapping(mapping as unknown as ProfileMapping);
      }

      // Resolve cause key from situation → cause
      if (b?.situation_id) {
        const { data: sit } = await supabase
          .from("situations")
          .select("cause_id")
          .eq("id", b.situation_id)
          .single();
        if (sit?.cause_id) {
          const { data: cause } = await supabase
            .from("causes")
            .select("title")
            .eq("id", sit.cause_id)
            .single();
          if (cause?.title) {
            setCauseKey(CAUSE_KEY_MAP[cause.title] || "");
          }
        }
      }

      setLoading(false);
    };

    load();
    supabase.functions.invoke("track-profile-view", {
      body: { beneficiary_id: beneficiaryId, event_type: "view" },
    });
  }, [beneficiaryId]);

  // ── Basket Computation ───────────────────────────────────

  const basket = useMemo(() => {
    if (!profileMapping || !causeKey || products.length === 0) {
      // Fallback: tier-based filtering for beneficiaries without profile_type
      const tierIndex = donationAmount >= 75 ? 3 : donationAmount >= 60 ? 2 : donationAmount >= 45 ? 1 : 0;
      const tierValue = [1, 2, 3, 4][tierIndex];
      return products
        .filter((p) => p.tier <= tierValue)
        .slice(0, 12)
        .map((p) => ({
          product: p,
          quantity: p.tier === 1 && donationAmount >= 45 ? 2 : 1,
        }));
    }

    return composeBasket({
      products,
      profileMapping,
      causeKey,
      donationAmount,
      dietaryFilters: beneficiary?.diet_tags || [],
    });
  }, [products, profileMapping, causeKey, donationAmount, beneficiary?.diet_tags]);

  // ── Donate Handler ───────────────────────────────────────

  const handleDonate = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour faire un don");
      navigate("/auth");
      return;
    }
    setSubmitting(true);

    try {
      const productsSent = basket.map((item) => ({ id: item.product.id, name: item.product.name, qty: item.quantity }));

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

  // ── Render States ────────────────────────────────────────

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
            products={basket.map((i) => ({ id: i.product.id, name: i.product.name }))}
            basket={basket}
            emergencyPack={null}
            beneficiaryId={beneficiary.id}
          />
        </div>
      </Layout>
    );
  }

  // ── Main UI ──────────────────────────────────────────────

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

            <p className="text-sm text-muted-foreground -mt-2">
              Votre contribution est automatiquement transformée en aide concrète pour {beneficiary.alias_first_name}. Le contenu du colis s'adapte au montant choisi.
            </p>

            <DonationImpact amount={donationAmount} basket={basket} />

            <TaxDeduction
              amount={donationAmount}
            />

            <DonationBasket
              items={basket}
              amount={donationAmount}
              progressPercent={progressPercent}
            />

            <SocialProof
              variant="donation"
              beneficiaryName={beneficiary.alias_first_name}
              beneficiaryId={beneficiary.id}
            />

            {/* Donate button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => navigate(`/upsell/${beneficiaryId}`, {
                  state: { donationAmount, beneficiaryName: beneficiary.alias_first_name },
                })}
                className={`w-full text-cta-foreground text-lg py-6 shadow-warm-lg transition-all ${
                  isHighTier
                    ? "bg-gradient-to-r from-cta to-cta/80 hover:from-cta/90 hover:to-cta/70 animate-[pulse_3s_ease-in-out_infinite]"
                    : "bg-cta hover:bg-cta/90"
                }`}
                size="lg"
              >
                <Heart className="h-5 w-5 mr-2" />
                Aider {beneficiary.alias_first_name} avec ce colis ({totalAmount}€)
              </Button>
            </motion.div>

            <ImpactTimeline />

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
