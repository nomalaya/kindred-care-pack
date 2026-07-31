// sync
/**
 * Eye-line measurement.
 *
 * The silhouette cannot tell us where the eyes are: hair volume (afro), baldness,
 * head coverings (veil, hat, hood) and beards all move the top of the shape by
 * 10+ points. Anchoring on the hair top was therefore unstable across the
 * catalog. We measure the eye line directly with a vision model instead, through
 * the same provider route as QA (Google AI Studio when GOOGLE_AI_API_KEY is set
 * => zero Lovable credit), with a strict structured tool call.
 *
 * The result is cached on the beneficiary row, so an unchanged image is never
 * measured twice.
 */
import { chatCompletion } from "./imageProvider.ts";
import { MODEL_QA } from "./avatarArtDirection.ts";

export type EyeMeasure = {
  /** Eye line, in % of the image height (0..1). */
  eyeY: number;
  /** Horizontal center of the face, in % of the image width (0..1). */
  centerX: number;
};

export function toDataUrl(bytes: Uint8Array, mime = "image/png"): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${mime};base64,${btoa(bin)}`;
}

/**
 * Returns the normalized eye line + face center, or null when the measurement
 * is unavailable/implausible. Never throws: callers must treat null as
 * "do not recrop".
 */
export async function measureEyeLine(imageUrlOrDataUrl: string): Promise<EyeMeasure | null> {
  try {
    const data = await chatCompletion({
      model: MODEL_QA,
      messages: [
        {
          role: "system",
          content:
            "You are a precise image measurement tool. You return normalized coordinates only, via the tool call.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Measure this portrait illustration.\n" +
                "- eye_y: vertical position of the CENTER OF THE EYES (midpoint between both pupils), " +
                "as a fraction of the image HEIGHT, 0 = top edge, 1 = bottom edge.\n" +
                "- face_center_x: horizontal center of the FACE (midpoint between the eyes), as a " +
                "fraction of the image WIDTH, 0 = left edge, 1 = right edge.\n" +
                "Use 3 decimals. Do not describe the image. Respond ONLY via the tool call.",
            },
            { type: "image_url", image_url: { url: imageUrlOrDataUrl } },
          ],
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "submit_eye_measure",
          description: "Submit the normalized eye line and face center of the portrait.",
          parameters: {
            type: "object",
            properties: {
              eye_y: { type: "number" },
              face_center_x: { type: "number" },
            },
            required: ["eye_y", "face_center_x"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "submit_eye_measure" } },
    });

    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return null;
    const args = JSON.parse(call.function.arguments ?? "{}");
    const eyeY = Number(args.eye_y);
    const centerX = Number(args.face_center_x);
    // Plausibility guard: a portrait's eyes are never in the top 5 % or the
    // bottom third of the frame, and the face is never off-canvas.
    if (!isFinite(eyeY) || !isFinite(centerX)) return null;
    if (eyeY < 0.05 || eyeY > 0.7) return null;
    if (centerX < 0.15 || centerX > 0.85) return null;
    return { eyeY, centerX };
  } catch (e) {
    console.error("[avatarEyeLine] measurement failed:", (e as Error).message);
    return null;
  }
}
