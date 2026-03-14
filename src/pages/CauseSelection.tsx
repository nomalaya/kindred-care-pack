import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { CAUSE_ICONS } from "@/lib/constants";
import { motion } from "framer-motion";
import SocialProof from "@/components/SocialProof";
import { CARD_STYLES, SECTION_HEADER } from "@/lib/designSystem";

interface Cause {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const CauseSelection = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("causes").select("*").order("sort_order").then(({ data }) => {
      setCauses((data as Cause[]) || []);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className={SECTION_HEADER.wrapper}>
          <h1 className={SECTION_HEADER.title}>Choisissez une cause</h1>
          <p className={`${SECTION_HEADER.subtitle} max-w-2xl mx-auto mb-4`}>
            Chaque cause représente de vraies personnes confrontées à de vrais défis. Choisissez celle qui vous parle.
          </p>
          <SocialProof variant="cause" />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${CARD_STYLES.page} animate-pulse h-48`} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {causes.map((cause, i) => (
              <motion.div
                key={cause.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/causes/${cause.id}/situations`}
                  className={`block ${CARD_STYLES.page} ${CARD_STYLES.hover} group`}
                >
                  <div className="text-4xl mb-4">{CAUSE_ICONS[cause.icon || "Heart"] || "❤️"}</div>
                  <h3 className={`text-lg font-semibold text-foreground mb-2 ${CARD_STYLES.titleHover}`}>
                    {cause.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{cause.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CauseSelection;
