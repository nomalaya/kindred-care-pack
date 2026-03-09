import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart, Gift } from "lucide-react";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import EmergencyUpsell from "@/components/EmergencyUpsell";
import TaxDeduction from "@/components/TaxDeduction";
import type { CheckoutData } from "./CheckoutFlow";
import type { EmergencyPack } from "@/lib/constants";

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

interface Props {
  beneficiary: Beneficiary;
  checkoutData: CheckoutData;
  onUpdateData: (updates: Partial<CheckoutData>) => void;
  onNext: () => void;
}

const CartSummary = ({ beneficiary, checkoutData, onUpdateData, onNext }: Props) => {
  const [emergencyPack, setEmergencyPack] = useState<EmergencyPack | null>(checkoutData.emergencyPack);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedBasket = checkoutData.basketItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    const newTotal = updatedBasket.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) 
      + (emergencyPack?.amount || 0);

    onUpdateData({
      basketItems: updatedBasket,
      totalAmount: newTotal,
      emergencyPack,
    });
  };

  const handleEmergencyPackChange = (pack: EmergencyPack | null) => {
    setEmergencyPack(pack);
    
    const basketTotal = checkoutData.basketItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const newTotal = basketTotal + (pack?.amount || 0);

    onUpdateData({
      emergencyPack: pack,
      totalAmount: newTotal,
    });
  };

  const basketSubtotal = checkoutData.basketItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Beneficiary Info */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardContent className="p-6">
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
            <h3 className="text-lg font-semibold text-center mb-2">
              {beneficiary.alias_first_name} – {beneficiary.approx_age} ans
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">{beneficiary.region}</p>
            <p className="text-sm text-muted-foreground">{beneficiary.short_story}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Votre colis solidaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkoutData.basketItems.map((item) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.product.category}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right min-w-[60px]">
                    <p className="font-semibold">{(item.product.price * item.quantity).toFixed(2)}€</p>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Sous-total :</span>
                <span>{basketSubtotal.toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <EmergencyUpsell
          selectedPack={emergencyPack}
          onSelectPack={handleEmergencyPackChange}
        />

        <TaxDeduction
          amount={basketSubtotal}
          extraAmount={emergencyPack?.amount}
          extraLabel={emergencyPack?.name}
        />

        {/* Total and Continue */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total :</span>
              <span className="text-2xl font-bold text-primary">
                {checkoutData.totalAmount.toFixed(2)}€
              </span>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onNext}
                className="w-full text-lg py-6"
                size="lg"
              >
                <Gift className="h-5 w-5 mr-2" />
                Continuer vers les informations
              </Button>
            </motion.div>

            <p className="text-xs text-center text-muted-foreground mt-2">
              Vos informations et le paiement sont sécurisés
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartSummary;