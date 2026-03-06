import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { beneficiary_id } = await req.json();
    if (!beneficiary_id) throw new Error("beneficiary_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Get beneficiary attributes
    const { data: b, error } = await supabase
      .from("beneficiaries")
      .select("avatar_gender, avatar_age_range, avatar_skin_tone, avatar_hair_type, alias_first_name")
      .eq("id", beneficiary_id)
      .single();

    if (error || !b) throw new Error("Beneficiary not found");

    const gender = b.avatar_gender || "person";
    const age = b.avatar_age_range || "30-40";
    const skin = b.avatar_skin_tone || "medium";
    const hair = b.avatar_hair_type || "short";

    const prompt = `Portrait photograph of a ${gender}, approximately ${age} years old, ${skin} skin tone, ${hair} hair, warm genuine smile, neutral soft background, soft natural lighting, modern NGO campaign style, dignified and hopeful expression, high quality portrait photography, no text, on a solid white background`;

    // Generate image via Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      throw new Error(`AI gateway error: ${aiResponse.status} ${t}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("No image generated");

    // Extract base64 data
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload to storage
    const fileName = `${beneficiary_id}.png`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

    // Get public URL
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    // Update beneficiary
    await supabase
      .from("beneficiaries")
      .update({ avatar_url: publicUrl })
      .eq("id", beneficiary_id);

    return new Response(JSON.stringify({ success: true, avatar_url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-avatar error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
