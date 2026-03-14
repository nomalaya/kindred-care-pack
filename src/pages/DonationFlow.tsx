import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import DonationConfirmation from "@/components/DonationConfirmation";
import DonationAmountSelector from "@/components/DonationAmountSelector";
import DonationImpactCard from "@/components/DonationImpactCard";
import DonationBasket from "@/components/DonationBasket";
import ImpactTimeline from "@/components/ImpactTimeline";
import { Button } from "@/components/ui/button";
import { DEFAULT_DONATION, CAUSE_KEY_MAP } from "@/lib/constants";
import { composeBasket, type ProductRecord, type ProfileMapping } from "@/lib/basketEngine";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin, Quote } from "lucide-react";
import { getAgeRange } from "@/lib/ageRange";
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
  children_count?: number;
  family_members?: number;
}

const DonationFlow = () => {
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [profileMapping, setProfileMapping] = useState<ProfileMapping | null>(null);
  const [causeKey, setCauseKey] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState(DEFAULT_DONATION);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

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

      if (b?.profile_type) {
        const { data: mapping } = await supabase
          .from("profile_mappings" as any)
          .select("*")
          .eq("profile_type", b.profile_type)
          .single();
        if (mapping) setProfileMapping(mapping as unknown as ProfileMapping);
      }

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

  // Check follow status
  useEffect(() => {
    if (!user || !beneficiaryId) return;
    supabase
      .from("followed_beneficiaries" as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("beneficiary_id", beneficiaryId)
      .maybeSingle()
      .then(({ data }) => setIsFollowed(!!data));
  }, [user, beneficiaryId]);

  const toggleFollow = async () => {
    if (!user) {
      toast.error("Connectez-vous pour suivre un bénéficiaire");
      return;
    }
    if (isFollowed) {
      await supabase
        .from("followed_beneficiaries" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("beneficiary_id", beneficiaryId);
      setIsFollowed(false);
    } else {
      await supabase
        .from("followed_beneficiaries" as any)
        .insert({ user_id: user.id, beneficiary_id: beneficiaryId } as any);
      setIsFollowed(true);
    }
  };

  // ── Basket Computation ───────────────────────────────────

  const basket = useMemo(() => {
    if (!profileMapping || !causeKey || products.length === 0) {
      const tierIndex = donationAmount >= 75 ? 3 : donationAmount >= 60 ? 2 : donationAmount >= 36 ? 1 : 0;
      const tierValue = [1, 2, 3, 4][tierIndex];
      return products
        .filter((p) => p.tier <= tierValue)
        .slice(0, Math.max(6, Math.floor(donationAmount / 5)))
        .map((p) => ({
          product: p,
          quantity: p.tier === 1 && donationAmount >= 36 ? 2 : 1,
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

  // ── Render States ────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse max-w-2xl mx-auto bg-card rounded-2xl h-96" />
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
            amount={donationAmount}
            products={basket.map((i) => ({ id: i.product.id, name: i.product.name }))}
            basket={basket}
            emergencyPack={null}
            beneficiaryId={beneficiary.id}
          />
        </div>
      </Layout>
    );
  }

  const hasFamily = (beneficiary.children_count ?? 0) > 0 || (beneficiary.family_members ?? 0) > 1;

  // ── Main UI — Single Column ──────────────────────────────

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <button onClick={() => window.history.back()} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </button>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* 1. Beneficiary card */}
          <div className="bg-card rounded-2xl p-8 shadow-card border text-center relative">
            <button
              onClick={toggleFollow}
              className="absolute top-4 right-4 text-muted-foreground hover:text-rose-500 transition-colors"
              title={isFollowed ? "Ne plus suivre" : "Suivre ce bénéficiaire"}
            >
              <Heart className={`h-6 w-6 ${isFollowed ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
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
            <h2 className="text-xl font-semibold text-foreground">{beneficiary.alias_first_name}</h2>
            <p className="text-sm text-muted-foreground/80 mt-0.5">{getAgeRange(beneficiary.approx_age)}</p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5 mb-3">
              <MapPin className="h-3 w-3" /> {beneficiary.region}
            </div>
            <p className="text-sm text-muted-foreground mb-4">{beneficiary.short_story}</p>
            <div className="flex items-start gap-2 text-sm italic text-primary/80 justify-center">
              <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
              « {beneficiary.emotional_sentence} »
            </div>
          </div>

          {/* 2. Amount selector */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Choisissez votre don</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Ajustez le montant pour composer le colis de {beneficiary.alias_first_name}.
            </p>
            <DonationAmountSelector value={donationAmount} onChange={setDonationAmount} />
          </div>

          {/* 3. Impact card */}
          <DonationImpactCard
            beneficiaryName={beneficiary.alias_first_name}
            basket={basket}
            hasFamily={hasFamily}
          />

          {/* 4. Basket */}
          <DonationBasket items={basket} amount={donationAmount} />

          {/* 5. Timeline */}
          <ImpactTimeline />

          {/* 6. CTA */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => navigate(`/upsell/${beneficiaryId}`, {
                state: { donationAmount, beneficiaryName: beneficiary.alias_first_name },
              })}
              className="w-full text-cta-foreground text-lg py-6 shadow-warm-lg bg-cta hover:bg-cta/90"
              size="lg"
            >
              <Heart className="h-5 w-5 mr-2" />
              Envoyer ce colis à {beneficiary.alias_first_name} — {donationAmount}€
            </Button>
          </motion.div>

          <p className="text-xs text-center text-muted-foreground">
            Paiement sécurisé. Votre don est utilisé à 100% pour le colis.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default DonationFlow;
