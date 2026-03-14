import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Quote, Navigation, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getAgeRange } from "@/lib/ageRange";

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

const BADGE_STYLES: Record<string, string> = {
  "Proche de chez vous": "border-primary/40 text-primary bg-primary/10",
  "Dans votre département": "border-primary/40 text-primary bg-primary/10",
  "Dans votre région": "border-primary/40 text-primary bg-primary/10",
  "Dans votre pays": "border-primary/40 text-primary bg-primary/10",
  "Nouveau bénéficiaire inscrit": "border-blue-400/40 text-blue-600 bg-blue-50",
  "Logement provisoire": "border-amber-400/40 text-amber-700 bg-amber-50",
  "Démarches juridiques en cours": "border-indigo-400/40 text-indigo-600 bg-indigo-50",
  "Démarches administratives en cours": "border-indigo-400/40 text-indigo-600 bg-indigo-50",
  "Très loin de sa famille": "border-violet-400/40 text-violet-600 bg-violet-50",
  "Désert médical": "border-rose-400/40 text-rose-600 bg-rose-50",
  "Zone rurale isolée": "border-emerald-400/40 text-emerald-600 bg-emerald-50",
  "Impact de l'inflation": "border-slate-400/40 text-slate-600 bg-slate-50",
  "Apprend un nouveau métier": "border-teal-400/40 text-teal-600 bg-teal-50",
  "1ère année universitaire": "border-cyan-400/40 text-cyan-600 bg-cyan-50",
  "Nourrisson arrivé récemment": "border-pink-400/40 text-pink-600 bg-pink-50",
  "1ère grossesse": "border-pink-400/40 text-pink-600 bg-pink-50",
  "Difficile de vivre seul": "border-orange-400/40 text-orange-600 bg-orange-50",
  "Difficile de vivre seule": "border-orange-400/40 text-orange-600 bg-orange-50",
  "Difficile de vivre seul(e)": "border-orange-400/40 text-orange-600 bg-orange-50",
  "Début de vie active": "border-lime-400/40 text-lime-700 bg-lime-50",
  "Aidant familial": "border-purple-400/40 text-purple-600 bg-purple-50",
  "Parcours de transition": "border-sky-400/40 text-sky-600 bg-sky-50",
  "Manque de repères dans la ville": "border-stone-400/40 text-stone-600 bg-stone-50",
  "Manque de commerces de proximité": "border-stone-400/40 text-stone-600 bg-stone-50",
};

// Card background tint per badge (very light)
const BADGE_CARD_BG: Record<string, string> = {
  "Proche de chez vous": "bg-primary/[0.03]",
  "Dans votre département": "bg-primary/[0.03]",
  "Dans votre région": "bg-primary/[0.03]",
  "Dans votre pays": "bg-primary/[0.03]",
  "Nouveau bénéficiaire inscrit": "bg-blue-50/40",
  "Logement provisoire": "bg-amber-50/40",
  "Démarches juridiques en cours": "bg-indigo-50/40",
  "Démarches administratives en cours": "bg-indigo-50/40",
  "Très loin de sa famille": "bg-violet-50/40",
  "Désert médical": "bg-rose-50/40",
  "Zone rurale isolée": "bg-emerald-50/40",
  "Impact de l'inflation": "bg-slate-50/40",
  "Apprend un nouveau métier": "bg-teal-50/40",
  "1ère année universitaire": "bg-cyan-50/40",
  "Nourrisson arrivé récemment": "bg-pink-50/40",
  "1ère grossesse": "bg-pink-50/40",
  "Difficile de vivre seul": "bg-orange-50/40",
  "Difficile de vivre seule": "bg-orange-50/40",
  "Difficile de vivre seul(e)": "bg-orange-50/40",
  "Début de vie active": "bg-lime-50/40",
  "Aidant familial": "bg-purple-50/40",
  "Parcours de transition": "bg-sky-50/40",
  "Manque de repères dans la ville": "bg-stone-50/40",
  "Manque de commerces de proximité": "bg-stone-50/40",
};

const DEFAULT_BADGE = "Impact de l'inflation";

function genderizeBadge(badge: string, gender: string): string {
  if (badge === "Difficile de vivre seul(e)") {
    return gender === "woman" ? "Difficile de vivre seule" : "Difficile de vivre seul";
  }
  return badge;
}

function getBadgeStyle(badge: string): string {
  return BADGE_STYLES[badge] || BADGE_STYLES[DEFAULT_BADGE];
}

function isNewBeneficiary(createdAt?: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}

function getDisplayBadge(b: Beneficiary): string {
  if (b.proximity_label) return b.proximity_label;
  if (isNewBeneficiary(b.created_at)) return "Nouveau bénéficiaire inscrit";
  if (b.context_badge) return genderizeBadge(b.context_badge, b.avatar_gender);
  return DEFAULT_BADGE;
}

function deduplicateBadges(beneficiaries: Beneficiary[]): string[] {
  const usedBadges = new Set<string>();
  const result: string[] = [];
  for (const b of beneficiaries) {
    let badge = getDisplayBadge(b);
    if (usedBadges.has(badge)) {
      const contextBadge = b.context_badge ? genderizeBadge(b.context_badge, b.avatar_gender) : null;
      if (contextBadge && !usedBadges.has(contextBadge) && contextBadge !== badge) {
        badge = contextBadge;
      } else if (!usedBadges.has(DEFAULT_BADGE)) {
        badge = DEFAULT_BADGE;
      }
    }
    usedBadges.add(badge);
    result.push(badge);
  }
  return result;
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
          .select("id, context_badge")
          .in("id", ids);
        const { data: createdData } = await supabase
          .from("beneficiaries")
          .select("id, created_at")
          .in("id", ids);

        if (extraData) {
          const extraMap = new Map(extraData.map((e: any) => [e.id, e.context_badge]));
          const createdMap = new Map((createdData || []).map((e: any) => [e.id, e.created_at]));
          for (const b of rpcBeneficiaries) {
            b.context_badge = extraMap.get(b.id) || undefined;
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
        <button onClick={() => window.history.back()} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Découvrez qui vous pouvez aider</h1>
          <p className="text-lg text-muted-foreground">Chaque personne a une histoire unique. Choisissez quelqu'un à soutenir.</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 animate-pulse h-64" />
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
              const cardBg = BADGE_CARD_BG[badge] || "bg-card";
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
                    hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${cardBg}`}
                >
                  {/* Badge — top left, animated */}
                  <motion.div
                    className="absolute top-4 left-4"
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

                  {/* Heart — top right */}
                  {followed && (
                    <div className="absolute top-4 right-4">
                      <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                    </div>
                  )}

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

                  {/* Visual hierarchy: name > age > region */}
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
                  <Link to={`/donate/${b.id}`} onClick={() => handleClickAider(b.id)}>
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
