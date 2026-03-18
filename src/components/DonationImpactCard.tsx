import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BasketItem } from "@/lib/basketEngine";

interface Props {
  basket: BasketItem[];
  situationId?: string;
}

interface ImpactUnit {
  product_id: string;
  impact_type: string;
  impact_value: number;
}

interface ImpactProfile {
  impact_type_1: string;
  impact_type_2: string;
  impact_type_3: string;
  impact_type_4?: string;
}

const IMPACT_LABELS: Record<string, { emoji: string; label: (v: number) => string }> = {
  meals: {
    emoji: "🍽️",
    label: (v) => `${formatDuration(v)} de repas essentiels`,
  },
  breakfasts: {
    emoji: "☕",
    label: (v) => `${v} petit${v > 1 ? "s" : ""}-déjeuner${v > 1 ? "s" : ""}`,
  },
  kids_snacks: {
    emoji: "🧒",
    label: (v) => `${v} goûter${v > 1 ? "s" : ""} pour les enfants`,
  },
  hygiene_corps: {
    emoji: "🧼",
    label: (v) => `${formatDuration(v)} de soins corporels`,
  },
  entretien_maison: {
    emoji: "🏠",
    label: (v) => `${v} produit${v > 1 ? "s" : ""} d'entretien ménager`,
  },
  daily_products: {
    emoji: "🧹",
    label: (v) => `${v} produit${v > 1 ? "s" : ""} du quotidien`,
  },
  quick_meals: {
    emoji: "🥫",
    label: (v) => `${v} repas rapide${v > 1 ? "s" : ""}`,
  },
  wellbeing: {
    emoji: "🌿",
    label: (v) => `${v} moment${v > 1 ? "s" : ""} de bien-être`,
  },
  baby_care: {
    emoji: "👶",
    label: (v) => `${formatDuration(v)} de soins bébé`,
  },
  vetements: {
    emoji: "👕",
    label: (v) => `${v} vêtement${v > 1 ? "s" : ""}`,
  },
  jouets: {
    emoji: "🧸",
    label: (v) => `${v} jouet${v > 1 ? "s" : ""} pour les enfants`,
  },
};

function formatDuration(days: number): string {
  if (days <= 1) return "1 jour";
  return `${days} jours`;
}

const AnimatedNum = ({ value }: { value: number }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 6, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="font-bold text-foreground"
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const DonationImpactCard = ({ basket, situationId }: Props) => {
  const [impactUnits, setImpactUnits] = useState<ImpactUnit[]>([]);
  const [profile, setProfile] = useState<ImpactProfile | null>(null);
  const highWaterMark = useRef<Record<string, number>>({});

  // Reset high-water mark when switching beneficiary
  useEffect(() => {
    highWaterMark.current = {};
  }, [situationId]);

  useEffect(() => {
    if (!situationId) return;
    supabase
      .from("impact_profiles" as any)
      .select("impact_type_1, impact_type_2, impact_type_3, impact_type_4")
      .eq("situation_id", situationId)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as unknown as ImpactProfile);
      });
  }, [situationId]);

  // Fetch impact_units only for products in the basket (avoids 1000-row limit)
  useEffect(() => {
    const productIds = basket.map((item) => item.product.id);
    if (productIds.length === 0) return;
    supabase
      .from("impact_units" as any)
      .select("product_id, impact_type, impact_value")
      .in("product_id", productIds)
      .then(({ data }) => {
        if (data) setImpactUnits(data as unknown as ImpactUnit[]);
      });
  }, [basket]);

  const lines = useMemo(() => {
    if (!profile || impactUnits.length === 0) return [];

    const types = [profile.impact_type_1, profile.impact_type_2, profile.impact_type_3, profile.impact_type_4].filter(Boolean) as string[];
    const result: { emoji: string; text: string; value: number }[] = [];

    for (const type of types) {
      let total = 0;
      for (const item of basket) {
        const units = impactUnits.filter(
          (u) => u.product_id === item.product.id && u.impact_type === type
        );
        for (const u of units) {
          total += Number(u.impact_value) * item.quantity;
        }
      }
      total = Math.floor(total);

      // High-water mark: impact never decreases during a session
      const displayed = Math.max(total, highWaterMark.current[type] || 0);
      highWaterMark.current[type] = displayed;

      if (displayed <= 0) continue;

      const config = IMPACT_LABELS[type];
      if (!config) continue;

      result.push({
        emoji: config.emoji,
        text: config.label(displayed),
        value: displayed,
      });
    }

    return result;
  }, [profile, impactUnits, basket]);

  if (lines.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Impact de votre aide
      </h3>
      <div className="space-y-3">
        {lines.map((line) => (
          <motion.div
            key={line.emoji}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-xl">{line.emoji}</span>
            <span className="text-sm text-foreground">{line.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DonationImpactCard;
