import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart, Gift, Package, Heart } from "lucide-react";
import TaxDeduction from "@/components/TaxDeduction";
import type { CheckoutData } from "./CheckoutFlow";

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
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedBasket = checkoutData.basketItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    const basketTotal = updatedBasket.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const newTotal = basketTotal + (checkoutData.emergencyPack?.amount || 0);

    onUpdateData({
      basketItems: updatedBasket,
      totalAmount: newTotal,
    });
  };

  const basketSubtotal = checkoutData.basketItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const emergencyPack = checkoutData.emergencyPack;

  return (
    <div className="space-y-6">
      {/* Donation Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Envoi du colis à {beneficiary.alias_first_name}
              </span>
            </div>
            <span className="font-semibold text-foreground">{basketSubtotal.toFixed(2)}€</span>
          </div>

          {emergencyPack && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-cta" />
                <span className="text-sm font-medium text-foreground">
                  {emergencyPack.name || "Soutien immédiat situation urgente"}
                </span>
              </div>
              <span className="font-semibold text-cta">{emergencyPack.amount}€</span>
            </div>
          )}

          <div className="border-t border-primary/20 pt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{checkoutData.totalAmount.toFixed(2)}€</span>
          </div>
        </CardContent>
      </Card>

      {/* Cart Items */}
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
                <h4 className="font-medium">{item.product.display_name || item.product.name}</h4>
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
        </CardContent>
      </Card>

      {/* Tax Deduction */}
      <TaxDeduction amount={checkoutData.totalAmount} />

      {/* Continue Button */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
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
  );
};

export default CartSummary;
