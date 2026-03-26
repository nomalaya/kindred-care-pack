import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BasketItem } from "@/lib/basketEngine";

interface Props {
  basket: BasketItem[];
  donationAmount: number;
  situationId?: string;
}

interface NarrativeProfile {
  narrative_tier1: string | null;
  narrative_tier2: string | null;
  narrative_tier3: string | null;
  narrative_tier4: string | null;
}

const CATEGORY_CONFIG: Record<string, { emoji: string; singular: string; plural: string }> = {
  alimentaire: { emoji: "🍽️", singular: "produit alimentaire", plural: "produits alimentaires" },
  hygiène: { emoji: "🧼", singular: "produit d'hygiène", plural: "produits d'hygiène" },
  bébé: { emoji: "👶", singular: "article bébé", plural: "articles bébé" },
  entretien: { emoji: "🏠", singular: "produit d'entretien", plural: "produits d'entretien" },
  vêtements: { emoji: "👕", singular: "vêtement", plural: "vêtements" },
  enfants: { emoji: "🧸", singular: "article enfant", plural: "articles enfants" },
  confort: { emoji: "🍫", singular: "produit confort", plural: "produits confort" },
  beauté: { emoji: "💄", singular: "soin beauté", plural: "soins beauté" },
  maison: { emoji: "🧹", singular: "article maison", plural: "articles maison" },
};

// Fallback narrative phrases when no situation-specific ones are available
const FALLBACK_NARRATIVES: Record<number, string> = {
  20: "Couvre les besoins essentiels",
  35: "Alimentation et hygiène pour plusieurs jours",
  50: "Un colis complet avec confort et dignité",
  75: "Un colis complet, pensé avec soin",
};

function getNarrativeTier(amount: number): number {
  if (amount >= 75) return 4;
  if (amount >= 50) return 3;
  if (amount >= 35) return 2;
  return 1;
}

function getFallbackNarrative(amount: number): string {
  if (amount >= 75) return FALLBACK_NARRATIVES[75];
  if (amount >= 50) return FALLBACK_NARRATIVES[50];
  if (amount >= 35) return FALLBACK_NARRATIVES[35];
  return FALLBACK_NARRATIVES[20];
}

const DonationImpactCard = ({ basket, donationAmount, situationId }: Props) => {
  const [narrative, setNarrative] = useState<NarrativeProfile | null>(null);

  // Fetch narrative phrases for this situation
  useEffect(() => {
    if (!situationId) return;
    supabase
      .from("impact_profiles" as any)
      .select("narrative_tier1, narrative_tier2, narrative_tier3, narrative_tier4")
      .eq("situation_id", situationId)
      .single()
      .then(({ data }) => {
        if (data) setNarrative(data as unknown as NarrativeProfile);
      });
  }, [situationId]);

  // Count products by category
  const categoryLines = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of basket) {
      const cat = item.product.category;
      counts[cat] = (counts[cat] || 0) + item.quantity;
    }

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => {
        const config = CATEGORY_CONFIG[category];
        if (!config) return null;
        return {
          emoji: config.emoji,
          text: `${count} ${count > 1 ? config.plural : config.singular}`,
          count,
          category,
        };
      })
      .filter(Boolean) as { emoji: string; text: string; count: number; category: string }[];
  }, [basket]);

  // Select the right narrative phrase
  const narrativeText = useMemo(() => {
    const tier = getNarrativeTier(donationAmount);
    if (narrative) {
      const key = `narrative_tier${tier}` as keyof NarrativeProfile;
      if (narrative[key]) return narrative[key];
    }
    return getFallbackNarrative(donationAmount);
  }, [narrative, donationAmount]);

  if (categoryLines.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Votre colis contient
      </h3>
      <div className="space-y-3">
        {categoryLines.map((line) => (
          <motion.div
            key={line.category}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-xl">{line.emoji}</span>
            <span className="text-sm text-foreground">
              <AnimatePresence mode="wait">
                <motion.span
                  key={line.count}
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold"
                >
                  {line.text}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Narrative phrase */}
      {narrativeText && (
        <motion.p
          key={narrativeText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4 border-t text-sm italic text-primary/80 text-center"
        >
          « {narrativeText} »
        </motion.p>
      )}
    </div>
  );
};

export default DonationImpactCard;
