import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import SocialProof from "@/components/SocialProof";
import { CARD_STYLES, SECTION_HEADER } from "@/lib/designSystem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin } from "lucide-react";
import { getDonorLocationFromIP } from "@/lib/geoLocation";

import causeChildFamily from "@/assets/causes/cause-child-family.webp";
import causeWomenRecovery from "@/assets/causes/cause-women-recovery.jpg";
import causeStudent from "@/assets/causes/cause-student.jpg";
import causeElderly from "@/assets/causes/cause-elderly.jpg";
import causeWorkingPoor from "@/assets/causes/cause-working-poor.jpg";
import causeHealth from "@/assets/causes/cause-health.jpg";

interface Cause {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface CauseCounts {
  cause_id: string;
  total_count: number;
  nearby_count: number;
}

// Map cause icon key → photo import
const CAUSE_PHOTOS: Record<string, string> = {
  Baby: causeChildFamily,
  Heart: causeWomenRecovery,
  GraduationCap: causeStudent,
  HandHeart: causeElderly,
  Briefcase: causeWorkingPoor,
  Stethoscope: causeHealth,
};

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
              <div key={i} className={`${CARD_STYLES.page} animate-pulse h-64`} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {causes.map((cause, i) => {
              const photo = CAUSE_PHOTOS[cause.icon || "Heart"];
              const badge = CAUSE_BADGES[cause.icon || "Heart"];
              return (
                <motion.div
                  key={cause.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/causes/${cause.id}/situations`}
                    className={`block rounded-2xl border shadow-card overflow-hidden group hover:shadow-lg transition-shadow bg-card`}
                  >
                    {/* Photo */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={photo}
                        alt={cause.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={800}
                        height={600}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className={`text-lg font-semibold text-foreground mb-1.5 ${CARD_STYLES.titleHover}`}>
                        {cause.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{cause.description}</p>

                      {/* Social proof badge */}
                      {badge && (
                        <Badge variant={badge.variant} className="text-xs font-medium">
                          {badge.text}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CauseSelection;
