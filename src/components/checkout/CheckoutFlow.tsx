import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import CartSummary from "./CartSummary";
import DonorInformation from "./DonorInformation";
import PaymentMethods from "./PaymentMethods";
import OrderConfirmation from "./OrderConfirmation";
import { ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { UpsellOption } from "@/lib/constants";
import { composeBasket, type ProductRecord, type ProfileMapping } from "@/lib/basketEngine";

type CheckoutStep = "cart" | "info" | "payment" | "confirmation";

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

export interface CheckoutData {
  basketItems: Array<{ product: ProductRecord; quantity: number }>;
  emergencyPack: EmergencyPack | null;
  totalAmount: number;
  donorInfo: {
    name: string;
    email: string;
    phone?: string;
    createAccount: boolean;
  } | null;
  sessionId?: string;
  emergencyBeneficiary?: { id: string; alias_first_name: string };
}

const CheckoutFlow = () => {
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Read navigation state from UpsellDonation
  const navState = location.state as {
    donationAmount?: number;
    emergencyPack?: EmergencyPack | null;
    beneficiaryName?: string;
  } | null;

  const initialDonationAmount = navState?.donationAmount || 30;
  const initialEmergencyPack = navState?.emergencyPack || null;
  const initialTotal = initialDonationAmount + (initialEmergencyPack?.amount || 0);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [loading, setLoading] = useState(true);
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [profileMapping, setProfileMapping] = useState<ProfileMapping | null>(null);
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    basketItems: [],
    emergencyPack: initialEmergencyPack,
    totalAmount: initialTotal,
    donorInfo: null,
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
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

        // Initialize basket with donation amount from navigation state
        const initialBasket = composeBasket({
          products: (pRes.data as unknown as ProductRecord[]) || [],
          profileMapping: profileMapping || null,
          causeKey: "",
          donationAmount: initialDonationAmount,
          dietaryFilters: b?.diet_tags || [],
        });

        setCheckoutData(prev => ({
          ...prev,
          basketItems: initialBasket,
          totalAmount: initialDonationAmount + (prev.emergencyPack?.amount || 0),
        }));
      } catch (error) {
        console.error("Error loading checkout data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [beneficiaryId, profileMapping]);

  const steps = [
    { id: "cart", label: "Panier", icon: "1" },
    { id: "info", label: "Informations", icon: "2" },
    { id: "payment", label: "Paiement", icon: "3" },
    { id: "confirmation", label: "Confirmation", icon: "4" },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...updates }));
  };

  const handleNextStep = () => {
    const stepOrder: CheckoutStep[] = ["cart", "info", "payment", "confirmation"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const stepOrder: CheckoutStep[] = ["cart", "info", "payment", "confirmation"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </button>

        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold
                    ${index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}
                  initial={false}
                  animate={{
                    scale: index === currentStepIndex ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </motion.div>
                <span className={`ml-2 text-sm font-medium ${index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === "cart" && (
              <CartSummary
                beneficiary={beneficiary}
                checkoutData={checkoutData}
                onUpdateData={updateCheckoutData}
                onNext={handleNextStep}
              />
            )}

            {currentStep === "info" && (
              <DonorInformation
                checkoutData={checkoutData}
                onUpdateData={updateCheckoutData}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
              />
            )}

            {currentStep === "payment" && (
              <PaymentMethods
                beneficiary={beneficiary}
                checkoutData={checkoutData}
                onUpdateData={updateCheckoutData}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
              />
            )}

            {currentStep === "confirmation" && (
              <OrderConfirmation
                beneficiary={beneficiary}
                checkoutData={checkoutData}
              />
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutFlow;