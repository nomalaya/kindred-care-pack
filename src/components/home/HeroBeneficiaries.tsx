import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";

export interface HeroBeneficiary {
  id: string;
  situation_id: string;
  situation_title: string | null;
  cause_id: string;
  cause_title: string | null;
  alias_first_name: string | null;
  region: string | null;
  avatar_preview_url: string | null;
  avatar_url: string | null;
}

const ROTATION_MS = 7000;
const PORTRAIT_PX = 176;

/**
 * Hero « rencontre » : trois visages, prénom · région · situation, CTA nominatif.
 * Chaque tirage garantit 3 situations issues de 3 causes différentes (RPC).
 */
const HeroBeneficiaries = () => {
  const [rows, setRows] = useState<HeroBeneficiary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);
  const paused = useRef(false);

  const draw = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_homepage_hero_beneficiaries", {
      p_count: 3,
    });
    if (error) {
      setFailed(true);
      return;
    }
    const list = (data as HeroBeneficiary[]) ?? [];
    if (list.length < 3) {
      setFailed(true);
      return;
    }
    setRows(list);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!paused.current) {
        setTick((t) => t + 1);
        draw();
      }
    }, ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [draw]);

  const advance = () => {
    setTick((t) => t + 1);
    draw();
  };

  return (
    <section className="bg-background pt-12 pb-14 md:pt-16 md:pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />
            Don transparent &amp; centré sur l'humain
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            Choisissez la personne que vous voulez aider.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl">
            Découvrez qui a besoin d'aide et financez un colis personnalisé. Ressentez la
            connexion. Voyez l'impact.
          </p>
        </motion.div>

        {failed ? null : (
          <div
            onMouseEnter={() => (paused.current = true)}
            onMouseLeave={() => (paused.current = false)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8 max-w-4xl mx-auto">
              {!rows
                ? [0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border-[0.5px] border-border bg-card p-5 flex flex-col items-center gap-3"
                    >
                      <Skeleton
                        className="rounded-full"
                        style={{ width: PORTRAIT_PX, height: PORTRAIT_PX }}
                      />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-10 w-full mt-1" />
                    </div>
                  ))
                : rows.map((b, i) => (
                    <AnimatePresence mode="wait" key={i}>
                      <motion.div
                        key={`${tick}-${b.id}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, delay: i * 0.08 }}
                        className="rounded-2xl border-[0.5px] border-border bg-card p-5 flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <div className="mb-4">
                          {b.avatar_url || b.avatar_preview_url ? (
                            <BeneficiaryAvatar
                              size="lg"
                              name={b.alias_first_name ?? ""}
                              avatarUrl={b.avatar_url}
                              previewUrl={b.avatar_preview_url}
                              backgroundSeed={b.id}
                            />
                          ) : (
                            <div className="h-[120px] w-[120px] rounded-full bg-primary/10 flex items-center justify-center">
                              <UserRound className="h-10 w-10 text-primary" />
                            </div>
                          )}
                        </div>

                        <div className="text-lg font-bold text-foreground leading-none">
                          {b.alias_first_name}
                        </div>
                        {b.region && (
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {b.region}
                          </div>
                        )}
                        {b.situation_title && (
                          <span className="mt-2.5 inline-block rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-1">
                            {b.situation_title}
                          </span>
                        )}

                        <Link to={`/donate/${b.id}`} className="w-full mt-4">
                          <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground">
                            Aider {b.alias_first_name}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </motion.div>
                    </AnimatePresence>
                  ))}
            </div>

            {rows && (
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={advance}
                    aria-label="Voir d'autres personnes"
                    className={`h-2 w-2 rounded-full transition-colors ${
                      tick % 3 === i ? "bg-primary" : "bg-primary/25"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-3">
            D'autres personnes attendent d'être aidées
          </p>
          <Link to="/causes">
            <Button variant="outline" size="lg">
              Choisir une cause <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Livraison 48h · Preuve de réception · Déduction fiscale 75%
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroBeneficiaries;
