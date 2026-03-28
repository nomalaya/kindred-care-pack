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
  const [counts, setCounts] = useState<Record<string, CauseCounts>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const loc = await getDonorLocationFromIP();
      const regionCode = loc?.region_code || null;

      const [causesRes, countsRes] = await Promise.all([
        supabase.from("causes").select("*").order("sort_order"),
        supabase.rpc("get_cause_counts", { p_region_code: regionCode }),
      ]);

      setCauses((causesRes.data as Cause[]) || []);

      const countsMap: Record<string, CauseCounts> = {};
      if (countsRes.data) {
        (countsRes.data as unknown as CauseCounts[]).forEach((c) => {
          countsMap[c.cause_id] = c;
        });
      }
      setCounts(countsMap);
      setLoading(false);
    };
    load();
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
              const cc = counts[cause.id];
              return (
                <motion.div
                  key={cause.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/causes/${cause.id}/situations`}
                    className="block rounded-2xl border shadow-card overflow-hidden group hover:shadow-lg hover:ring-2 hover:ring-primary/40 hover:-translate-y-1 transition-all duration-300 bg-card h-full flex flex-col"
                  >
                    {/* Photo with title overlay */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={photo}
                        alt={cause.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        width={800}
                        height={600}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Badges overlay top-left */}
                      {cc && cc.total_count > 0 && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <Badge className="text-xs font-medium gap-1 bg-black/50 text-white border-0 backdrop-blur-sm">
                            <Users className="h-3 w-3" />
                            {cc.total_count} bénéficiaire{cc.total_count > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      )}

                      {/* Title overlay bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white leading-tight">
                          {cause.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-sm text-muted-foreground mb-3">{cause.description}</p>

                      {/* Proximity badge */}
                      {cc && cc.nearby_count > 0 && (
                        <Badge variant="outline" className="text-xs font-medium gap-1 text-primary border-primary/30 w-fit">
                          <MapPin className="h-3 w-3" />
                          {cc.nearby_count} proche{cc.nearby_count > 1 ? "s" : ""} de chez vous
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
