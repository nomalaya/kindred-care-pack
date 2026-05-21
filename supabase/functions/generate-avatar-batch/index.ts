// Batch backfill for v2 avatars
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DELAY_MS = 2500; // pace per item

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { beneficiary_ids, mode = "final" } = await req.json();
    if (!Array.isArray(beneficiary_ids) || beneficiary_ids.length === 0) {
      throw new Error("beneficiary_ids must be a non-empty array");
    }
    if (beneficiary_ids.length > 100) {
      throw new Error("max 100 ids per batch");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const work = (async () => {
      for (const id of beneficiary_ids) {
        try {
          await supabase.functions.invoke("generate-avatar", {
            body: { beneficiary_id: id, mode, force: true },
          });
        } catch (e) {
          console.error(`batch item ${id} failed:`, e);
          await supabase.from("beneficiaries").update({
            avatar_status: "failed",
            avatar_qa_report: { batch_error: String(e) },
          }).eq("id", id);
        }
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    })();

    // @ts-ignore
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(work);
    else await work;

    return new Response(
      JSON.stringify({ accepted: true, count: beneficiary_ids.length, mode }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("batch error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
