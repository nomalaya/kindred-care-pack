import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { rows } = await req.json();
    if (!rows || !Array.isArray(rows)) throw new Error("rows array required");

    console.log(`Processing ${rows.length} rows`);
    const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

    for (const row of rows) {
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          id: row.user_id,
          email: row.email,
          password: "Cash4Cause2024!",
          email_confirm: true,
          user_metadata: { display_name: row.display_name },
        });

        if (userError) {
          if (userError.message?.includes("already been registered")) {
            results.skipped++;
          } else {
            results.errors.push(`${row.email}: ${userError.message}`);
            continue;
          }
        } else {
          results.created++;
        }

        // Wait for trigger
        await new Promise(r => setTimeout(r, 50));

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            display_name: row.display_name,
            country_code: row.country_code || null,
            region_code: row.region_code || null,
            department_code: row.department_code || null,
            postal_prefix: row.postal_prefix || null,
            location_visibility: row.location_visibility === "True",
          })
          .eq("user_id", row.user_id);

        if (updateError) {
          results.errors.push(`Update ${row.email}: ${updateError.message}`);
        } else {
          results.updated++;
        }
      } catch (e) {
        results.errors.push(`${row.email}: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      ...results,
      first_errors: results.errors.slice(0, 10),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("import-profiles error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
