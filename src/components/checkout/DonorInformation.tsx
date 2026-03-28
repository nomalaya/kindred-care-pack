import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, ArrowRight, ArrowLeft } from "lucide-react";
import TaxInfoLink from "@/components/TaxInfoLink";
import { useAuth } from "@/hooks/useAuth";
import type { CheckoutData } from "./CheckoutFlow";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  createAccount: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  checkoutData: CheckoutData;
  onUpdateData: (updates: Partial<CheckoutData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const DonorInformation = ({ checkoutData, onUpdateData, onNext, onPrevious }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: checkoutData.donorInfo?.name || user?.user_metadata?.display_name || "",
      email: checkoutData.donorInfo?.email || user?.email || "",
      phone: checkoutData.donorInfo?.phone || "",
      createAccount: checkoutData.donorInfo?.createAccount || false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    
    // Update checkout data with donor information
    onUpdateData({
      donorInfo: {
        name: values.name,
        email: values.email,
        phone: values.phone,
        createAccount: values.createAccount && !user, // Only create account if not already logged in
      },
    });

    // Small delay for better UX
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Vos informations
          </CardTitle>
          <p className="text-muted-foreground">
            Ces informations nous permettront de vous envoyer la confirmation et le reçu fiscal.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse email</FormLabel>
                    <FormControl>
                      <Input placeholder="jean.dupont@email.com" type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Votre reçu fiscal sera envoyé à cette adresse
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormDescription>
                      Pour vous tenir informé de l'avancement de votre don
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!user && (
                <FormField
                  control={form.control}
                  name="createAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Créer un compte pour suivre mes dons
                        </FormLabel>
                        <FormDescription>
                          Vous pourrez suivre l'impact de vos dons et retrouver vos reçus fiscaux
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">Récapitulatif du don</h4>
                <div className="flex justify-between text-sm">
                  <span>Montant total :</span>
                  <span className="font-semibold">{checkoutData.totalAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Déduction fiscale (66%) :</span>
                  <span>-{(checkoutData.totalAmount * 0.66).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
                  <span>Coût réel après réduction :</span>
                  <span>{(checkoutData.totalAmount * 0.34).toFixed(2)}€</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevious}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au panier
                </Button>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      "Traitement..."
                    ) : (
                      <>
                        Continuer vers le paiement
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorInformation;