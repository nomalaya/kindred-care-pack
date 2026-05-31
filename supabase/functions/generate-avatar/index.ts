// Avatar generation v2 — preview (Flash) or final (Pro) + QA scoring
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { inferAvatarTraits, AvatarTraits } from "../_shared/avatarTraits.ts";
import {
  buildAvatarPrompt,
  MODEL_PREVIEW,
  MODEL_FINAL,
} from "../_shared/avatarArtDirection.ts";
import { cropAvatarBytes } from "../_shared/avatarCrop.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const QA_PASS = 75;
const QA_BORDERLINE = 60;

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

async function runQA(supabase: any, imageBytes: Uint8Array): Promise<{ scores: any; notes: string[]; global_score: number }> {
  // Convert bytes to base64 for inline QA call
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
  traits: AvatarTraits,
  prompt: string,
): Promise<{ best: RunResult; attempts: RunResult[] }> {
  const attempts: RunResult[] = [];
  // Attempt 1
  const bytes1 = await generateImage(prompt, MODEL_FINAL);
  const qa1 = await runQA(supabase, bytes1);
  attempts.push({ bytes: bytes1, qa: qa1 });
  if (qa1.global_score >= QA_PASS) {
    return { best: attempts[0], attempts };
  }
  if (qa1.global_score >= QA_BORDERLINE) {
    // Retry once with shifted seed (re-build prompt with slightly different traits — we keep prompt identical;
    // image model uses its own seed, so a second call effectively reshuffles)
    const bytes2 = await generateImage(prompt + "\n[seed-shift-2]", MODEL_FINAL);
    const qa2 = await runQA(supabase, bytes2);
    attempts.push({ bytes: bytes2, qa: qa2 });
    const best = qa2.global_score > qa1.global_score ? attempts[1] : attempts[0];
    return { best, attempts };
  }
  return { best: attempts[0], attempts };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { beneficiary_id, mode = "preview", force = false } = await req.json();
    if (!beneficiary_id) throw new Error("beneficiary_id required");
    if (mode !== "preview" && mode !== "final") throw new Error("mode must be 'preview' or 'final'");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: b, error: bErr } = await supabase
      .from("beneficiaries")
      .select("*")
      .eq("id", beneficiary_id)
      .single();
    if (bErr || !b) throw new Error("Beneficiary not found");

    // Studio guard: never generate if dignity floor breached
    if ((b.avatar_dignity_level ?? 5) < 3) {
      throw new Error("Dignity level below threshold (3) — generation blocked");
    }

    // Studio guard: locked avatars cannot regenerate without explicit unlock
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

    // Mark pending immediately
    await supabase.from("beneficiaries").update({
      avatar_status: mode === "preview" ? "pending" : b.avatar_status,
    }).eq("id", beneficiary_id);

    // Fire-and-forget heavy work
    const work = (async () => {
      try {
        const traits = inferAvatarTraits(b);
        const basePrompt = buildAvatarPrompt(traits);
        // Anti-cache nonce: ensures each generation is unique even with identical attributes,
        // and that attribute changes never collide with a Gemini internal cache.
        const nonce = `${traits.avatar_seed}-${Date.now()}`;
        const prompt = `${basePrompt}\n[render-token: ${nonce}]`;

        // Persist inferred traits + prompt + seed
        const traitsUpdate: Record<string, any> = {
          ...traits,
          avatar_prompt: prompt,
          avatar_seed: traits.avatar_seed,
          avatar_generated_at: new Date().toISOString(),
        };

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
          return;
        }

        // FINAL mode: Pro + QA scoring
        const { best, attempts } = await runFinalPipeline(supabase, traits, prompt);
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
          // Preserve approved/locked workflow status; otherwise transition to "generated"
          const nextWorkflow =
            b.avatar_workflow_status === "approved" || b.avatar_workflow_status === "locked"
              ? b.avatar_workflow_status
              : "generated";
          await supabase.from("beneficiaries").update({
            ...traitsUpdate,
            avatar_url: url,
            avatar_status: "validated",
            avatar_workflow_status: nextWorkflow,
            avatar_model_used: MODEL_FINAL,
            avatar_qa_report: { scores: qa.scores, notes: qa.notes, attempts: attempts.length },
            avatar_qa_score: qa.global_score,
          }).eq("id", beneficiary_id);
          // Archive final version under immutable URL
          await supabase.from("avatar_versions").insert({
            beneficiary_id,
            image_url: vu.publicUrl,
            model_used: MODEL_FINAL,
            qa_score: qa.global_score,
            qa_report: { scores: qa.scores, notes: qa.notes },
            seed: traits.avatar_seed,
            prompt,
          });
        } else {
          // Rejected — store in rejected/ for audit, keep avatar_url untouched
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

    return new Response(JSON.stringify({ accepted: true, mode }), {
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
