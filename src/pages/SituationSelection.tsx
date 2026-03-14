import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/BackButton";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { CARD_STYLES, SECTION_HEADER } from "@/lib/designSystem";

interface Situation {
  id: string;
  cause_id: string;
  title: string;
  description: string;
  emotional_sentence: string;
}

const SituationSelection = () => {
  const { causeId } = useParams();
  const [situations, setSituations] = useState<Situation[]>([]);
  const [causeName, setCauseName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("situations").select("*").eq("cause_id", causeId).order("sort_order"),
      supabase.from("causes").select("title").eq("id", causeId).single(),
    ]).then(([sitRes, causeRes]) => {
      setSituations((sitRes.data as Situation[]) || []);
      setCauseName((causeRes.data as any)?.title || "");
      setLoading(false);
    });
  }, [causeId]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <BackButton to="/causes" label="Retour aux causes" />

        <div className={SECTION_HEADER.wrapper}>
          <h1 className={SECTION_HEADER.title}>{causeName}</h1>
          <p className={SECTION_HEADER.subtitle}>Choisissez une situation pour découvrir qui vous pouvez aider.</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${CARD_STYLES.page} animate-pulse h-48`} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {situations.map((sit, i) => (
              <motion.div
                key={sit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/situations/${sit.id}/beneficiaries`}
                  className={`block ${CARD_STYLES.page} ${CARD_STYLES.hover} group`}
                >
                  <h3 className={`text-lg font-semibold text-foreground mb-3 ${CARD_STYLES.titleHover}`}>
                    {sit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{sit.description}</p>
                  <div className="flex items-start gap-2 text-sm italic text-primary/80">
                    <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {sit.emotional_sentence}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SituationSelection;
