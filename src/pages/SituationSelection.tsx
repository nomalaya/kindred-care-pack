import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/BackButton";
import { motion } from "framer-motion";
import { Quote, Users } from "lucide-react";
import { SECTION_HEADER } from "@/lib/designSystem";
import { Badge } from "@/components/ui/badge";

// Situation photo imports
import sitSingleMother from "@/assets/situations/sit-single-mother.jpg";
import sitChildHandicap from "@/assets/situations/sit-child-handicap.jpg";
import sitRefugeeFamily from "@/assets/situations/sit-refugee-family.jpg";
import sitJobLoss from "@/assets/situations/sit-job-loss.jpg";
import sitViolenceSurvivor from "@/assets/situations/sit-violence-survivor.jpg";
import sitHomelessMother from "@/assets/situations/sit-homeless-mother.jpg";
import sitWomanRecovery from "@/assets/situations/sit-woman-recovery.jpg";
import sitWomanNoIncome from "@/assets/situations/sit-woman-no-income.jpg";
import sitWorkingStudent from "@/assets/situations/sit-working-student.jpg";
import sitOrphanStudent from "@/assets/situations/sit-orphan-student.jpg";
import sitRuralStudent from "@/assets/situations/sit-rural-student.jpg";
import sitSickStudent from "@/assets/situations/sit-sick-student.jpg";
import sitElderlyAlone from "@/assets/situations/sit-elderly-alone.jpg";
import sitElderlyCouple from "@/assets/situations/sit-elderly-couple.jpg";
import sitElderlyFacility from "@/assets/situations/sit-elderly-facility.jpg";
import sitRetiredNoPension from "@/assets/situations/sit-retired-no-pension.jpg";
import sitMinimumWage from "@/assets/situations/sit-minimum-wage.jpg";
import sitPrecariousWorker from "@/assets/situations/sit-precarious-worker.jpg";
import sitPartTime from "@/assets/situations/sit-part-time.jpg";
import sitFreelancerCrisis from "@/assets/situations/sit-freelancer-crisis.jpg";
import sitChronicIllness from "@/assets/situations/sit-chronic-illness.jpg";
import sitPostSurgery from "@/assets/situations/sit-post-surgery.jpg";
import sitMentalHealth from "@/assets/situations/sit-mental-health.jpg";
import sitDisability from "@/assets/situations/sit-disability.jpg";

// Map situation ID → photo
const SITUATION_PHOTOS: Record<string, string> = {
  "b1000000-0000-0000-0000-000000000001": sitSingleMother,
  "b1000000-0000-0000-0000-000000000002": sitChildHandicap,
  "b1000000-0000-0000-0000-000000000003": sitRefugeeFamily,
  "b1000000-0000-0000-0000-000000000004": sitJobLoss,
  "b1000000-0000-0000-0000-000000000005": sitViolenceSurvivor,
  "b1000000-0000-0000-0000-000000000006": sitHomelessMother,
  "b1000000-0000-0000-0000-000000000007": sitWomanRecovery,
  "b1000000-0000-0000-0000-000000000008": sitWomanNoIncome,
  "b1000000-0000-0000-0000-000000000009": sitWorkingStudent,
  "b1000000-0000-0000-0000-000000000010": sitOrphanStudent,
  "b1000000-0000-0000-0000-000000000011": sitRuralStudent,
  "b1000000-0000-0000-0000-000000000012": sitSickStudent,
  "b1000000-0000-0000-0000-000000000013": sitElderlyAlone,
  "b1000000-0000-0000-0000-000000000014": sitElderlyCouple,
  "b1000000-0000-0000-0000-000000000015": sitElderlyFacility,
  "b1000000-0000-0000-0000-000000000016": sitRetiredNoPension,
  "b1000000-0000-0000-0000-000000000017": sitMinimumWage,
  "b1000000-0000-0000-0000-000000000018": sitPrecariousWorker,
  "b1000000-0000-0000-0000-000000000019": sitPartTime,
  "b1000000-0000-0000-0000-000000000020": sitFreelancerCrisis,
  "b1000000-0000-0000-0000-000000000021": sitChronicIllness,
  "b1000000-0000-0000-0000-000000000022": sitPostSurgery,
  "b1000000-0000-0000-0000-000000000023": sitMentalHealth,
  "b1000000-0000-0000-0000-000000000024": sitDisability,
};

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
  const [beneficiaryCounts, setBeneficiaryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [sitRes, causeRes] = await Promise.all([
        supabase.from("situations").select("*").eq("cause_id", causeId).order("sort_order"),
        supabase.from("causes").select("title").eq("id", causeId).single(),
      ]);

      const sits = (sitRes.data as Situation[]) || [];
      setSituations(sits);
      setCauseName((causeRes.data as any)?.title || "");

      // Count beneficiaries per situation
      if (sits.length > 0) {
        const sitIds = sits.map((s) => s.id);
        const { data: benefs } = await supabase
          .from("beneficiaries_public")
          .select("situation_id")
          .eq("is_active", true)
          .in("situation_id", sitIds);

        const countsMap: Record<string, number> = {};
        benefs?.forEach((b: any) => {
          countsMap[b.situation_id] = (countsMap[b.situation_id] || 0) + 1;
        });
        setBeneficiaryCounts(countsMap);
      }

      setLoading(false);
    };
    load();
  }, [causeId]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <BackButton to="/causes" label="Retour aux causes" />

        <div className={SECTION_HEADER.wrapper}>
          <h1 className={SECTION_HEADER.title}>{causeName}</h1>
          <p className={SECTION_HEADER.subtitle}>
            Choisissez une situation pour découvrir qui vous pouvez aider.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border shadow-card animate-pulse h-64 bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {situations.map((sit, i) => {
              const photo = SITUATION_PHOTOS[sit.id];
              const count = beneficiaryCounts[sit.id] || 0;

              return (
                <motion.div
                  key={sit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/situations/${sit.id}/beneficiaries`}
                    className="block rounded-2xl border shadow-card overflow-hidden group hover:shadow-lg hover:ring-2 hover:ring-primary/40 hover:-translate-y-1 transition-all duration-300 bg-card h-full flex flex-col"
                  >
                    {/* Photo with title overlay */}
                    <div className="relative h-48 overflow-hidden">
                      {photo ? (
                        <img
                          src={photo}
                          alt={sit.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          width={800}
                          height={600}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Badge top-right */}
                      {count > 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge className="text-xs font-medium gap-1 bg-primary/80 text-primary-foreground border-0 backdrop-blur-sm">
                            <Users className="h-3 w-3" />
                            {count} bénéficiaire{count > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      )}

                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white leading-tight">
                          {sit.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-sm text-muted-foreground mb-3">{sit.description}</p>
                      {sit.emotional_sentence && (
                        <div className="flex items-start gap-2 text-sm italic text-primary/80 mt-auto">
                          <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {sit.emotional_sentence}
                        </div>
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

export default SituationSelection;
