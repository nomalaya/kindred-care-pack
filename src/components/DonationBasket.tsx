import { AnimatePresence, motion } from "framer-motion";
import { Check, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  tier: number;
}

interface Props {
  products: Product[];
  getProductQuantity: (product: Product) => number;
  amount: number;
  progressPercent: number;
}

const DonationBasket = ({ products, getProductQuantity, amount, progressPercent }: Props) => {
  const [flash, setFlash] = useState(false);
  const [prevCount, setPrevCount] = useState(products.length);

  useEffect(() => {
    if (products.length > prevCount) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      setPrevCount(products.length);
      return () => clearTimeout(t);
    }
    setPrevCount(products.length);
  }, [products.length, prevCount]);

  return (
    <motion.div
      animate={flash ? { backgroundColor: ["hsl(var(--card))", "hsl(160 60% 30% / 0.05)", "hsl(var(--card))"] } : {}}
      transition={{ duration: 0.6 }}
      className="bg-card rounded-2xl p-6 border shadow-card"
    >
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Contenu du colis</h3>
      </div>

      <Progress value={progressPercent} className="h-1.5 mb-4" />

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {products.map((product) => {
            const qty = getProductQuantity(product);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.8, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: "auto" }}
                exit={{ opacity: 0, scale: 0.8, height: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="flex items-center gap-3 py-2 px-3 rounded-lg bg-background"
              >
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground flex-1">
                  {product.name}
                  {qty > 1 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1 text-xs font-medium text-primary"
                    >
                      ×{qty}
                    </motion.span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{products.length} articles</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={amount}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 4, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xl font-bold text-primary"
          >
            {amount}€
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DonationBasket;
