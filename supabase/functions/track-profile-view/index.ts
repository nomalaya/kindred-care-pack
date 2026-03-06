import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { beneficiary_id, event_type } = await req.json();
    if (!beneficiary_id) throw new Error("beneficiary_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event_type === "click") {
      // Increment donation_clicks
      const { data: b } = await supabase
        .from("beneficiaries")
        .select("donation_clicks, profile_views, donation_conversion_rate")
        .eq("id", beneficiary_id)
        .single();

      if (b) {
        const clicks = (b.donation_clicks || 0) + 1;
        const views = b.profile_views || 1;
        const convRate = views > 0 ? clicks / views : 0;
        const emotionalScore = (views * 0.2) + (clicks * 0.4) + (convRate * 0.4);

        await supabase
          .from("beneficiaries")
          .update({
            donation_clicks: clicks,
            donation_conversion_rate: convRate,
            emotional_score: emotionalScore,
          })
          .eq("id", beneficiary_id);
      }
    } else {
      // Default: profile view
      const { data: b } = await supabase
        .from("beneficiaries")
        .select("profile_views, donation_clicks, donation_conversion_rate")
        .eq("id", beneficiary_id)
        .single();

      if (b) {
        const views = (b.profile_views || 0) + 1;
        const clicks = b.donation_clicks || 0;
        const convRate = views > 0 ? clicks / views : 0;
        const emotionalScore = (views * 0.2) + (clicks * 0.4) + (convRate * 0.4);

        await supabase
          .from("beneficiaries")
          .update({
            profile_views: views,
            donation_conversion_rate: convRate,
            emotional_score: emotionalScore,
          })
          .eq("id", beneficiary_id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
