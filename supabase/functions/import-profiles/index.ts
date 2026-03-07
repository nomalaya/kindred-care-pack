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

    const { offset = 0, limit = 100 } = await req.json().catch(() => ({ offset: 0, limit: 100 }));

    // Read CSV from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("avatars")
      .download("import/profiles.csv");

    if (downloadError || !fileData) throw new Error(`Download error: ${downloadError?.message}`);
    
    const csvText = await fileData.text();
    const lines = csvText.trim().split("\n");
    const header = lines[0].split(";");
    
    const allRows = lines.slice(1).map(line => {
      const cols = line.split(";");
      const obj: Record<string, string> = {};
      header.forEach((h, i) => { obj[h.trim()] = cols[i]?.trim() || ""; });
      return obj;
    });

    const rows = allRows.slice(offset, offset + limit);
    console.log(`Processing rows ${offset}-${offset + rows.length} of ${allRows.length}`);
    const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const { error: userError } = await supabase.auth.admin.createUser({
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
        await new Promise(r => setTimeout(r, 30));

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

      // Log progress every 100
      if ((i + 1) % 100 === 0) {
        console.log(`Progress: ${i + 1}/${rows.length} | Created: ${results.created} | Updated: ${results.updated} | Errors: ${results.errors.length}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total_rows: allRows.length,
      processed_offset: offset,
      processed_count: rows.length,
      next_offset: offset + rows.length < allRows.length ? offset + rows.length : null,
      ...results,
      error_count: results.errors.length,
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
