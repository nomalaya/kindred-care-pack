// Applique le moteur de « remix » d'attributs (diversification phénotypique)
// côté serveur, sans aucun appel IA ni régénération d'image.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { remixAttributes } from "../_shared/remix/avatarRemix.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;
    const ids: string[] | null = Array.isArray(body.beneficiary_ids) ? body.beneficiary_ids : null;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    let query = supabase.from("beneficiaries").select("*").eq("is_active", true);
    if (ids) query = query.in("id", ids);
    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []).filter((b: any) => b.avatar_workflow_status !== "locked");
    let changed = 0;
    const details: any[] = [];

    for (const b of rows) {
      const { patch, group } = remixAttributes(b);
      const keys = Object.keys(patch);
      if (!keys.length) continue;
      changed++;
      details.push({ id: b.id, alias: b.alias_first_name, group, fields: keys });
      if (!dryRun) {
        const { error: upErr } = await supabase.from("beneficiaries").update(patch).eq("id", b.id);
        if (upErr) console.error("update failed", b.id, upErr.message);
      }
    }

    return new Response(
      JSON.stringify({ dry_run: dryRun, scanned: rows.length, changed, details }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("remix-attributes error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
