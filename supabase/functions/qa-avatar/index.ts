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
  anonymity: 70,
  bust_completeness: 55,
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
You must score the image on 11 dimensions, each from 0 (terrible) to 100 (excellent).
Be honest and discriminating — do not inflate scores. Score 50-70 for borderline issues.
Return concise notes explaining any score below 80.${transformNotice}`;

    const userPrompt = `Score this avatar. Respond ONLY via the tool call.

Dimensions (0=terrible, 100=excellent):
- single_face: exactly ONE character face fully visible? (0 = multiple faces or no face)
- framing: the portrait shows head + neck + shoulders + UPPER BUST with the garment fully drawn, cropped just below the upper-bust line. The upper bust IS expected to be visible — do NOT penalise that. Score 0 ONLY if: full torso visible, waist visible, mid-chest or ribcage visible, hips visible, full-length arms hanging, deep cleavage, exposed chest skin beyond a normal neckline, shoulders cropped, or subject not centered.
- no_watermark: free of any text, watermark, logo, signature?
- artifact_freedom: free of AI artifacts (warped features, melted shapes, extra fingers)?
- style_match: STRICTLY a hand-drawn semi-realistic cartoon illustration in editorial storybook style (fine soft ink outlines, colored-pencil + light watercolor shading, warm desaturated palette, realistic human proportions, clearly non-photographic). Score 0 if: photograph, photorealistic, 3D/Pixar/Disney render, flat vector sticker (Storyset/unDraw/Notion style), anime, manga, chibi, comic book, oil painting, heavy saturated watercolor.
- background_quality: soft, gently BLURRED contextual illustrated background (interior, kitchen, street, etc.) coherent with the subject, in the same hand-drawn style. Score 0 for pure white studio backgrounds, sharp detailed scenes, or busy/cluttered backgrounds.
- anonymity: a GENERIC archetypal character that does NOT resemble any real identifiable person, celebrity or public figure? Score 0 if it looks like a specific real person.
- not_caricature: free of cultural caricature, stereotypes, exaggeration?
- dignity: portrayed with dignity and humanity, no misery, no pathos?
- human_warmth: emotionally credible, warm, kind (not commercial smile, not cold)?
- bust_completeness: the UPPER bust is drawn cleanly with a complete garment line and fully visible shoulders, and the canvas crops at a clean horizontal line just below the upper bust. Score HIGH (>=80) when shoulders + upper bust are fully drawn and the bottom crop is clean. Score 0 ONLY if: the body dissolves or fades into white, watercolor fade-out at the bottom, circular crop, vignette mask over the body, shoulders cropped or unfinished, clothing transparent at the bottom, or the upper bust itself is missing/incomplete. Do NOT penalise simply because the upper bust is visible — that is the required composition.`;

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
