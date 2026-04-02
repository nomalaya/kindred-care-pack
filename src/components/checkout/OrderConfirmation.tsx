import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Share2, Heart, Gift, Receipt, Mail } from "lucide-react";
import TaxInfoLink from "@/components/TaxInfoLink";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import SocialProof from "@/components/SocialProof";
import PostDonSocialBlock from "@/components/PostDonSocialBlock";

import { toast } from "sonner";
import { getAgeRange } from "@/lib/ageRange";
import { generateIndividualReceipt } from "@/lib/generateReceipt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CheckoutData } from "./CheckoutFlow";

interface Beneficiary {
  id: string;
  alias_first_name: string;
  approx_age: number;
  region: string;
  avatar_gender: string;
  avatar_age_range: string;
  avatar_hair_type: string;
  avatar_skin_tone: string;
  avatar_url?: string;
}

interface Props {
  beneficiary: Beneficiary;
  checkoutData: CheckoutData;
}

const OrderConfirmation = ({ beneficiary, checkoutData }: Props) => {
  const { user } = useAuth();
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  useEffect(() => {
    // Track successful donation
    const trackSuccess = () => {
      // Google Analytics tracking (if available)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
          transaction_id: checkoutData.sessionId,
          value: checkoutData.totalAmount,
          currency: 'EUR',
          items: checkoutData.basketItems.map(item => ({
            item_id: item.product.id,
            item_name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
        });
      }
    };

    trackSuccess();
  }, [checkoutData]);

  const handleDownloadReceipt = () => {
    generateIndividualReceipt(
      {
        id: checkoutData.sessionId || "unknown",
        amount: checkoutData.totalAmount,
        created_at: new Date().toISOString(),
        beneficiaryName: beneficiary.alias_first_name,
        beneficiaryRegion: beneficiary.region,
      },
      {
        name: checkoutData.donorInfo?.name || "Donateur",
        email: checkoutData.donorInfo?.email || "",
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `J'ai aidé ${beneficiary.alias_first_name}`,
          text: `Je viens de faire un don solidaire de ${checkoutData.totalAmount}€ pour aider ${beneficiary.alias_first_name}. Rejoignez-moi dans cette démarche !`,
          url: window.location.origin,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      const text = `Je viens de faire un don solidaire de ${checkoutData.totalAmount}€ pour aider ${beneficiary.alias_first_name}. Rejoignez-moi ! ${window.location.origin}`;
      await navigator.clipboard.writeText(text);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  const taxDeduction = checkoutData.totalAmount * 0.66;
  const realCost = checkoutData.totalAmount * 0.34;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                Merci pour votre générosité !
              </h2>
              <p className="text-green-700 dark:text-green-300">
                Votre don de {checkoutData.totalAmount.toFixed(2)}€ pour {beneficiary.alias_first_name} a été confirmé.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Beneficiary Thank You */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <BeneficiaryAvatar
              name={beneficiary.alias_first_name}
              gender={beneficiary.avatar_gender}
              ageRange={beneficiary.avatar_age_range}
              hairType={beneficiary.avatar_hair_type}
              skinTone={beneficiary.avatar_skin_tone}
              avatarUrl={beneficiary.avatar_url}
              size="md"
            />
            <div>
              <h3 className="font-semibold">
                {beneficiary.alias_first_name} vous remercie !
              </h3>
              <p className="text-sm text-muted-foreground">
                {getAgeRange(beneficiary.approx_age)} • {beneficiary.region}
              </p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 italic text-center">
            <Heart className="h-5 w-5 text-red-500 mx-auto mb-2" />
            "Grâce à votre générosité, je vais pouvoir avoir un colis qui va vraiment m'aider. 
            Merci du fond du cœur pour votre solidarité."
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Résumé de votre don
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          {checkoutData.basketItems.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>{(item.product as any).display_name || item.product.name} × {item.quantity}</span>
              <span>{(item.product.price * item.quantity).toFixed(2)}€</span>
            </div>
          ))}
          
          {checkoutData.emergencyPack && (
            <div className="flex justify-between text-sm">
              <span>
                {checkoutData.emergencyPack.description}
                {checkoutData.emergencyBeneficiary && (
                  <span className="text-muted-foreground"> — pour <strong>{checkoutData.emergencyBeneficiary.alias_first_name}</strong></span>
                )}
              </span>
              <span>{checkoutData.emergencyPack.amount.toFixed(2)}€</span>
            </div>
          )}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Total du don :</span>
              <span>{checkoutData.totalAmount.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span className="inline-flex items-center">Déduction fiscale (66%) <TaxInfoLink /></span>
              <span>-{taxDeduction.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-green-700">
              <span className="inline-flex items-center">Coût réel après réduction <TaxInfoLink /></span>
              <span>{realCost.toFixed(2)}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={handleDownloadReceipt}
          variant="outline" 
          className="h-12"
        >
          <Download className="h-4 w-4 mr-2" />
          Reçu fiscal
        </Button>
        
        <Button 
          onClick={handleShare}
          variant="outline" 
          className="h-12"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </div>

      {/* Magic link post-don — non-connectés uniquement */}
      {!user && checkoutData.donorInfo?.email && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center space-y-3">
            <Mail className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold text-foreground">Accédez à votre espace donateur</h3>
            <p className="text-sm text-muted-foreground">
              Recevez un lien par email pour suivre votre don et télécharger vos reçus fiscaux — sans mot de passe.
            </p>
            {magicLinkSent ? (
              <p className="text-sm text-green-600 font-medium">
                ✓ Lien envoyé ! Vérifiez votre boîte email.
              </p>
            ) : (
              <Button
                onClick={async () => {
                  setSendingLink(true);
                  try {
                    const { error } = await supabase.auth.signInWithOtp({
                      email: checkoutData.donorInfo!.email,
                    });
                    if (error) throw error;
                    setMagicLinkSent(true);
                    toast.success("Lien envoyé ! Vérifiez votre boîte email.");
                  } catch {
                    toast.error("Impossible d'envoyer le lien. Réessayez.");
                  } finally {
                    setSendingLink(false);
                  }
                }}
                disabled={sendingLink}
                className="bg-primary text-primary-foreground"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sendingLink ? "Envoi..." : "Recevoir mon lien d'accès"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Prochaines étapes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Préparation du colis</p>
              <p className="text-sm text-muted-foreground">
                Votre colis sera préparé et expédié dans les 2-3 jours ouvrés
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-muted rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Livraison</p>
              <p className="text-sm text-muted-foreground">
                {beneficiary.alias_first_name} recevra son colis sous 5-7 jours
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-muted rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Reçu fiscal</p>
              <p className="text-sm text-muted-foreground">
                Vous recevrez votre reçu fiscal par email dans les prochains jours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Proof */}
      <SocialProof
        variant="confirmation"
        beneficiaryName={beneficiary.alias_first_name}
        beneficiaryId={beneficiary.id}
      />

      {/* Post-don social block */}
      <PostDonSocialBlock />


      {/* Call to Action */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Continuez à faire la différence</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Il y a encore de nombreuses personnes qui ont besoin d'aide
          </p>
          <Button 
            onClick={() => window.location.href = '/causes'}
            variant="outline"
          >
            Aider d'autres personnes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmation;