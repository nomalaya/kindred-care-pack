import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import BackButton from "@/components/BackButton";
import { motion } from "framer-motion";
import { MapPin, Quote, Navigation, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getAgeRange } from "@/lib/ageRange";
import { CARD_STYLES, SECTION_HEADER } from "@/lib/designSystem";
import { getDonorLocationFromIP } from "@/lib/geoLocation";
import {
  getBadgeStyle,
  getCardGradient,
  deduplicateBadges,
  DEFAULT_BADGE,
} from "@/lib/badgeStyles";

interface Beneficiary {
  id: string;
  alias_first_name: string;
  approx_age: number;
  region: string;
  short_story: string;
  emotional_sentence: string;
  avatar_gender: string;
  avatar_age_range: string;
  avatar_hair_type: string;
  avatar_skin_tone: string;
  avatar_url?: string;
  urgency_level?: number;
  children_count?: number;
  beneficiary_category?: string;
  profile_type?: string;
  diet_tags?: string[];
  culture_tags?: string[];
  proximity_score?: number;
  proximity_label?: string;
  context_badge?: string;
  created_at?: string;
}

const BeneficiarySelection = () => {
  const { situationId } = useParams();
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      let donorLocation: Record<string, string> | null = null;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("postal_prefix, department_code, region_code, country_code")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profile && (profile.postal_prefix || profile.department_code || profile.region_code || profile.country_code)) {
          donorLocation = {
            postal_prefix: profile.postal_prefix || "",
            department_code: profile.department_code || "",
            region_code: profile.region_code || "",
            country_code: profile.country_code || "",
          };
        }
      }

      // Fallback: IP geolocation for anonymous or profile-less donors
      if (!donorLocation) {
        const ipLocation = await getDonorLocationFromIP();
        if (ipLocation) {
          donorLocation = { ...ipLocation };
        }
      }

      const rpcParams: any = { p_situation_id: situationId, p_limit: 4 };
      if (donorLocation) rpcParams.p_donor_location = donorLocation;

      const { data, error } = await supabase.rpc("get_empathy_beneficiaries" as any, rpcParams);

      if (error || !data) {
        const { data: fallbackData } = await supabase
          .from("beneficiaries_public")
          .select("*")
          .eq("situation_id", situationId)
          .limit(4);
        setBeneficiaries((fallbackData as unknown as Beneficiary[]) || []);
        setLoading(false);
        return;
      }

      const rpcBeneficiaries = data as unknown as Beneficiary[];

      if (rpcBeneficiaries.length > 0) {
        const ids = rpcBeneficiaries.map((b) => b.id);
        const { data: extraData } = await supabase
          .from("beneficiaries_public")
          .select("id, context_badge, children_count, short_story, emotional_sentence")
          .in("id", ids);
        const { data: createdData } = await supabase
          .from("beneficiaries")
          .select("id, created_at")
          .in("id", ids);

        if (extraData) {
          const extraMap = new Map(extraData.map((e: any) => [e.id, e]));
          const createdMap = new Map((createdData || []).map((e: any) => [e.id, e.created_at]));
          for (const b of rpcBeneficiaries) {
            const extra = extraMap.get(b.id);
            b.context_badge = extra?.context_badge || undefined;
            b.children_count = extra?.children_count ?? undefined;
            if (!b.short_story) b.short_story = extra?.short_story || "";
            if (!b.emotional_sentence) b.emotional_sentence = extra?.emotional_sentence || "";
            b.created_at = createdMap.get(b.id) || undefined;
          }
        }
      }

      setBeneficiaries(rpcBeneficiaries);
      setLoading(false);
    };

    fetchBeneficiaries();
  }, [situationId, user]);

  // Load followed beneficiaries
  useEffect(() => {
    if (!user || beneficiaries.length === 0) return;
    const ids = beneficiaries.map((b) => b.id);
    supabase
      .from("followed_beneficiaries" as any)
      .select("beneficiary_id")
      .eq("user_id", user.id)
      .in("beneficiary_id", ids)
      .then(({ data }) => {
        if (data) setFollowedIds(new Set(data.map((d: any) => d.beneficiary_id)));
      });
  }, [user, beneficiaries]);

  const handleClickAider = (beneficiaryId: string) => {
    supabase.functions.invoke("track-profile-view", {
      body: { beneficiary_id: beneficiaryId, event_type: "click" },
    });
  };

  const badges = deduplicateBadges(beneficiaries);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <BackButton />

        <div className={SECTION_HEADER.wrapper}>
          <h1 className={SECTION_HEADER.title}>Découvrez qui vous pouvez aider</h1>
          <p className={SECTION_HEADER.subtitle}>Chaque personne a une histoire unique. Choisissez quelqu'un à soutenir.</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${CARD_STYLES.page} animate-pulse h-64`} />
            ))}
          </div>
        ) : beneficiaries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Aucun bénéficiaire disponible pour cette situation pour le moment.</p>
            <Link to="/causes" className="text-primary underline mt-2 inline-block">Découvrir d'autres causes</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {beneficiaries.map((b, i) => {
              const badge = badges[i];
              const badgeStyle = getBadgeStyle(badge);
              const isProximity = ["Proche de chez vous", "Dans votre département", "Dans votre région", "Dans votre pays"].includes(badge);
              const BadgeIcon = isProximity ? Navigation : Sparkles;
              const followed = followedIds.has(b.id);

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`group rounded-2xl p-8 shadow-card border text-center relative cursor-pointer
                    ${CARD_STYLES.hover}`}
                  style={getCardGradient()}
                >
                  {/* Heart — top left */}
                  {followed && (
                    <div className="absolute top-3 left-4">
                      <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                    </div>
                  )}

                  {/* Badge — top right */}
                  <motion.div
                    className="absolute top-3 right-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.3 }}
                  >
                    <Badge
                      variant="outline"
                      className={`py-1.5 px-3 rounded-2xl text-xs font-semibold group-hover:brightness-110 transition-all ${badgeStyle}`}
                    >
                      <BadgeIcon className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  </motion.div>

                  <div className="flex justify-center mb-4 mt-4">
                    <BeneficiaryAvatar
                      name={b.alias_first_name}
                      gender={b.avatar_gender}
                      ageRange={b.avatar_age_range}
                      hairType={b.avatar_hair_type}
                      skinTone={b.avatar_skin_tone}
                      avatarUrl={b.avatar_url}
                      size="lg"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">{b.alias_first_name}</h3>
                  <p className="text-sm text-muted-foreground/80 mt-0.5">{getAgeRange(b.approx_age)}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5 mb-3">
                    <MapPin className="h-3 w-3" /> Région {b.region}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{b.short_story}</p>
                  <div className="flex items-start gap-2 text-sm italic text-primary/80 justify-center mb-6">
                    <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    « {b.emotional_sentence} »
                  </div>
                  <Link to={`/donate/${b.id}`} state={{ displayBadge: badge }} onClick={() => handleClickAider(b.id)}>
                    <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground">
                      Aider {b.alias_first_name}
                    </Button>
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

export default BeneficiarySelection;
