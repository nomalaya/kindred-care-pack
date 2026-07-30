// sync
// QA scoring for generated avatars
// Uses gemini-2.5-flash vision with structured tool calling
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MODEL_QA } from "../_shared/avatarArtDirection.ts";
import { chatCompletion, usingGoogleDirect } from "../_shared/imageProvider.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WEIGHTS: Record<string, number> = {
  single_face: 1.3,
  framing: 1.0,
  framing_fill: 1.4, // the subject must fill the square, bust bleeding out of the bottom edge
  no_watermark: 1.0,
  artifact_freedom: 1.2,
  style_match: 2.0, // hand-drawn semi-realistic cartoon illustration — hard requirement
  background_quality: 1.0, // soft blurred contextual illustrated background
  anonymity: 1.8, // must NOT resemble a real identifiable person
  not_caricature: 1.5,
  dignity: 1.5,
  human_warmth: 1.0,
  bust_completeness: 0.8, // lowered: was forcing the model to draw a hard closing line under the bust
};

// Hard fail (force rejection) if any of these dimensions falls below threshold,
// regardless of the global weighted score.
const HARD_FAIL_THRESHOLDS: Record<string, number> = {
  style_match: 70,
  // Only a clear "fail"/"critical" verdict blocks: judge models routinely claim a
  // vague resemblance to some actor on perfectly generic faces, and each false
  // rejection costs a full regeneration.
  anonymity: 50,
  bust_completeness: 55,
  framing_fill: 55,
};


function weightedScore(scores: Record<string, number>): number {
  let total = 0, wsum = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) {
    const s = scores[k];
    if (typeof s === "number") {
      total += s * w;
      wsum += w;
    }
  }
  return wsum > 0 ? Math.round(total / wsum) : 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { image_url, image_base64, transformative_traits } = await req.json();
    const imgUrl = image_url ?? (image_base64 ? `data:image/png;base64,${image_base64}` : null);
    if (!imgUrl) throw new Error("image_url or image_base64 required");
    const transforms: string[] = Array.isArray(transformative_traits) ? transformative_traits : [];

    if (!usingGoogleDirect() && !Deno.env.get("LOVABLE_API_KEY")) {
      throw new Error("No AI provider configured (GOOGLE_AI_API_KEY or LOVABLE_API_KEY)");
    }


    const transformNotice = transforms.length
      ? `
TRANSFORMATIVE EDIT IN PROGRESS — the following attributes were intentionally changed: ${transforms.join(", ")}.
For these attributes, the subject is the SAME person transformed (not a different person):
- avatar_body_type: allow facial fullness, cheek softness, neck/shoulder width, bust width and garment drape to change naturally.
- avatar_age_range: allow age signs (fine lines, skin tone, hair density) to evolve.
- avatar_expression: allow facial musculature (mouth, brows, eyes) to shift with the expression.
- avatar_fatigue_level / avatar_tired_level: allow subtle tiredness signs.
Do NOT penalise identity for these natural transformations. Only penalise if the result clearly looks like a different person (different bone structure, different nose identity, different mouth identity, different eye shape, different hairstyle silhouette).`
      : "";

    const systemPrompt = `You are a strict QA reviewer for an NGO beneficiary portrait catalog.
For each of the 12 dimensions you must return ONE verdict among:
- "excellent" — the dimension is fully satisfied, nothing to fix.
- "good" — satisfied, only a negligible nitpick.
- "borderline" — a real but minor issue that a reviewer might accept.
- "fail" — the requirement is clearly not met.
- "critical" — a blocking defect for publication.
Judge each dimension independently and only against its own definition below.
Do NOT hedge: if your own note about a dimension is positive, the verdict MUST be "excellent" or "good".
Add a short note for every dimension rated "borderline", "fail" or "critical".${transformNotice}`;

    const userPrompt = `Review this avatar. Respond ONLY via the tool call.

Dimensions (return a verdict for each):
- single_face: exactly ONE character face fully visible? (0 = multiple faces or no face)
- framing: the portrait shows head + neck + shoulders + UPPER BUST with the garment fully drawn, cropped just below the upper-bust line. The upper bust IS expected to be visible — do NOT penalise that. Score 0 ONLY if: full torso visible, waist visible, mid-chest or ribcage visible, hips visible, full-length arms hanging, deep cleavage, exposed chest skin beyond a normal neckline, shoulders cropped, or subject not centered.
- framing_fill: the subject FILLS the square canvas. Required: the bust reaches and is cut off by the BOTTOM edge of the image (no white band under the bust), the shoulders reach the left and right edges or come very close to them, and only a thin white band (about 5% or less) remains above the hair. Rate "excellent"/"good" when the subject is large and cut off at the bottom edge. Rate "fail"/"critical" whenever: there is any visible white gap or white band between the bust and the bottom edge, the subject looks small or distant, the subject floats inside a large white area, or wide white margins surround the subject on all sides. Being cropped by the canvas edges is REQUIRED and must NEVER be penalised here.

- no_watermark: free of any text, watermark, logo, signature?
- artifact_freedom: free of AI artifacts (warped features, melted shapes, extra fingers)?
- style_match: a HAND-DRAWN editorial illustration — thin readable ink contour lines, soft smooth shading with a subtle pencil grain, hair drawn as soft masses with a few visible drawn strands, gently textured fabric, warm desaturated palette, realistic human proportions, clearly non-photographic. Score 90-100 when the image matches that description. Score "fail"/"critical" for: flat vector illustration, smooth gradient corporate/vector look with no drawn line texture (Storyset/unDraw/Notion style), photograph, photorealistic, 3D/Pixar/Disney render, anime, manga, chibi, comic book, oil painting, or heavy saturated painterly watercolor. Visible fine ink lines and light pencil grain are REQUIRED and must never be penalised.
- background_quality: the background MUST be a pure, plain, perfectly uniform WHITE background (#FFFFFF), full-bleed to all four edges, with the subject cleanly isolated on it. Score 95-100 for a clean flat white background. Score low ONLY for: colored or gradient backgrounds, halo/glow/shadow behind the subject, textures, patterns, decorative shapes, or any drawn scene behind the subject. A plain white background is the REQUIRED result — never penalise it.
- anonymity: a GENERIC archetypal character. Rate "excellent"/"good" for any ordinary invented face. Only rate "fail"/"critical" if the image is an unmistakable portrait of a specific named celebrity or public figure (recognisable at a glance by anyone). A faint, generic or "reminds me of" resemblance to an actor is NOT a violation — illustrated human faces naturally look somewhat familiar. Do not name actors speculatively.
- not_caricature: free of cultural caricature, stereotypes, exaggeration?
- dignity: portrayed with dignity and humanity, no misery, no pathos?
- human_warmth: emotionally credible, warm, kind (not commercial smile, not cold)?
- bust_completeness: shoulders and upper bust fully drawn, garment opaque, body NOT dissolving. Rate "excellent"/"good" whenever the shoulders and upper bust are complete and opaque — the shape of the bottom crop is IRRELEVANT: a curved, rounded, arched or slightly soft bottom crop line is perfectly acceptable and MUST NOT be penalised. Only rate "fail"/"critical" if: the body dissolves or fades into white, watercolor fade-out, circular crop of the whole subject, vignette mask over the body, shoulders cropped or unfinished, clothing transparent at the bottom, or the upper bust is missing/incomplete. Do NOT penalise simply because the upper bust is visible — that is the required composition.`;

    const aiData = await chatCompletion({
      model: MODEL_QA,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: imgUrl } },
          ],
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "submit_qa_scores",
          description: "Submit a per-dimension verdict and notes for the avatar.",
          parameters: {
            type: "object",
            properties: {
              verdicts: {
                type: "object",
                properties: Object.fromEntries(
                  Object.keys(WEIGHTS).map(k => [k, {
                    type: "string",
                    enum: ["excellent", "good", "borderline", "fail", "critical"],
                  }]),
                ),
                required: Object.keys(WEIGHTS),
                additionalProperties: false,
              },
              notes: { type: "array", items: { type: "string" } },
            },
            required: ["verdicts", "notes"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "submit_qa_scores" } },
    });

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No QA tool call returned");
    const args = JSON.parse(toolCall.function.arguments);
    const notes: string[] = args.notes ?? [];

    // Verdicts are mapped to numbers server-side: judge models systematically
    // compress free numeric scales toward the middle of the range.
    const VERDICT_SCORES: Record<string, number> = {
      excellent: 97, good: 88, borderline: 65, fail: 35, critical: 0,
    };
    const rawVerdicts: Record<string, string> = args.verdicts ?? {};
    const scores: Record<string, number> = {};
    for (const k of Object.keys(WEIGHTS)) {
      const v = rawVerdicts[k];
      if (typeof v === "string" && v in VERDICT_SCORES) scores[k] = VERDICT_SCORES[v];
      else if (typeof (args.scores ?? {})[k] === "number") scores[k] = args.scores[k];
    }
    let global = weightedScore(scores);


    // Hard-fail: any blocking dimension below its threshold forces a sub-pass global score
    for (const [k, threshold] of Object.entries(HARD_FAIL_THRESHOLDS)) {
      const s = scores[k];
      if (typeof s === "number" && s < threshold) {
        notes.unshift(`HARD FAIL on ${k}: ${s} < ${threshold}`);
        global = Math.min(global, 40);
      }
    }

    return new Response(
      JSON.stringify({ scores, notes, global_score: global }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("qa-avatar error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
