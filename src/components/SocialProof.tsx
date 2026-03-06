import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  variant: "homepage" | "cause" | "donation" | "confirmation";
  beneficiaryName?: string;
  beneficiaryId?: string;
}

interface Stats {
  today_count: number;
  week_count: number;
  total_count: number;
  avg_amount: number;
}

const SocialProof = ({ variant, beneficiaryName, beneficiaryId }: Props) => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    supabase
      .rpc("get_donation_stats", { p_beneficiary_id: beneficiaryId || null })
      .then(({ data }) => {
        if (data) setStats(data as unknown as Stats);
      });
  }, [beneficiaryId]);

  if (!stats) return null;

  const messages: Record<string, React.ReactNode[]> = {
    homepage: [
      stats.today_count > 0
        ? `${stats.today_count} personne${stats.today_count > 1 ? "s" : ""} ont aidé quelqu'un aujourd'hui.`
        : "Rejoignez la communauté de donateurs solidaires.",
      stats.total_count > 0
        ? `Plus de ${stats.total_count} colis solidaires envoyés.`
        : null,
    ].filter(Boolean),
    cause: [
      stats.week_count > 0
        ? `${stats.week_count} personne${stats.week_count > 1 ? "s" : ""} ont aidé cette semaine.`
        : "Soyez le premier à aider cette semaine.",
    ],
    donation: [
      beneficiaryName
        ? `Les donateurs qui aident ${beneficiaryName} donnent en moyenne ${stats.avg_amount}€.`
        : `Les donateurs donnent en moyenne ${stats.avg_amount}€.`,
    ],
    confirmation: [
      stats.week_count > 0
        ? `${stats.week_count} donateur${stats.week_count > 1 ? "s" : ""} ont déjà aidé cette semaine.`
        : "Vous faites partie des premiers donateurs de la semaine !",
    ],
  };

  const items = messages[variant] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-start gap-2 text-sm text-muted-foreground"
    >
      <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/60" />
      <div className="space-y-0.5">
        {items.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
    </motion.div>
  );
};

export default SocialProof;
