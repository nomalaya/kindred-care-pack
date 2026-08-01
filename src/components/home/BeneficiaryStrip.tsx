import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";

interface StripRow {
  id: string;
  alias_first_name: string | null;
  avatar_preview_url: string | null;
  avatar_url: string | null;
}

/**
 * Bandeau « trombinoscope » : preuve de masse. Défilement horizontal lent,
 * boucle sans couture, désactivé si l'utilisateur réduit les animations.
 */
const BeneficiaryStrip = () => {
  const [rows, setRows] = useState<StripRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_homepage_beneficiaries", { p_count: 12 });
      if (cancelled || error) return;
      setRows((data as StripRow[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (rows.length === 0) return null;

  const loop = [...rows, ...rows];

  return (
    <section className="py-8 bg-muted/40 border-y-[0.5px] border-border">
      <Link to="/causes" className="block group">
        <div className="overflow-hidden">
          <div className="flex gap-4 w-max animate-[marquee_45s_linear_infinite] motion-reduce:animate-none">
            {loop.map((b, i) => (
              <div key={`${b.id}-${i}`} className="shrink-0">
                <BeneficiaryAvatar
                  size="sm"
                  name={b.alias_first_name ?? ""}
                  avatarUrl={b.avatar_url}
                  previewUrl={b.avatar_preview_url}
                  backgroundSeed={b.id}
                />
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-5 group-hover:text-foreground transition-colors">
          200 personnes attendent un colis en France
        </p>
      </Link>
    </section>
  );
};

export default BeneficiaryStrip;
