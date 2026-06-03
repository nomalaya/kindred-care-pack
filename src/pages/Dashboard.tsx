import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import { readFramingFromRow } from "@/lib/avatarFraming";
import { Navigate, Link } from "react-router-dom";
import { Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DonationCard from "@/components/dashboard/DonationCard";
import TaxCertificates from "@/components/dashboard/TaxCertificates";

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
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [donRes, followRes, profileRes] = await Promise.all([
        supabase
          .from("donations")
          .select("id, amount, delivery_status, created_at, products_sent, beneficiaries_public!beneficiary_id(alias_first_name, approx_age, region, avatar_gender, avatar_age_range, avatar_hair_type, avatar_skin_tone, avatar_url, avatar_scale, avatar_offset_x, avatar_offset_y)")
          .eq("donor_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("followed_beneficiaries")
          .select("beneficiary_id")
          .eq("user_id", user.id),
        supabase
          .from("profiles")
          .select("display_name, email")
          .eq("user_id", user.id)
          .single(),
      ]);

      if (donRes.data) {
        setDonations(donRes.data.map((d: any) => ({ ...d, beneficiary: d.beneficiaries_public })));
      }

      if (profileRes.data) {
        setDonorName(profileRes.data.display_name || "");
        setDonorEmail(profileRes.data.email || user.email || "");
      } else {
        setDonorEmail(user.email || "");
      }

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2"><h1 className="text-3xl font-bold text-foreground mb-2">Mon espace donateur</h1></h1>
        <p className="text-muted-foreground mb-8">Suivez vos contributions et téléchargez vos attestations fiscales.</p>

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
                      backgroundSeed={b.id}
                      framing={readFramingFromRow(b as any)}
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

        <Tabs defaultValue="contributions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="contributions">Mes contributions</TabsTrigger>
            <TabsTrigger value="attestations">Attestations fiscales</TabsTrigger>
          </TabsList>

          <TabsContent value="contributions">
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
                {donations.map((d) => (
                  <DonationCard
                    key={d.id}
                    id={d.id}
                    amount={d.amount}
                    delivery_status={d.delivery_status}
                    created_at={d.created_at}
                    beneficiary={d.beneficiary}
                    donorName={donorName}
                    donorEmail={donorEmail}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attestations">
            <TaxCertificates
              donations={donations.map((d) => ({
                id: d.id,
                amount: d.amount,
                created_at: d.created_at,
                beneficiary: {
                  alias_first_name: d.beneficiary?.alias_first_name || "Inconnu",
                  region: d.beneficiary?.region || "",
                },
              }))}
              donorName={donorName}
              donorEmail={donorEmail}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
