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

/**
 * Hero « rencontre » : texte à gauche sur la photo solidarité en dégradé,
 * un seul visage à droite (sans carte ni fond importé) en rotation lente
 * sur 3 situations issues de 3 causes différentes.
 */
const HeroBeneficiaries = () => {
  const [rows, setRows] = useState<HeroBeneficiary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
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
    if (list.length === 0) {
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
      if (paused.current) return;
      setIndex((i) => {
        const next = i + 1;
        if (rows && next >= rows.length) {
          draw();
          return 0;
        }
        return next;
      });
    }, ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [draw, rows]);

  const current = rows && rows.length > 0 ? rows[index % rows.length] : null;

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0">
        <img
          src="/hero-solidarity.jpg"
          alt="Des bénévoles préparent des colis solidaires"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/60" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Colonne gauche — le message */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              Don transparent &amp; centré sur l'humain
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-5">
              Choisissez la personne que vous voulez aider.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Découvrez qui a besoin d'aide et financez un colis personnalisé. Ressentez la
              connexion. Voyez l'impact.
            </p>
            <p className="text-lg md:text-xl font-semibold text-foreground mb-4">
              D'autres personnes attendent votre aide.
            </p>
            <Link to="/causes">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-warm-lg"
              >
                Choisir une cause <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Colonne droite — un seul visage, sans carte */}
          {!failed && (
            <div
              className="flex flex-col items-center text-center"
              onMouseEnter={() => (paused.current = true)}
              onMouseLeave={() => (paused.current = false)}
            >
              {!current ? (
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="rounded-full h-[220px] w-[220px] md:h-[280px] md:w-[280px]" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-12 w-48" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 -m-8 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 45%, hsl(var(--primary) / 0.14) 0%, transparent 70%)",
                        }}
                      />
                      {current.avatar_url || current.avatar_preview_url ? (
                        <div className="relative">
                          <div className="md:hidden">
                            <BeneficiaryAvatar
                              size="xl"
                              transparent
                              name={current.alias_first_name ?? ""}
                              avatarUrl={current.avatar_url}
                              previewUrl={current.avatar_preview_url}
                            />
                          </div>
                          <div className="hidden md:block">
                            <BeneficiaryAvatar
                              size="hero"
                              transparent
                              name={current.alias_first_name ?? ""}
                              avatarUrl={current.avatar_url}
                              previewUrl={current.avatar_preview_url}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-[220px] w-[220px] md:h-[280px] md:w-[280px] rounded-full bg-primary/10 flex items-center justify-center">
                          <UserRound className="h-12 w-12 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-2xl font-bold text-foreground leading-none">
                      {current.alias_first_name}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-2">
                      {current.region && (
                        <>
                          <MapPin className="h-3.5 w-3.5" />
                          {current.region}
                        </>
                      )}
                      {current.region && current.situation_title && <span>·</span>}
                      {current.situation_title}
                    </div>

                    <Link to={`/donate/${current.id}`} className="mt-5">
                      <Button
                        size="lg"
                        className="bg-cta hover:bg-cta/90 text-cta-foreground px-8"
                      >
                        Aider {current.alias_first_name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              )}

              {rows && rows.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {rows.map((b, i) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label="Voir une autre personne"
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index % rows.length === i ? "bg-primary" : "bg-primary/25"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBeneficiaries;
