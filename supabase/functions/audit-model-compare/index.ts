// audit-model-compare — JETABLE, conservée jusqu'à validation du rapport audit.
// Exécute un test isolé : snapshot → mutation → appel generate-avatar (mode edit_hd, model_override)
// → capture résultat → cleanup version + fichier bucket → restauration snapshot complet.
//
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
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hashUrl(url: string): Promise<{ hash: string; size: number } | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    return { hash: await sha256(buf), size: buf.byteLength };
  } catch { return null; }
}

function bucketPathFromPublicUrl(url: string): string | null {
  const m = url.match(/\/storage\/v1\/object\/public\/avatars\/(.+?)(?:\?|$)/);
  return m ? m[1] : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();
  try {
    const { beneficiary_id, model_override, target_attribute } = await req.json();
    if (!beneficiary_id) throw new Error("beneficiary_id required");
    if (!model_override) throw new Error("model_override required");
    if (!target_attribute?.key || target_attribute.after === undefined) {
      throw new Error("target_attribute.{key, after} required");
    }
    const key: string = target_attribute.key;
    const before = target_attribute.before;
    const after = target_attribute.after;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // ---------- 1. SNAPSHOT ----------
    const { data: bRow, error: bErr } = await supabase
      .from("beneficiaries").select("*").eq("id", beneficiary_id).single();
    if (bErr || !bRow) throw new Error("beneficiary not found");

    const snapshot: Record<string, unknown> = {};
    for (const f of AVATAR_FIELDS) snapshot[f] = (bRow as any)[f];

    const { data: versionsT0 } = await supabase
      .from("avatar_versions").select("id, image_url, created_at")
      .eq("beneficiary_id", beneficiary_id);
    const t0Ids = new Set((versionsT0 ?? []).map(v => v.id));

    // ---------- 2. HASH SOURCE ----------
    const sourceUrl = bRow.avatar_source_url ?? bRow.avatar_url;
    const sourceHash = sourceUrl ? await hashUrl(sourceUrl) : null;

    // ---------- 3. MUTATION CIBLÉE ----------
    if ((bRow as any)[key] !== before) {
      // If current value already differs from declared "before", we still proceed but flag it.
    }
    const { error: mutErr } = await supabase
      .from("beneficiaries").update({ [key]: after }).eq("id", beneficiary_id);
    if (mutErr) throw new Error(`mutation failed: ${mutErr.message}`);

    // ---------- 4. APPEL PIPELINE ----------
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

    // ---------- POLL ----------
    const POLL_TIMEOUT_MS = 180_000;
    const POLL_INTERVAL_MS = 3000;
    let newVersion: any = null;
    let finalRow: any = null;
    const pollDeadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < pollDeadline) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      const { data: vs } = await supabase
        .from("avatar_versions")
        .select("id, image_url, model_used, qa_score, qa_report, prompt, seed, created_at")
        .eq("beneficiary_id", beneficiary_id)
        .order("created_at", { ascending: false })
        .limit(20);
      const fresh = (vs ?? []).filter(v => !t0Ids.has(v.id));
      const { data: cur } = await supabase
        .from("beneficiaries").select("avatar_status, avatar_qa_report, avatar_qa_score, avatar_model_used, avatar_url")
        .eq("id", beneficiary_id).single();

      // edit_hd writes either an `edit_hd/...` version (pass) or stays preview (fail)
      // plus a clean-bg version after. We wait until status is no longer "pending".
      if (cur && cur.avatar_status !== "pending") {
        // Wait one more cycle to let clean-bg version (if any) land
        await new Promise(r => setTimeout(r, 2500));
        const { data: vs2 } = await supabase
          .from("avatar_versions")
          .select("id, image_url, model_used, qa_score, qa_report, prompt, seed, created_at")
          .eq("beneficiary_id", beneficiary_id)
          .order("created_at", { ascending: false })
          .limit(20);
        const fresh2 = (vs2 ?? []).filter(v => !t0Ids.has(v.id));
        // Pick the version whose model_used matches edit_hd (the meaningful one for the audit)
        newVersion = fresh2.find(v => (v.model_used ?? "").startsWith("edit_hd/")) ?? fresh2[0] ?? null;
        finalRow = cur;
        // capture all fresh versions for cleanup
        (globalThis as any).__freshAll = fresh2;
        break;
      }
      if (fresh.length > 0 && fresh.some(v => (v.model_used ?? "").startsWith("edit_hd/"))) {
        // Have at least one edit_hd version, continue a bit for clean-bg
      }
    }

    const freshAll: any[] = (globalThis as any).__freshAll ?? [];
    (globalThis as any).__freshAll = undefined;

    // ---------- 5. CAPTURE RÉSULTAT ----------
    const resultImageHash = newVersion?.image_url ? await hashUrl(newVersion.image_url) : null;

    // ---------- 6. CLEANUP ----------
    const deletedVersions: string[] = [];
    const deletedFiles: string[] = [];
    const cleanupErrors: string[] = [];

    // Delete bucket files for ALL fresh versions
    for (const v of freshAll) {
      const path = bucketPathFromPublicUrl(v.image_url ?? "");
      if (path) {
        const { error: rmErr } = await supabase.storage.from("avatars").remove([path]);
        if (rmErr) cleanupErrors.push(`storage:${path}:${rmErr.message}`);
        else deletedFiles.push(path);
      }
    }
    // Also delete the canonical avatars/{beneficiary_id}.png produced by edit_hd promote
    // (we'll restore avatar_url to baseline so this file isn't needed)
    const canonicalPath = `${beneficiary_id}.png`;
    const { error: rmCanErr } = await supabase.storage.from("avatars").remove([canonicalPath]);
    if (rmCanErr) cleanupErrors.push(`storage:${canonicalPath}:${rmCanErr.message}`);
    else deletedFiles.push(canonicalPath);

    // Delete avatar_versions rows
    if (freshAll.length > 0) {
      const ids = freshAll.map(v => v.id);
      const { error: delErr } = await supabase
        .from("avatar_versions").delete().in("id", ids);
      if (delErr) cleanupErrors.push(`versions:${delErr.message}`);
      else deletedVersions.push(...ids);
    }

    // ---------- 7. RESTAURATION ----------
    const restorePatch: Record<string, unknown> = {};
    for (const f of AVATAR_FIELDS) restorePatch[f] = snapshot[f];
    const { error: resErr } = await supabase
      .from("beneficiaries").update(restorePatch).eq("id", beneficiary_id);
    if (resErr) throw new Error(`restore failed: ${resErr.message}`);

    // Verify restoration
    const { data: restored } = await supabase
      .from("beneficiaries").select("*").eq("id", beneficiary_id).single();
    const restoreDiff: Record<string, { expected: unknown; actual: unknown }> = {};
    for (const f of AVATAR_FIELDS) {
      const exp = snapshot[f];
      const act = (restored as any)?.[f];
      if (JSON.stringify(exp) !== JSON.stringify(act)) {
        restoreDiff[f] = { expected: exp, actual: act };
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      duration_ms: Date.now() - t0,
      pipeline_call_ms: Date.now() - callStart,
      pipeline_ack: pipelineAck,
      source: { url: sourceUrl, hash: sourceHash },
      mutation: { key, before, after, current_before_mutation: (bRow as any)[key] },
      result: {
        new_version: newVersion,
        all_fresh_versions: freshAll,
        image_hash: resultImageHash,
        beneficiary_after_pipeline: finalRow,
      },
      cleanup: {
        deleted_versions: deletedVersions,
        deleted_files: deletedFiles,
        errors: cleanupErrors,
      },
      restoration: {
        ok: Object.keys(restoreDiff).length === 0,
        diff: restoreDiff,
      },
    }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
