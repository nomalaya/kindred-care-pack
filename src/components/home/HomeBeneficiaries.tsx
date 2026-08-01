import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";

interface HomeBeneficiary {
  id: string;
  situation_id: string;
  alias_first_name: string | null;
  region: string | null;
  emotional_sentence: string | null;
  short_story: string | null;
  avatar_preview_url: string | null;
  avatar_url: string | null;
}

/**
 * Section « Rencontrez ceux que vous pouvez aider ».
 * Tirage aléatoire de 3 profils à chaque chargement — jamais mis en cache.
 */
const HomeBeneficiaries = () => {
  const [rows, setRows] = useState<HomeBeneficiary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_homepage_beneficiaries", { p_count: 3 });
      if (cancelled) return;
      if (error) {
        setFailed(true);
        return;
      }
      setRows((data as HomeBeneficiary[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Masquage silencieux : erreur ou aucun résultat.
  if (failed || (rows && rows.length === 0)) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-3">
          Rencontrez ceux que vous pouvez aider
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
          Trois personnes différentes vous attendent. Revenez — vous en découvrirez d'autres.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {!rows
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border-[0.5px] border-border bg-muted/30 p-5 flex flex-col items-center gap-3"
                >
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              ))
            : rows.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border-[0.5px] border-border bg-muted/30 p-5 flex flex-col items-center text-center"
                >
                  <div className="mb-3">
                    {b.avatar_preview_url || b.avatar_url ? (
                      <BeneficiaryAvatar
                        size="md"
                        name={b.alias_first_name ?? ""}
                        avatarUrl={b.avatar_url}
                        previewUrl={b.avatar_preview_url}
                        backgroundSeed={b.id}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserRound className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="text-base font-bold text-foreground">{b.alias_first_name}</div>
                  {b.region && (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {b.region}
                    </div>
                  )}

                  {b.emotional_sentence && (
                    <p className="italic text-primary text-sm mt-3 line-clamp-2">
                      {b.emotional_sentence}
                    </p>
                  )}
                  {b.short_story && (
                    <p className="text-[13px] text-muted-foreground mt-2 line-clamp-3">
                      {b.short_story}
                    </p>
                  )}

                  <Link
                    to={`/situations/${b.situation_id}/beneficiaries`}
                    className="w-full mt-5"
                  >
                    <Button variant="outline" className="w-full">
                      Aider {b.alias_first_name}
                    </Button>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default HomeBeneficiaries;
