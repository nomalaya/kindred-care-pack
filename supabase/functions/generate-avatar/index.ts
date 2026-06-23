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
  classifyDiff,
  TraitDiff,
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

async function runQA(supabase: any, imageBytes: Uint8Array): Promise<{ scores: any; notes: string[]; global_score: number }> {
  let bin = "";
  for (let i = 0; i < imageBytes.length; i++) bin += String.fromCharCode(imageBytes[i]);
  const b64 = btoa(bin);
  const { data, error } = await supabase.functions.invoke("qa-avatar", {
    body: { image_base64: b64 },
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
): Promise<{ best: RunResult; attempts: RunResult[] }> {
  const attempts: RunResult[] = [];
  const bytes1 = await generateImage(prompt, MODEL_FINAL);
  const qa1 = await runQA(supabase, bytes1);
  attempts.push({ bytes: bytes1, qa: qa1 });
  if (qa1.global_score >= QA_PASS) return { best: attempts[0], attempts };
  if (qa1.global_score >= QA_BORDERLINE) {
    const bytes2 = await generateImage(prompt + "\n[seed-shift-2]", MODEL_FINAL);
    const qa2 = await runQA(supabase, bytes2);
    attempts.push({ bytes: bytes2, qa: qa2 });
    const best = qa2.global_score > qa1.global_score ? attempts[1] : attempts[0];
    return { best, attempts };
  }
  return { best: attempts[0], attempts };
}

/**
 * Fire-and-forget auto-clean: invokes clean-avatar-background so the imported
 * background bucket shows through behind the silhouette. Never blocks the
 * generation result — errors are logged and swallowed.
 */
async function autoCleanBackground(
  supabase: any,
  beneficiary_id: string,
  target: "preview" | "final",
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("clean-avatar-background", {
      body: { beneficiary_id, target },
    });
    if (error) console.error(`auto-clean ${target} error:`, error);
  } catch (e) {
    console.error(`auto-clean ${target} exception:`, e);
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
    } = await req.json();
    if (!beneficiary_id) throw new Error("beneficiary_id required");
    if (!["preview", "final", "edit", "edit_hd"].includes(rawMode)) {
      throw new Error("mode must be 'preview', 'final', 'edit' or 'edit_hd'");
    }

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

      if (!resolvedSourceUrl || !previousTraits) {
        // Bootstrap: no snapshot yet → cannot diff. Treat as full generation;
        // the snapshot will be written below so future edits work.
        fallbackReason = !resolvedSourceUrl ? "no_source_url" : "no_snapshot";
        console.log(`[generate-avatar] ${beneficiary_id} edit→fallback (${fallbackReason})`);
        mode = mode === "edit" ? "preview" : "final";
      } else {
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

          // For edit_hd we run a single QA pass; no retry (edits already preserve identity).
          const bytes = await generateEditedImage(editPrompt, sourceUrl, MODEL_EDIT);
          const ts = Date.now();

          if (mode === "edit") {
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
              avatar_model_used: `edit/${MODEL_EDIT}`,
            }).eq("id", beneficiary_id);
            await supabase.from("avatar_versions").insert({
              beneficiary_id,
              image_url: vu.publicUrl,
              model_used: `edit/${MODEL_EDIT}`,
              seed: traits.avatar_seed,
              prompt: editPrompt,
            });
            await autoCleanBackground(supabase, beneficiary_id, "preview");
            return;
          }

          // edit_hd: QA, on pass we promote to avatar_url
          const qa = await runQA(supabase, bytes);
          if (qa.global_score >= QA_PASS) {
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
              avatar_model_used: `edit_hd/${MODEL_EDIT}`,
              avatar_qa_report: { scores: qa.scores, notes: qa.notes, attempts: 1, edited: true },
              avatar_qa_score: qa.global_score,
            }).eq("id", beneficiary_id);
            await supabase.from("avatar_versions").insert({
              beneficiary_id,
              image_url: vu.publicUrl,
              model_used: `edit_hd/${MODEL_EDIT}`,
              qa_score: qa.global_score,
              qa_report: { scores: qa.scores, notes: qa.notes },
              seed: traits.avatar_seed,
              prompt: editPrompt,
            });
            await autoCleanBackground(supabase, beneficiary_id, "final");
          } else {
            // QA failed on edit → store as preview so the operator can review
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
              avatar_model_used: `edit_hd/${MODEL_EDIT}`,
              avatar_qa_report: { scores: qa.scores, notes: qa.notes, edited: true, reason: "edit_qa_below_pass" },
              avatar_qa_score: qa.global_score,
            }).eq("id", beneficiary_id);
            await autoCleanBackground(supabase, beneficiary_id, "preview");
          }
          return;
        }

        // -------------------- CREATION (text→image) --------------------
        const prompt = `${basePrompt}\n[render-token: ${nonce}]`;
        traitsUpdate.avatar_prompt = prompt;

        if (mode === "preview") {
          const bytes = await generateImage(prompt, MODEL_PREVIEW);
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
            avatar_model_used: MODEL_PREVIEW,
          }).eq("id", beneficiary_id);
          await supabase.from("avatar_versions").insert({
            beneficiary_id,
            image_url: vu.publicUrl,
            model_used: MODEL_PREVIEW,
            seed: traits.avatar_seed,
            prompt,
          });
          await autoCleanBackground(supabase, beneficiary_id, "preview");
          return;
        }

        // FINAL mode: Pro + QA scoring
        const { best, attempts } = await runFinalPipeline(supabase, prompt);
        const qa = best.qa!;

        if (qa.global_score >= QA_PASS) {
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
            avatar_url: url,
            avatar_source_url: url,
            avatar_status: "validated",
            avatar_workflow_status: nextWorkflow,
            avatar_model_used: MODEL_FINAL,
            avatar_qa_report: { scores: qa.scores, notes: qa.notes, attempts: attempts.length },
            avatar_qa_score: qa.global_score,
          }).eq("id", beneficiary_id);
          await supabase.from("avatar_versions").insert({
            beneficiary_id,
            image_url: vu.publicUrl,
            model_used: MODEL_FINAL,
            qa_score: qa.global_score,
            qa_report: { scores: qa.scores, notes: qa.notes },
            seed: traits.avatar_seed,
            prompt,
          });
          await autoCleanBackground(supabase, beneficiary_id, "final");
        } else {
          const ts = Date.now();
          const fileName = `rejected/${beneficiary_id}-${ts}.png`;
          await supabase.storage.from("avatars").upload(
            fileName, best.bytes, { contentType: "image/png", upsert: true },
          );
          await supabase.from("beneficiaries").update({
            ...traitsUpdate,
            avatar_status: "failed",
            avatar_model_used: MODEL_FINAL,
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
