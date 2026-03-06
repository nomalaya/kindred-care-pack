import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

const BeneficiarySelection = () => {
  const { situationId } = useParams();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("beneficiaries_public")
      .select("*")
      .eq("situation_id", situationId)
      .then(({ data }) => {
        setBeneficiaries((data as unknown as Beneficiary[]) || []);
        setLoading(false);
      });
  }, [situationId]);

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 animate-pulse h-64" />
            ))}
          </div>
        ) : beneficiaries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Aucun bénéficiaire disponible pour cette situation pour le moment.</p>
            <Link to="/causes" className="text-primary underline mt-2 inline-block">Découvrir d'autres causes</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {beneficiaries.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border text-center"
              >
                <div className="flex justify-center mb-4">
                  <BeneficiaryAvatar
                    name={b.alias_first_name}
                    gender={b.avatar_gender}
                    ageRange={b.avatar_age_range}
                    hairType={b.avatar_hair_type}
                    skinTone={b.avatar_skin_tone}
                    size="lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {b.alias_first_name} – {b.approx_age} ans
                </h3>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1 mb-3">
                  <MapPin className="h-3 w-3" /> Région {b.region}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{b.short_story}</p>
                <div className="flex items-start gap-2 text-sm italic text-primary/80 justify-center mb-6">
                  <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  « {b.emotional_sentence} »
                </div>
                <Link to={`/donate/${b.id}`}>
                  <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground">
                    Aider {b.alias_first_name}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BeneficiarySelection;
