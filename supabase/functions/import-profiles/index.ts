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

    // Read CSV bundled with the function
    const csvPath = new URL("./data.csv", import.meta.url);
    const csvText = await (await fetch(csvPath)).text();
    
    const lines = csvText.trim().split("\n");
    const header = lines[0].split(";");
    
    const rows = lines.slice(1).map(line => {
      const cols = line.split(";");
      const obj: Record<string, string> = {};
      header.forEach((h, i) => { obj[h.trim()] = cols[i]?.trim() || ""; });
      return obj;
    });

    console.log(`Parsed ${rows.length} rows from CSV`);

    const BATCH_SIZE = 25;
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      for (const row of batch) {
        try {
          // 1. Create auth user with specified UUID
          const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            id: row.user_id,
            email: row.email,
            password: "Cash4Cause2024!",
            email_confirm: true,
            user_metadata: { display_name: row.display_name },
          });

          if (userError) {
            // If user already exists, skip creation
            if (!userError.message?.includes("already been registered")) {
              results.errors.push(`User ${row.email}: ${userError.message}`);
              continue;
            }
          } else {
            results.created++;
          }

          // 2. Update the profile created by handle_new_user trigger
          // Small delay to let trigger execute
          await new Promise(r => setTimeout(r, 100));

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
            results.errors.push(`Profile update ${row.email}: ${updateError.message}`);
          } else {
            results.updated++;
          }
        } catch (e) {
          results.errors.push(`Row ${row.email}: ${e.message}`);
        }
      }

      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)} done. Created: ${results.created}, Updated: ${results.updated}`);
    }

    return new Response(JSON.stringify({
      success: true,
      total_rows: rows.length,
      ...results,
      first_errors: results.errors.slice(0, 20),
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
