// Recrop an existing avatar version with the same deterministic framing used
// by the generation pipeline. Promotes the recropped image as the active
// avatar (avatar_url) and archives it as a new row in avatar_versions.
// No AI credits consumed — pure image post-processing.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cropAvatarBytes, CROP_ZOOM_DEFAULT, CROP_FACE_Y_DEFAULT } from "../_shared/avatarCrop.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { beneficiary_id, version_id, zoom, faceY } = await req.json();
    if (!beneficiary_id) throw new Error("beneficiary_id required");
    if (!version_id) throw new Error("version_id required");

    const cropZoom = typeof zoom === "number" ? zoom : CROP_ZOOM_DEFAULT;
    const cropFaceY = typeof faceY === "number" ? faceY : CROP_FACE_Y_DEFAULT;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: b, error: bErr } = await supabase
      .from("beneficiaries")
      .select("id, avatar_workflow_status")
      .eq("id", beneficiary_id)
      .single();
    if (bErr || !b) throw new Error("Beneficiary not found");

    const { data: v, error: vErr } = await supabase
      .from("avatar_versions")
      .select("id, image_url, model_used, qa_score, qa_report, seed, prompt")
      .eq("id", version_id)
      .single();
    if (vErr || !v) throw new Error("Version not found");

    // Strip cache-busting query string before fetch
    const sourceUrl = (v.image_url as string).split("?")[0];
    const resp = await fetch(sourceUrl);
    if (!resp.ok) throw new Error(`Source image fetch failed: ${resp.status}`);
    const srcBytes = new Uint8Array(await resp.arrayBuffer());

    const recropped = await cropAvatarBytes(srcBytes, { zoom: cropZoom, faceY: cropFaceY });

    const ts = Date.now();
    const activeFileName = `${beneficiary_id}.png`;
    const versionFileName = `versions/${beneficiary_id}/recropped-${ts}.png`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(activeFileName, recropped, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    await supabase.storage.from("avatars").upload(
      versionFileName, recropped, { contentType: "image/png", upsert: false },
    );

    const { data: u } = supabase.storage.from("avatars").getPublicUrl(activeFileName);
    const { data: vu } = supabase.storage.from("avatars").getPublicUrl(versionFileName);
    const newUrl = `${u.publicUrl}?t=${ts}`;

    // Preserve approved/locked workflow status; otherwise transition to "generated"
    const nextWorkflow =
      b.avatar_workflow_status === "approved" || b.avatar_workflow_status === "locked"
        ? b.avatar_workflow_status
        : "generated";

    await supabase
      .from("beneficiaries")
      .update({
        avatar_url: newUrl,
        avatar_status: "validated",
        avatar_workflow_status: nextWorkflow,
      })
      .eq("id", beneficiary_id);

    await supabase.from("avatar_versions").insert({
      beneficiary_id,
      image_url: vu.publicUrl,
      model_used: (v.model_used || "unknown") + " +recrop",
      qa_score: v.qa_score,
      qa_report: v.qa_report,
      seed: v.seed,
      prompt: `[recropped from ${version_id} zoom=${cropZoom.toFixed(2)} faceY=${cropFaceY.toFixed(2)}] ${v.prompt || ""}`.slice(0, 4000),
    });

    return new Response(JSON.stringify({ success: true, newUrl, zoom: cropZoom, faceY: cropFaceY }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("recrop-avatar-version error:", e);
    return new Response(JSON.stringify({ error: e.message ?? "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
