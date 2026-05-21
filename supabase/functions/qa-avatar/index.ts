// QA scoring for generated avatars
// Uses gemini-2.5-flash vision with structured tool calling
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MODEL_QA } from "../_shared/avatarArtDirection.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WEIGHTS: Record<string, number> = {
  single_face: 1.3,
  framing: 1.0,
  no_watermark: 1.0,
  artifact_freedom: 1.2,
  style_match: 2.0, // flat vector cartoon — hard requirement
  white_background: 1.2,
  anonymity: 1.8, // must NOT resemble a real identifiable person
  not_caricature: 1.5,
  dignity: 1.5,
  human_warmth: 1.0,
};

// Hard fail (force rejection) if any of these dimensions falls below threshold,
// regardless of the global weighted score.
const HARD_FAIL_THRESHOLDS: Record<string, number> = {
  style_match: 70,
  anonymity: 70,
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
    const { image_url, image_base64 } = await req.json();
    const imgUrl = image_url ?? (image_base64 ? `data:image/png;base64,${image_base64}` : null);
    if (!imgUrl) throw new Error("image_url or image_base64 required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a strict QA reviewer for an NGO beneficiary portrait catalog.
You must score the image on 9 dimensions, each from 0 (terrible) to 100 (excellent).
Be honest and discriminating — do not inflate scores. Score 50-70 for borderline issues.
Return concise notes explaining any score below 80.`;

    const userPrompt = `Score this avatar. Respond ONLY via the tool call.

Dimensions (0=terrible, 100=excellent):
- single_face: exactly ONE character face fully visible? (0 = multiple faces or no face)
- framing: chest-up bust, centered, ~70% frame coverage, proper margins?
- no_watermark: free of any text, watermark, logo, signature?
- artifact_freedom: free of AI artifacts (warped features, melted shapes, extra fingers)?
- style_match: STRICTLY flat vector cartoon illustration with clean bold outlines and flat cel-shaded colors (like Storyset / unDraw / Notion avatars)? Score 0 if photo, photorealistic, semi-realistic, painterly, watercolor, oil painting, 3D render, Pixar, Disney, anime or comic style.
- white_background: pure plain white uniform background, no gradient, no scene, no decoration?
- anonymity: a GENERIC archetypal character that does NOT resemble any real identifiable person, celebrity or public figure? Score 0 if it looks like a specific real person.
- not_caricature: free of cultural caricature, stereotypes, exaggeration?
- dignity: portrayed with dignity and humanity, no misery, no pathos?
- human_warmth: emotionally credible, warm, kind (not commercial smile, not cold)?`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
            description: "Submit per-dimension scores and notes for the avatar.",
            parameters: {
              type: "object",
              properties: {
                scores: {
                  type: "object",
                  properties: Object.fromEntries(
                    Object.keys(WEIGHTS).map(k => [k, { type: "number", minimum: 0, maximum: 100 }]),
                  ),
                  required: Object.keys(WEIGHTS),
                  additionalProperties: false,
                },
                notes: { type: "array", items: { type: "string" } },
              },
              required: ["scores", "notes"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_qa_scores" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      throw new Error(`QA AI error ${aiResp.status}: ${t}`);
    }
    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No QA tool call returned");
    const args = JSON.parse(toolCall.function.arguments);
    const scores = args.scores ?? {};
    const notes: string[] = args.notes ?? [];
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
