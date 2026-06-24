// Avatar generation v3 — preview/final (text→image) + edit/edit_hd (image→image)
//
// Modes:
//   - "preview" : full text-to-image, fast model, no QA, writes avatar_preview_url
//   - "final"   : full text-to-image, with QA + 1 retry, writes avatar_url
//   - "edit"    : image edit using the existing avatar as visual reference,
//                 modifies only the changed attributes, writes avatar_preview_url
//   - "edit_hd" : same as "edit" but with QA scoring; on pass writes avatar_url
//                 and preserves approved/locked workflow status
//
// After every successful upload the function fires-and-forgets a call to
// `clean-avatar-background` so the imported background bucket shows through
// without requiring a manual click.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  inferAvatarTraits,
  AvatarTraits,
  diffTraits,
  buildTraitDiffFromKeys,
  classifyDiff,
  TraitDiff,
  TRANSFORMATIVE_TRAIT_KEYS,
} from "../_shared/avatarTraits.ts";
import {
  buildAvatarPrompt,
  buildEditPrompt,
  MODEL_PREVIEW,
  MODEL_FINAL,
  MODEL_EDIT,
} from "../_shared/avatarArtDirection.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const QA_PASS = 75;
const QA_BORDERLINE = 60;

// Soft cap on cumulative changes within a single edit pass — a safety net only.
// Structural changes are now handled explicitly via requires_confirmation, not
// via silent fallback. See classifyDiff().
const MAX_EDIT_DIFF = 8;


type GenMode = "preview" | "final" | "edit" | "edit_hd";

async function generateImage(prompt: string, model: string): Promise<Uint8Array> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    const err: any = new Error(`AI gateway ${resp.status}: ${t}`);
    err.gatewayStatus = resp.status;
    if (resp.status === 402) err.code = "no_credits";
    else if (resp.status === 429) err.code = "rate_limited";
    throw err;
  }
  const data = await resp.json();
  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("No image returned");
  const base64 = url.replace(/^data:image\/\w+;base64,/, "");
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

async function fetchSourceImageAsDataUrl(sourceUrl: string): Promise<string> {
  const cleanUrl = sourceUrl.split("?")[0];
  const resp = await fetch(cleanUrl);
  if (!resp.ok) throw new Error(`Source avatar fetch failed: ${resp.status}`);
  const mime = resp.headers.get("content-type") ?? "image/png";
  const buf = new Uint8Array(await resp.arrayBuffer());
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) {
    bin += String.fromCharCode(...buf.subarray(i, i + chunk));
  }
  return `data:${mime};base64,${btoa(bin)}`;
}

/**
 * Image-to-image edit call. Sends the existing avatar as a visual reference
 * plus the minimal edit instructions; the model returns a retouched PNG.
 */
async function generateEditedImage(prompt: string, sourceUrl: string, model: string): Promise<Uint8Array> {
  const dataUrl = await fetchSourceImageAsDataUrl(sourceUrl);
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      }],
      modalities: ["image", "text"],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    const err: any = new Error(`AI gateway ${resp.status}: ${t}`);
    err.gatewayStatus = resp.status;
    if (resp.status === 402) err.code = "no_credits";
    else if (resp.status === 429) err.code = "rate_limited";
    throw err;
  }
  const data = await resp.json();
  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("No image returned from edit");
  const base64 = url.replace(/^data:image\/\w+;base64,/, "");
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

async function runQA(
  supabase: any,
  imageBytes: Uint8Array,
  transformativeTraits: string[] = [],
): Promise<{ scores: any; notes: string[]; global_score: number }> {
  let bin = "";
  for (let i = 0; i < imageBytes.length; i++) bin += String.fromCharCode(imageBytes[i]);
  const b64 = btoa(bin);
  const { data, error } = await supabase.functions.invoke("qa-avatar", {
    body: { image_base64: b64, transformative_traits: transformativeTraits },
  });
  if (error) throw new Error(`QA invoke error: ${error.message}`);
  return data;
}

interface RunResult {
  bytes: Uint8Array;
  qa: { scores: any; notes: string[]; global_score: number } | null;
}

async function runFinalPipeline(
  supabase: any,
  prompt: string,
  modelFinal: string = MODEL_FINAL,
): Promise<{ best: RunResult; attempts: RunResult[] }> {
  const attempts: RunResult[] = [];
  const bytes1 = await generateImage(prompt, modelFinal);
  const qa1 = await runQA(supabase, bytes1);
  attempts.push({ bytes: bytes1, qa: qa1 });
  if (qa1.global_score >= QA_PASS) return { best: attempts[0], attempts };
  if (qa1.global_score >= QA_BORDERLINE) {
    const bytes2 = await generateImage(prompt + "\n[seed-shift-2]", modelFinal);
    const qa2 = await runQA(supabase, bytes2);
    attempts.push({ bytes: bytes2, qa: qa2 });
    const best = qa2.global_score > qa1.global_score ? attempts[1] : attempts[0];
    return { best, attempts };
  }
  return { best: attempts[0], attempts };
}

const BUST_FAIL = 75;

function failsBust(qa: { scores?: any } | null | undefined): boolean {
  const s = qa?.scores?.bust_completeness;
  return typeof s === "number" && s < BUST_FAIL;
}

async function runQAByUrl(
  supabase: any,
  url: string,
): Promise<{ scores: any; notes: string[]; global_score: number }> {
  // Bust the cached image so we score the freshly cleaned file, not a CDN copy.
  const cacheBuster = `${url.split("?")[0]}?qa=${Date.now()}`;
  const { data, error } = await supabase.functions.invoke("qa-avatar", {
    body: { image_url: cacheBuster },
  });
  if (error) throw new Error(`QA(url) invoke error: ${error.message}`);
  return data;
}

// ---- Rollback snapshots ----------------------------------------------------
// We capture the EXACT prior values of every field we may have written, so a
// failed post-clean QA restores the row to its pre-generation state with a
// single atomic UPDATE.
function snapshotPreviewFields(b: any): Record<string, any> {
  return {
    avatar_preview_url: b.avatar_preview_url ?? null,
    avatar_status: b.avatar_status ?? null,
    avatar_model_used: b.avatar_model_used ?? null,
    avatar_prompt: b.avatar_prompt ?? null,
    avatar_qa_score: b.avatar_qa_score ?? null,
    avatar_qa_report: b.avatar_qa_report ?? null,
  };
}

function snapshotFinalFields(b: any): Record<string, any> {
  return {
    avatar_url: b.avatar_url ?? null,
    avatar_source_url: b.avatar_source_url ?? null,
    avatar_preview_url: b.avatar_preview_url ?? null,
    avatar_status: b.avatar_status ?? null,
    avatar_workflow_status: b.avatar_workflow_status ?? null,
    avatar_model_used: b.avatar_model_used ?? null,
    avatar_prompt: b.avatar_prompt ?? null,
    avatar_generated_traits: b.avatar_generated_traits ?? null,
    avatar_generated_at: b.avatar_generated_at ?? null,
    avatar_qa_score: b.avatar_qa_score ?? null,
    avatar_qa_report: b.avatar_qa_report ?? null,
  };
}

async function rollbackBeneficiary(
  supabase: any,
  beneficiary_id: string,
  snapshot: Record<string, any>,
  newStoragePath: string | null,
  reason: string,
): Promise<void> {
  console.error(
    `[generate-avatar] ROLLBACK ${beneficiary_id} reason=${reason} ` +
    `restoring keys=${Object.keys(snapshot).join(",")} removing=${newStoragePath ?? "(none)"}`,
  );
  const { error: upErr } = await supabase
    .from("beneficiaries")
    .update(snapshot)
    .eq("id", beneficiary_id);
  if (upErr) {
    console.error(`[generate-avatar] ROLLBACK UPDATE failed ${beneficiary_id}:`, upErr);
  }
  if (newStoragePath) {
    const { error: rmErr } = await supabase.storage.from("avatars").remove([newStoragePath]);
    if (rmErr) console.error(`[generate-avatar] ROLLBACK remove ${newStoragePath} failed:`, rmErr);
  }
}

/**
 * SYNCHRONOUS clean + post-detourage QA gate.
 * - Awaits clean-avatar-background (replaces the previous fire-and-forget).
 * - Re-reads the served column to QA the EXACT image the user will see.
 * - On bust_completeness < 75 (or clean invoke failure), rolls back every
 *   field in `snapshot` and removes the newly uploaded file (best-effort).
 *
 * Returns { rejected, qaPost } so callers can include the score in their
 * response/log without restructuring the upload branch.
 */
async function runCleanAndVerify(
  supabase: any,
  beneficiary_id: string,
  target: "preview" | "final",
  servedColumn: "avatar_preview_url" | "avatar_url",
  snapshot: Record<string, any>,
  newStoragePath: string,
): Promise<{ rejected: boolean; qaPost: any | null; reason?: string }> {
  // 1. Synchronous clean
  let cleanError: any = null;
  try {
    const { error } = await supabase.functions.invoke("clean-avatar-background", {
      body: { beneficiary_id, target },
    });
    cleanError = error ?? null;
  } catch (e) {
    cleanError = e;
  }
  if (cleanError) {
    console.error(`[generate-avatar] clean-avatar-background failed for ${beneficiary_id}:`, cleanError);
    await rollbackBeneficiary(supabase, beneficiary_id, snapshot, newStoragePath, "clean_invoke_failed");
    return { rejected: true, qaPost: null, reason: "clean_invoke_failed" };
  }

  // 2. Re-read served URL (clean may rewrite it)
  const { data: refreshed, error: rdErr } = await supabase
    .from("beneficiaries")
    .select(servedColumn)
    .eq("id", beneficiary_id)
    .single();
  if (rdErr || !refreshed) {
    console.error(`[generate-avatar] post-clean read failed ${beneficiary_id}:`, rdErr);
    return { rejected: false, qaPost: null, reason: "post_read_failed" };
  }
  const servedUrl: string | null = (refreshed as any)?.[servedColumn] ?? null;
  if (!servedUrl) {
    return { rejected: false, qaPost: null };
  }

  // 3. QA on the actually-served image
  let qaPost: any | null = null;
  try {
    qaPost = await runQAByUrl(supabase, servedUrl);
    console.log(
      `[generate-avatar] post-clean QA ${beneficiary_id} ` +
      `bust=${qaPost?.scores?.bust_completeness} global=${qaPost?.global_score}`,
    );
  } catch (e) {
    console.error(`[generate-avatar] post-clean QA failed ${beneficiary_id}:`, e);
    // QA call failure is NOT a rollback trigger — we only rollback on a
    // confirmed bust defect. Best-effort: log and continue.
    return { rejected: false, qaPost: null, reason: "post_qa_failed" };
  }

  if (failsBust(qaPost)) {
    await rollbackBeneficiary(
      supabase, beneficiary_id, snapshot, newStoragePath, "bust_incomplete_after_clean",
    );
    return { rejected: true, qaPost, reason: "bust_incomplete_after_clean" };
  }
  return { rejected: false, qaPost };
}

// Pre-clean bust gate. Used on every mode BEFORE upload so we never persist a
// generation that is already broken at the model stage.
async function gateBustPreClean(
  supabase: any,
  bytes: Uint8Array,
  transformativeTraits: string[] = [],
): Promise<{ ok: true; qa: any } | { ok: false; qa: any | null; reason: string }> {
  try {
    const qa = await runQA(supabase, bytes, transformativeTraits);
    if (failsBust(qa)) {
      return { ok: false, qa, reason: "bust_incomplete_pre_clean" };
    }
    return { ok: true, qa };
  } catch (e) {
    console.error("[generate-avatar] pre-clean QA failed:", e);
    // Don't block on a QA infrastructure error — best effort.
    return { ok: true, qa: null };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      beneficiary_id,
      mode: rawMode = "preview",
      force = false,
      confirmStructural = false,
      changedKeys,
      requestedDiff,
      model_override,
    } = await req.json();
    if (!beneficiary_id) throw new Error("beneficiary_id required");
    if (!["preview", "final", "edit", "edit_hd"].includes(rawMode)) {
      throw new Error("mode must be 'preview', 'final', 'edit' or 'edit_hd'");
    }
    // Admin / audit override: force a specific image model for this single call.
    // Allow-list only the gateway image models we currently support.
    const MODEL_ALLOWLIST = new Set([
      "google/gemini-3.1-flash-image-preview", // Nano Banana 2 (default)
      "google/gemini-3-pro-image",             // Nano Banana Pro
      "google/gemini-3.1-flash-image",         // Nano Banana 2 stable alias
      "google/gemini-2.5-flash-image",         // Nano Banana 1
    ]);
    const modelOverride: string | null =
      typeof model_override === "string" && MODEL_ALLOWLIST.has(model_override)
        ? model_override
        : null;
    if (model_override && !modelOverride) {
      console.warn(`[generate-avatar] ignored model_override (not in allowlist): ${model_override}`);
    }
    const userChangedKeys: string[] | null = Array.isArray(changedKeys)
      ? changedKeys.filter((k): k is string => typeof k === "string")
      : null;
    const requestedBefore: Record<string, unknown> | null =
      requestedDiff && typeof requestedDiff === "object"
        ? Object.fromEntries(
            Object.entries(requestedDiff as Record<string, any>).map(
              ([k, v]) => [k, v && typeof v === "object" ? (v as any).before ?? null : null],
            ),
          )
        : null;

    let mode: GenMode = rawMode as GenMode;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: b, error: bErr } = await supabase
      .from("beneficiaries")
      .select("*")
      .eq("id", beneficiary_id)
      .single();
    if (bErr || !b) throw new Error("Beneficiary not found");

    if ((b.avatar_dignity_level ?? 5) < 3) {
      throw new Error("Dignity level below threshold (3) — generation blocked");
    }

    if (b.avatar_workflow_status === "locked" && !force) {
      return new Response(JSON.stringify({ skipped: true, reason: "locked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "final" && b.avatar_status === "validated" && !force) {
      return new Response(JSON.stringify({ skipped: true, reason: "already validated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ------------------------------------------------------------------
    // Edit-mode preflight: decide whether we can actually edit the
    // reference, or whether we must fall back to a full regeneration.
    // ------------------------------------------------------------------
    let editDiff: TraitDiff[] = [];
    let resolvedSourceUrl: string | null = null;
    let fallbackReason: string | null = null;
    if (mode === "edit" || mode === "edit_hd") {
      // Validate avatar_source_url: it must either equal the current active avatar,
      // or still exist in avatar_versions. Otherwise it points to a deleted image
      // and we fall back to the current active avatar.
      let candidateSource: string | null = b.avatar_source_url || null;
      const activeUrl: string | null = b.avatar_url || null;
      let sourceIsStale = false;
      if (candidateSource && candidateSource !== activeUrl) {
        const { data: ver } = await supabase
          .from("avatar_versions")
          .select("id")
          .eq("beneficiary_id", beneficiary_id)
          .eq("image_url", candidateSource)
          .maybeSingle();
        if (!ver) {
          sourceIsStale = true;
          console.log(`[generate-avatar] ${beneficiary_id} stale avatar_source_url, falling back to avatar_url`);
          candidateSource = activeUrl;
        }
      } else if (!candidateSource) {
        candidateSource = activeUrl;
      }
      if (sourceIsStale) {
        // Persist the correction immediately so future calls don't re-resolve a deleted URL.
        await supabase
          .from("beneficiaries")
          .update({ avatar_source_url: candidateSource })
          .eq("id", beneficiary_id);
        (b as any).avatar_source_url = candidateSource;
      }
      resolvedSourceUrl = candidateSource;
      const previousTraits = b.avatar_generated_traits as Partial<AvatarTraits> | null;
      const currentTraits = inferAvatarTraits(b);

      if (!resolvedSourceUrl) {
        // Bootstrap: no source image yet → cannot edit. Full generation;
        // the snapshot will be written below so future edits work.
        fallbackReason = "no_source_url";
        console.log(`[generate-avatar] ${beneficiary_id} edit→fallback (${fallbackReason})`);
        mode = mode === "edit" ? "preview" : "final";
      } else if (userChangedKeys !== null) {
        // NEW FLOW — diff driven by explicit user intent from the frontend.
        // Eliminates the "stale snapshot → 19 phantom diffs → wrong full regen"
        // class of bugs. The snapshot is NEVER rewritten silently from current
        // traits; it stays a faithful image of whatever is actually painted.
        editDiff = buildTraitDiffFromKeys(
          previousTraits,
          currentTraits,
          userChangedKeys,
          requestedBefore,
        );
        console.log(
          `[generate-avatar] ${beneficiary_id} edit diff [user-intent ${userChangedKeys.length} key(s)] (${editDiff.length}):`,
          editDiff.map(d => `${d.key}:${d.before}→${d.after}`).join(", "),
        );
        console.log(`[generate-avatar] ${beneficiary_id} source_url: ${resolvedSourceUrl}`);
        if (editDiff.length === 0) {
          return new Response(JSON.stringify({
            skipped: true,
            reason: "no_user_changes",
            source_url: resolvedSourceUrl,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if (!previousTraits) {
        // Legacy bootstrap path (no snapshot AND no user-intent from client).
        fallbackReason = "no_snapshot";
        console.log(`[generate-avatar] ${beneficiary_id} edit→fallback (${fallbackReason})`);
        mode = mode === "edit" ? "preview" : "final";
      } else {
        // LEGACY DIFF PATH — kept for backward compatibility with older
        // clients that don't yet transmit `changedKeys`. Flagged in logs so
        // we can spot it. Subject to the stale-snapshot caveat.
        console.log(`[generate-avatar] ${beneficiary_id} legacy_diff_path (no changedKeys)`);
        editDiff = diffTraits(previousTraits, currentTraits);
        console.log(
          `[generate-avatar] ${beneficiary_id} edit diff (${editDiff.length}):`,
          editDiff.map(d => `${d.key}:${d.before}→${d.after}`).join(", "),
        );
        console.log(`[generate-avatar] ${beneficiary_id} source_url: ${resolvedSourceUrl}`);
        if (editDiff.length === 0) {
          return new Response(JSON.stringify({
            skipped: true,
            reason: "no_changes",
            source_url: resolvedSourceUrl,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (editDiff.length > 0) {
        const cls = classifyDiff(editDiff);
        console.log(
          `[generate-avatar] ${beneficiary_id} edit classification: level=${cls.level} ` +
          `structural=[${cls.structuralKeys.join(",")}] medium=[${cls.mediumKeys.join(",")}] light=[${cls.lightKeys.join(",")}]`,
        );

        // Structural change requires explicit operator confirmation.
        // No silent fallback to full regeneration anymore.
        if (cls.level === "structural" && !confirmStructural) {
          const structuralLabels = editDiff
            .filter(d => cls.structuralKeys.includes(d.key))
            .map(d => d.humanLabel);
          return new Response(JSON.stringify({
            status: "requires_confirmation",
            level: "structural",
            structuralKeys: cls.structuralKeys,
            structuralLabels,
            message:
              "Cette modification touche l'identité visuelle (" +
              structuralLabels.join(", ") +
              "). Utilisez la régénération complète pour la valider.",
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Confirmed structural change → full regeneration (text→image).
        // Otherwise (light or medium) → image edit.
        if (cls.level === "structural" && confirmStructural) {
          fallbackReason = "structural_change_confirmed";
          console.log(`[generate-avatar] ${beneficiary_id} structural change confirmed → full regen`);
          mode = mode === "edit" ? "preview" : "final";
        } else if (editDiff.length > MAX_EDIT_DIFF) {
          fallbackReason = "too_many_changes";
          console.log(`[generate-avatar] ${beneficiary_id} too many changes (${editDiff.length}) → full regen`);
          mode = mode === "edit" ? "preview" : "final";
        }

      }
    }


    // Mark pending immediately
    await supabase.from("beneficiaries").update({
      avatar_status: (mode === "preview" || mode === "edit") ? "pending" : b.avatar_status,
    }).eq("id", beneficiary_id);

    // Fire-and-forget heavy work
    const work = (async () => {
      try {
        // Effective models for this call: override wins, else defaults.
        const M_PREVIEW = modelOverride ?? MODEL_PREVIEW;
        const M_FINAL = modelOverride ?? MODEL_FINAL;
        const M_EDIT = modelOverride ?? MODEL_EDIT;
        if (modelOverride) {
          console.log(`[generate-avatar] model_override active: ${modelOverride}`);
        }
        const traits = inferAvatarTraits(b);
        const basePrompt = buildAvatarPrompt(traits);
        // Seed-stable render token: same seed → same identity across regenerations.
        // Date.now() is intentionally NOT included; it stays for file naming only.
        const nonce = `${traits.avatar_seed}`;


        // Snapshot used for future edit diffs. Written ONLY on paths that
        // also promote avatar_url in the same UPDATE — otherwise the snapshot
        // would drift ahead of the reference image actually used as the edit
        // base (Léa case).
        const snapshotTraits: Record<string, any> = { ...traits };
        const snapshotPatch: Record<string, any> = {
          avatar_generated_traits: snapshotTraits,
          avatar_generated_at: new Date().toISOString(),
        };

        // Current trait fields — safe to refresh on every success path
        // (used by the UI). Does NOT include the snapshot.
        const traitsUpdate: Record<string, any> = {
          ...traits,
          avatar_seed: traits.avatar_seed,
        };

        // -------------------- EDIT (image→image) --------------------
        if (mode === "edit" || mode === "edit_hd") {
          const sourceUrl: string = resolvedSourceUrl || b.avatar_source_url || b.avatar_url;
          const editPrompt = `${buildEditPrompt(editDiff, traits)}\n[render-token: ${nonce}]`;
          traitsUpdate.avatar_prompt = editPrompt;

          // Which transformative attributes are in this diff? Tells QA to allow
          // natural face/body changes (same person transformed).
          const transformsInDiff = editDiff
            .map(d => d.key)
            .filter(k => (TRANSFORMATIVE_TRAIT_KEYS as string[]).includes(k));
          const isBodyTypeEdit = transformsInDiff.includes("avatar_body_type");

          // First attempt
          let bytes = await generateEditedImage(editPrompt, sourceUrl, M_EDIT);
          let ts = Date.now();
          let preGate = await gateBustPreClean(supabase, bytes, transformsInDiff);
          let attempts = 1;

          // For body-type edits specifically: retry ONCE with a seed-shifted
          // prompt before giving up. We do NOT silently fall back to full
          // text-to-image (would invent a new face).
          if (!preGate.ok && isBodyTypeEdit) {
            console.warn(
              `[generate-avatar] EDIT body_type bust gate failed on attempt 1 ` +
              `(${preGate.qa?.scores?.bust_completeness}) — retrying with seed-shift`,
            );
            const retryPrompt = `${editPrompt}\n[seed-shift-body-${Date.now()}]`;
            bytes = await generateEditedImage(retryPrompt, sourceUrl, M_EDIT);
            ts = Date.now();
            preGate = await gateBustPreClean(supabase, bytes, transformsInDiff);
            attempts = 2;
          }

          if (!preGate.ok) {
            // Final failure — surface a precise reason.
            const reason = isBodyTypeEdit ? "body_type_unstable" : preGate.reason;
            console.error(
              `[generate-avatar] EDIT pre-clean bust gate FAILED ${beneficiary_id} ` +
              `bust=${preGate.qa?.scores?.bust_completeness} reason=${reason} attempts=${attempts}`,
            );
            await supabase.from("beneficiaries").update({
              avatar_status: "failed",
              avatar_qa_report: {
                stage: "pre_clean",
                reason,
                scores: preGate.qa?.scores ?? null,
                notes: preGate.qa?.notes ?? null,
                attempts,
                edited: true,
                transforms: transformsInDiff,
              },
            }).eq("id", beneficiary_id);
            return;
          }

          if (mode === "edit") {
            const snapshot = snapshotPreviewFields(b);
            const fileName = `preview/${beneficiary_id}.png`;
            const versionFileName = `versions/${beneficiary_id}/edit-${ts}.png`;
            const { error: upErr } = await supabase.storage.from("avatars").upload(
              fileName, bytes, { contentType: "image/png", upsert: true },
            );
            if (upErr) throw upErr;
            await supabase.storage.from("avatars").upload(
              versionFileName, bytes, { contentType: "image/png", upsert: false },
            );
            const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
            const { data: vu } = supabase.storage.from("avatars").getPublicUrl(versionFileName);
            const url = `${u.publicUrl}?t=${ts}`;
            await supabase.from("beneficiaries").update({
              ...traitsUpdate,
              avatar_preview_url: url,
              avatar_status: "preview",
              avatar_model_used: `edit/${M_EDIT}`,
            }).eq("id", beneficiary_id);
            await supabase.from("avatar_versions").insert({
              beneficiary_id,
              image_url: vu.publicUrl,
              model_used: `edit/${M_EDIT}`,
              seed: traits.avatar_seed,
              prompt: editPrompt,
            });
            await runCleanAndVerify(
              supabase, beneficiary_id, "preview", "avatar_preview_url", snapshot, fileName,
            );
            return;
          }

          // edit_hd: QA, on pass we promote to avatar_url
          const qa = preGate.qa ?? await runQA(supabase, bytes, transformsInDiff);
          if (qa.global_score >= QA_PASS) {
            const snapshot = snapshotFinalFields(b);
            const fileName = `${beneficiary_id}.png`;
            const versionFileName = `versions/${beneficiary_id}/edit-hd-${ts}.png`;
            const { error: upErr } = await supabase.storage.from("avatars").upload(
              fileName, bytes, { contentType: "image/png", upsert: true },
            );
            if (upErr) throw upErr;
            await supabase.storage.from("avatars").upload(
              versionFileName, bytes, { contentType: "image/png", upsert: false },
            );
            const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
            const { data: vu } = supabase.storage.from("avatars").getPublicUrl(versionFileName);
            const url = `${u.publicUrl}?t=${ts}`;
            const nextWorkflow =
              b.avatar_workflow_status === "approved" || b.avatar_workflow_status === "locked"
                ? b.avatar_workflow_status
                : "generated";
            await supabase.from("beneficiaries").update({
              ...traitsUpdate,
              ...snapshotPatch,
              avatar_url: url,
              avatar_source_url: url,
              avatar_status: "validated",
              avatar_workflow_status: nextWorkflow,
              avatar_model_used: `edit_hd/${M_EDIT}`,
              avatar_qa_report: { scores: qa.scores, notes: qa.notes, attempts: 1, edited: true },
              avatar_qa_score: qa.global_score,
            }).eq("id", beneficiary_id);
            await supabase.from("avatar_versions").insert({
              beneficiary_id,
              image_url: vu.publicUrl,
              model_used: `edit_hd/${M_EDIT}`,
              qa_score: qa.global_score,
              qa_report: { scores: qa.scores, notes: qa.notes },
              seed: traits.avatar_seed,
              prompt: editPrompt,
            });
            await runCleanAndVerify(
              supabase, beneficiary_id, "final", "avatar_url", snapshot, fileName,
            );
          } else {
            // QA failed on edit → store as preview so the operator can review
            const snapshot = snapshotPreviewFields(b);
            const fileName = `preview/${beneficiary_id}.png`;
            const { error: upErr } = await supabase.storage.from("avatars").upload(
              fileName, bytes, { contentType: "image/png", upsert: true },
            );
            if (upErr) throw upErr;
            const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
            const url = `${u.publicUrl}?t=${ts}`;
            await supabase.from("beneficiaries").update({
              ...traitsUpdate,
              avatar_preview_url: url,
              avatar_status: "preview",
              avatar_model_used: `edit_hd/${M_EDIT}`,
              avatar_qa_report: { scores: qa.scores, notes: qa.notes, edited: true, reason: "edit_qa_below_pass" },
              avatar_qa_score: qa.global_score,
            }).eq("id", beneficiary_id);
            await runCleanAndVerify(
              supabase, beneficiary_id, "preview", "avatar_preview_url", snapshot, fileName,
            );
          }
          return;
        }

        // -------------------- CREATION (text→image) --------------------
        const prompt = `${basePrompt}\n[render-token: ${nonce}]`;
        traitsUpdate.avatar_prompt = prompt;

        if (mode === "preview") {
          const bytes = await generateImage(prompt, M_PREVIEW);

          // -------- PRE-CLEAN BUST GATE --------
          const preGate = await gateBustPreClean(supabase, bytes);
          if (!preGate.ok) {
            console.error(
              `[generate-avatar] PREVIEW pre-clean bust gate FAILED ${beneficiary_id} ` +
              `bust=${preGate.qa?.scores?.bust_completeness}`,
            );
            await supabase.from("beneficiaries").update({
              avatar_status: "failed",
              avatar_qa_report: {
                stage: "pre_clean",
                reason: preGate.reason,
                scores: preGate.qa?.scores ?? null,
                notes: preGate.qa?.notes ?? null,
              },
            }).eq("id", beneficiary_id);
            return;
          }

          const snapshot = snapshotPreviewFields(b);
          const ts = Date.now();
          const fileName = `preview/${beneficiary_id}.png`;
          const versionFileName = `versions/${beneficiary_id}/preview-${ts}.png`;
          const { error: upErr } = await supabase.storage.from("avatars").upload(
            fileName, bytes, { contentType: "image/png", upsert: true },
          );
          if (upErr) throw upErr;
          await supabase.storage.from("avatars").upload(
            versionFileName, bytes, { contentType: "image/png", upsert: false },
          );
          const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
          const { data: vu } = supabase.storage.from("avatars").getPublicUrl(versionFileName);
          const url = `${u.publicUrl}?t=${ts}`;
          await supabase.from("beneficiaries").update({
            ...traitsUpdate,
            avatar_preview_url: url,
            avatar_status: "preview",
            avatar_model_used: M_PREVIEW,
          }).eq("id", beneficiary_id);
          await supabase.from("avatar_versions").insert({
            beneficiary_id,
            image_url: vu.publicUrl,
            model_used: M_PREVIEW,
            seed: traits.avatar_seed,
            prompt,
          });
          await runCleanAndVerify(
            supabase, beneficiary_id, "preview", "avatar_preview_url", snapshot, fileName,
          );
          return;
        }

        // FINAL mode: Pro + QA scoring (runFinalPipeline already calls QA with bust_completeness)
        const { best, attempts } = await runFinalPipeline(supabase, prompt, M_FINAL);
        const qa = best.qa!;

        // Pre-clean bust gate is implicit here: runFinalPipeline runs runQA which
        // includes bust_completeness with hard-fail < 75, so a bust defect drops
        // global_score and triggers the QA_PASS branch below to fail.
        if (qa.global_score >= QA_PASS && !failsBust(qa)) {
          const snapshot = snapshotFinalFields(b);
          const ts = Date.now();
          const fileName = `${beneficiary_id}.png`;
          const versionFileName = `versions/${beneficiary_id}/final-${ts}.png`;
          const { error: upErr } = await supabase.storage.from("avatars").upload(
            fileName, best.bytes, { contentType: "image/png", upsert: true },
          );
          if (upErr) throw upErr;
          await supabase.storage.from("avatars").upload(
            versionFileName, best.bytes, { contentType: "image/png", upsert: false },
          );
          const { data: u } = supabase.storage.from("avatars").getPublicUrl(fileName);
          const { data: vu } = supabase.storage.from("avatars").getPublicUrl(versionFileName);
          const url = `${u.publicUrl}?t=${ts}`;
          const nextWorkflow =
            b.avatar_workflow_status === "approved" || b.avatar_workflow_status === "locked"
              ? b.avatar_workflow_status
              : "generated";
          await supabase.from("beneficiaries").update({
            ...traitsUpdate,
            ...snapshotPatch,
            avatar_url: url,
            avatar_source_url: url,
            avatar_status: "validated",
            avatar_workflow_status: nextWorkflow,
            avatar_model_used: M_FINAL,
            avatar_qa_report: { scores: qa.scores, notes: qa.notes, attempts: attempts.length },
            avatar_qa_score: qa.global_score,
          }).eq("id", beneficiary_id);
          await supabase.from("avatar_versions").insert({
            beneficiary_id,
            image_url: vu.publicUrl,
            model_used: M_FINAL,
            qa_score: qa.global_score,
            qa_report: { scores: qa.scores, notes: qa.notes },
            seed: traits.avatar_seed,
            prompt,
          });
          await runCleanAndVerify(
            supabase, beneficiary_id, "final", "avatar_url", snapshot, fileName,
          );
        } else {
          const ts = Date.now();
          const fileName = `rejected/${beneficiary_id}-${ts}.png`;
          await supabase.storage.from("avatars").upload(
            fileName, best.bytes, { contentType: "image/png", upsert: true },
          );
          await supabase.from("beneficiaries").update({
            ...traitsUpdate,
            avatar_status: "failed",
            avatar_model_used: M_FINAL,
            avatar_qa_report: {
              scores: qa.scores,
              notes: qa.notes,
              attempts: attempts.length,
              rejected_path: fileName,
              reason: qa.global_score < QA_BORDERLINE ? "score_below_60" : "retry_failed",
            },
            avatar_qa_score: qa.global_score,
          }).eq("id", beneficiary_id);
        }
      } catch (workErr: any) {
        console.error("avatar work error:", workErr);
        await supabase.from("beneficiaries").update({
          avatar_status: "failed",
          avatar_qa_report: {
            reason: workErr.code === "no_credits"
              ? "no_credits"
              : workErr.code === "rate_limited"
              ? "rate_limited"
              : "work_error",
            error: workErr.message ?? String(workErr),
            code: workErr.code ?? null,
            gateway_status: workErr.gatewayStatus ?? null,
          },
        }).eq("id", beneficiary_id);
      }
    })();

    // @ts-ignore EdgeRuntime exists on Supabase edge runtime
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(work);
    else await work;

    return new Response(JSON.stringify({
      accepted: true,
      mode,
      edited: mode === "edit" || mode === "edit_hd",
      source_url: resolvedSourceUrl,
      fallback_reason: fallbackReason,
      diff: editDiff.map(d => ({ key: d.key, label: d.humanLabel, before: d.before, after: d.after })),
    }), {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-avatar error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
