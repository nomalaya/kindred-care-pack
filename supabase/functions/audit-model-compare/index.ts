// audit-model-compare — JETABLE, conservée jusqu'à validation du rapport audit.
// POST body: { beneficiary_id, model_override, target_attribute: { key, before, after } }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AVATAR_FIELDS = [
  "avatar_gender","avatar_age_range","avatar_hair_type","avatar_skin_tone","avatar_url",
  "avatar_face_shape","avatar_eye_shape","avatar_eye_color","avatar_facial_features",
  "avatar_hair_color","avatar_hair_length","avatar_hair_volume","avatar_hair_style",
  "avatar_clothing_style","avatar_clothing_color_palette","avatar_expression","avatar_posture",
  "avatar_parent_energy","avatar_cultural_style","avatar_preview_url","avatar_status",
  "avatar_prompt","avatar_seed","avatar_generated_at","avatar_model_used","avatar_qa_report",
  "avatar_qa_score","avatar_tired_level","avatar_emotional_brightness","avatar_beard",
  "avatar_moustache","avatar_bald_level","avatar_hair_recession","avatar_head_covering",
  "avatar_cultural_style_override","avatar_resilience_level","avatar_fatigue_level",
  "avatar_dignity_level","avatar_workflow_status","avatar_mobility_aid","avatar_body_type",
  "avatar_private_notes","avatar_nose","avatar_forehead_mark","avatar_scale",
  "avatar_offset_x","avatar_offset_y","avatar_generated_traits","avatar_source_url",
];

async function sha256(bytes: Uint8Array): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(d)).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function hashUrl(url: string) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    return { hash: await sha256(buf), size: buf.byteLength };
  } catch { return null; }
}
function bucketPath(url: string): string | null {
  const m = url.match(/\/storage\/v1\/object\/public\/avatars\/(.+?)(?:\?|$)/);
  return m ? m[1] : null;
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const t0 = Date.now();
  try {
    const body = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    // Helper mode: cleanup orphan bucket files
    if (Array.isArray(body.cleanup_paths)) {
      const { data, error } = await supabase.storage.from("avatars").remove(body.cleanup_paths);
      return new Response(JSON.stringify({ ok: !error, data, error: error?.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { beneficiary_id, model_override, target_attribute, archive_label } = body;
    if (!beneficiary_id || !model_override || !target_attribute?.key) {
      throw new Error("beneficiary_id, model_override, target_attribute.key required");
    }
    const { key, before, after } = target_attribute;



    // 1. SNAPSHOT
    const { data: bRow, error: bErr } = await supabase
      .from("beneficiaries").select("*").eq("id", beneficiary_id).single();
    if (bErr || !bRow) throw new Error("beneficiary not found");
    const snapshot: Record<string, unknown> = {};
    for (const f of AVATAR_FIELDS) snapshot[f] = (bRow as any)[f];

    const callStartIso = new Date().toISOString();

    // 2. HASH SOURCE
    const sourceUrl = bRow.avatar_source_url ?? bRow.avatar_url;
    const sourceHash = sourceUrl ? await hashUrl(sourceUrl) : null;

    // 3. MUTATION
    const { error: mutErr } = await supabase
      .from("beneficiaries").update({ [key]: after }).eq("id", beneficiary_id);
    if (mutErr) throw new Error(`mutation: ${mutErr.message}`);

    // 4. APPEL PIPELINE
    const callStart = Date.now();
    const pipelineResp = await fetch(`${SUPABASE_URL}/functions/v1/generate-avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "apikey": SERVICE_KEY,
      },
      body: JSON.stringify({
        beneficiary_id,
        mode: "edit_hd",
        changedKeys: [key],
        requestedDiff: { [key]: { before, after } },
        model_override,
      }),
    });
    const pipelineAck = await pipelineResp.json().catch(() => ({}));

    // POLL: wait for ANY fresh version containing model_override, then wait for clean-bg or grace
    const POLL_TIMEOUT = 230_000;
    const deadline = Date.now() + POLL_TIMEOUT;
    let editVersion: any = null;
    let cleanVersion: any = null;
    let lastFresh: any[] = [];
    let sawEditAt = 0;

    while (Date.now() < deadline) {
      await sleep(3000);
      const { data: vs } = await supabase
        .from("avatar_versions")
        .select("id, image_url, model_used, qa_score, qa_report, prompt, seed, created_at")
        .eq("beneficiary_id", beneficiary_id)
        .gt("created_at", callStartIso)
        .order("created_at", { ascending: true });
      lastFresh = vs ?? [];
      // primary version = any non-clean-bg row whose model_used mentions our model_override
      editVersion = lastFresh.find(v =>
        !((v.model_used ?? "").startsWith("clean-bg/"))
        && (v.model_used ?? "").includes(model_override)
      ) ?? null;
      cleanVersion = lastFresh.find(v => (v.model_used ?? "").startsWith("clean-bg/")) ?? null;
      const { data: cur } = await supabase
        .from("beneficiaries").select("avatar_status, avatar_qa_score, avatar_qa_report, avatar_model_used")
        .eq("id", beneficiary_id).single();

      if (editVersion && !sawEditAt) sawEditAt = Date.now();
      if (editVersion && cleanVersion) break;
      if (editVersion && Date.now() - sawEditAt > 25000) break;
      if (cur?.avatar_status === "failed") break;
    }


    // Capture latest beneficiary state after pipeline
    const { data: finalRow } = await supabase
      .from("beneficiaries").select("avatar_status, avatar_url, avatar_preview_url, avatar_qa_score, avatar_qa_report, avatar_model_used, avatar_body_type, avatar_hair_type")
      .eq("id", beneficiary_id).single();

    // 5. CAPTURE RESULT (hash final & edit images, archive copy to audit-results/)
    const editImageHash = editVersion?.image_url ? await hashUrl(editVersion.image_url) : null;
    const cleanImageHash = cleanVersion?.image_url ? await hashUrl(cleanVersion.image_url) : null;

    let archivedUrl: string | null = null;
    if (editVersion?.image_url && archive_label) {
      try {
        const r = await fetch(editVersion.image_url);
        if (r.ok) {
          const bytes = new Uint8Array(await r.arrayBuffer());
          const archivePath = `audit-results/${archive_label}.png`;
          const { error: upE } = await supabase.storage.from("avatars").upload(
            archivePath, bytes, { contentType: "image/png", upsert: true },
          );
          if (!upE) {
            const { data: pu } = supabase.storage.from("avatars").getPublicUrl(archivePath);
            archivedUrl = pu.publicUrl;
          }
        }
      } catch (_) { /* archive best-effort */ }
    }


    // 6. CLEANUP — delete all fresh versions + their bucket files + canonical files
    const deletedVersions: string[] = [];
    const deletedFiles: string[] = [];
    const cleanupErrors: string[] = [];

    for (const v of lastFresh) {
      const p = bucketPath(v.image_url ?? "");
      if (p) {
        const { error: rmE } = await supabase.storage.from("avatars").remove([p]);
        if (rmE) cleanupErrors.push(`storage:${p}:${rmE.message}`);
        else deletedFiles.push(p);
      }
    }
    // Canonical files possibly rewritten by pipeline
    for (const cp of [`${beneficiary_id}.png`, `preview/${beneficiary_id}.png`]) {
      const { error: rmE } = await supabase.storage.from("avatars").remove([cp]);
      if (rmE && !rmE.message.toLowerCase().includes("not found")) {
        cleanupErrors.push(`storage:${cp}:${rmE.message}`);
      } else if (!rmE) {
        deletedFiles.push(cp);
      }
    }
    if (lastFresh.length > 0) {
      const ids = lastFresh.map(v => v.id);
      const { error: delE } = await supabase.from("avatar_versions").delete().in("id", ids);
      if (delE) cleanupErrors.push(`versions:${delE.message}`);
      else deletedVersions.push(...ids);
    }

    // 7. RESTAURATION
    const restorePatch: Record<string, unknown> = {};
    for (const f of AVATAR_FIELDS) restorePatch[f] = snapshot[f];
    const { error: resE } = await supabase
      .from("beneficiaries").update(restorePatch).eq("id", beneficiary_id);
    if (resE) throw new Error(`restore: ${resE.message}`);

    const { data: restored } = await supabase
      .from("beneficiaries").select("*").eq("id", beneficiary_id).single();
    const restoreDiff: Record<string, { expected: unknown; actual: unknown }> = {};
    for (const f of AVATAR_FIELDS) {
      const e = snapshot[f]; const a = (restored as any)?.[f];
      if (JSON.stringify(e) !== JSON.stringify(a)) restoreDiff[f] = { expected: e, actual: a };
    }

    return new Response(JSON.stringify({
      ok: true,
      duration_ms: Date.now() - t0,
      pipeline_call_ms: Date.now() - callStart,
      pipeline_ack: pipelineAck,
      source: { url: sourceUrl, hash: sourceHash },
      mutation: { key, before, after, current_before_mutation: (bRow as any)[key] },
      result: {
        edit_version: editVersion,
        edit_image_hash: editImageHash,
        archived_url: archivedUrl,
        clean_version: cleanVersion,

        clean_image_hash: cleanImageHash,
        all_fresh_versions: lastFresh,
        beneficiary_after_pipeline: finalRow,
      },
      cleanup: { deleted_versions: deletedVersions, deleted_files: deletedFiles, errors: cleanupErrors },
      restoration: { ok: Object.keys(restoreDiff).length === 0, diff: restoreDiff },
    }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
