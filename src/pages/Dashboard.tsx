import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DELIVERY_STATUSES } from "@/lib/constants";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import { Navigate, Link } from "react-router-dom";
import { Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DonationRow {
  id: string;
  amount: number;
  delivery_status: string;
  created_at: string;
  products_sent: any;
  beneficiary: {
    alias_first_name: string;
    approx_age: number;
    region: string;
    avatar_gender: string;
    avatar_age_range: string;
    avatar_hair_type: string;
    avatar_skin_tone: string;
    avatar_url?: string;
  };
}

interface FollowedBeneficiary {
  id: string;
  alias_first_name: string;
  region: string;
  avatar_gender: string;
  avatar_age_range: string;
  avatar_hair_type: string;
  avatar_skin_tone: string;
  avatar_url?: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [followed, setFollowed] = useState<FollowedBeneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [donRes, followRes] = await Promise.all([
        supabase
          .from("donations")
          .select("id, amount, delivery_status, created_at, products_sent, beneficiaries_public!beneficiary_id(alias_first_name, approx_age, region, avatar_gender, avatar_age_range, avatar_hair_type, avatar_skin_tone, avatar_url)")
          .eq("donor_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("followed_beneficiaries" as any)
          .select("beneficiary_id")
          .eq("user_id", user.id),
      ]);

      if (donRes.data) {
        setDonations(donRes.data.map((d: any) => ({ ...d, beneficiary: d.beneficiaries_public })));
      }

      // Load followed beneficiary details
      if (followRes.data && (followRes.data as any[]).length > 0) {
        const ids = (followRes.data as any[]).map((f: any) => f.beneficiary_id);
        const { data: bData } = await supabase
          .from("beneficiaries_public")
          .select("id, alias_first_name, region, avatar_gender, avatar_age_range, avatar_hair_type, avatar_skin_tone, avatar_url")
          .in("id", ids);
        if (bData) setFollowed(bData as unknown as FollowedBeneficiary[]);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const getStatusIndex = (status: string) => DELIVERY_STATUSES.findIndex(s => s.key === status);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mes dons</h1>
        <p className="text-muted-foreground mb-8">Suivez toutes vos contributions et leur impact.</p>

        {/* Followed beneficiaries */}
        {followed.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" /> Personnes suivies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {followed.map((b) => (
                <Link key={b.id} to={`/donate/${b.id}`} className="bg-card rounded-2xl p-4 border shadow-card text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-2">
                    <BeneficiaryAvatar
                      name={b.alias_first_name}
                      gender={b.avatar_gender}
                      ageRange={b.avatar_age_range}
                      hairType={b.avatar_hair_type}
                      skinTone={b.avatar_skin_tone}
                      avatarUrl={b.avatar_url}
                      size="sm"
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground">{b.alias_first_name}</p>
                  <p className="text-xs text-muted-foreground">{b.region}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun don pour le moment</h2>
            <p className="text-muted-foreground mb-4">Commencez à aider quelqu'un dès aujourd'hui !</p>
            <a href="/causes">
              <Button className="bg-cta hover:bg-cta/90 text-cta-foreground">Découvrir les causes</Button>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((d) => {
              const statusIdx = getStatusIndex(d.delivery_status);
              const b = d.beneficiary;
              return (
                <div key={d.id} className="bg-card rounded-2xl p-6 border shadow-card">
                  <div className="flex items-start gap-4">
                    {b && (
                      <BeneficiaryAvatar
                        name={b.alias_first_name}
                        gender={b.avatar_gender}
                        ageRange={b.avatar_age_range}
                        hairType={b.avatar_hair_type}
                        skinTone={b.avatar_skin_tone}
                        avatarUrl={b.avatar_url}
                        size="sm"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground">
                          {b?.alias_first_name || "Inconnu"} – {b?.region}
                        </h3>
                        <span className="text-lg font-bold text-primary">{d.amount}€</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {new Date(d.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <div className="flex items-center gap-1">
                        {DELIVERY_STATUSES.map((s, i) => (
                          <div key={s.key} className="flex items-center gap-1 flex-1">
                            <div className={`h-1.5 rounded-full flex-1 ${i <= statusIdx ? "bg-primary" : "bg-muted"}`} />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {DELIVERY_STATUSES.map((s, i) => (
                          <span key={s.key} className={`text-[10px] ${i <= statusIdx ? "text-primary font-medium" : "text-muted-foreground"}`}>
                            {s.icon}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
