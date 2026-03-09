import { useState } from "react";
import { motion } from "framer-motion";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, ArrowLeft, Lock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CheckoutData } from "./CheckoutFlow";

// Initialize Stripe (using test key for now - should be configured in environment)
const stripePromise = loadStripe("pk_live_51S8g0PL3tw3IkWQWLigd0xSjrjsiDbNlDy85M7Zs3tBmVhJf2D0sH20cYCzp2qj1JkTzPjdqsikN1Fpq7Pj7g1fw00aaTrMblF");

interface Beneficiary {
  id: string;
  alias_first_name: string;
}

interface Props {
  beneficiary: Beneficiary;
  checkoutData: CheckoutData;
  onUpdateData: (updates: Partial<CheckoutData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PaymentForm = ({ beneficiary, checkoutData, onUpdateData, onNext, onPrevious }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !checkoutData.donorInfo) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const { data, error: sessionError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          beneficiary_id: beneficiary.id,
          basket_data: checkoutData.basketItems,
          emergency_pack_data: checkoutData.emergencyPack,
          total_amount: checkoutData.totalAmount,
          donor_name: checkoutData.donorInfo.name,
          donor_email: checkoutData.donorInfo.email,
          donor_phone: checkoutData.donorInfo.phone,
          create_account: checkoutData.donorInfo.createAccount,
        },
      });

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const { client_secret, session_id } = data;

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: checkoutData.donorInfo.name,
            email: checkoutData.donorInfo.email,
            phone: checkoutData.donorInfo.phone,
          },
        },
      });

      if (result.error) {
        setError(result.error.message || "Une erreur est survenue lors du paiement");
      } else {
        // Payment successful
        onUpdateData({ sessionId: session_id });
        toast.success("Paiement réussi !");
        onNext();
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      toast.error("Erreur de paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement sécurisé
          </CardTitle>
          <p className="text-muted-foreground">
            Votre don de {checkoutData.totalAmount.toFixed(2)}€ pour {beneficiary.alias_first_name}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Info Summary */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Colis solidaire :</span>
                <span>{(checkoutData.totalAmount - (checkoutData.emergencyPack?.amount || 0)).toFixed(2)}€</span>
              </div>
              {checkoutData.emergencyPack && (
                <div className="flex justify-between text-sm">
                  <span>{checkoutData.emergencyPack.name} :</span>
                  <span>{checkoutData.emergencyPack.amount.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total :</span>
                <span>{checkoutData.totalAmount.toFixed(2)}€</span>
              </div>
            </div>

            {/* Card Element */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Informations de paiement</label>
              <div className="p-4 border rounded-lg bg-background">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#374151',
                        '::placeholder': {
                          color: '#9CA3AF',
                        },
                      },
                      invalid: {
                        color: '#EF4444',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Security Info */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Paiement sécurisé par Stripe - Vos données bancaires sont protégées
                </div>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                className="flex-1"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux informations
              </Button>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    "Traitement du paiement..."
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Confirmer le don de {checkoutData.totalAmount.toFixed(2)}€
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              En confirmant, vous acceptez nos conditions générales et notre politique de confidentialité.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentMethods = (props: Props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentMethods;