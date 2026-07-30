// sync
/**
 * Provider routing for avatar image generation and QA scoring.
 *
 * If GOOGLE_AI_API_KEY is configured, all calls go DIRECTLY to the Google
 * Generative Language API (billed on the customer's own Google AI Studio
 * account, zero Lovable credits).
 *
 * If it is absent, everything falls back to the Lovable AI Gateway exactly as
 * before — no behaviour change.
 *
 * Prompts, models and image formats are unchanged: the same Gemini image
 * models are used on both routes.
 */

const GOOGLE_KEY = Deno.env.get("GOOGLE_AI_API_KEY") ?? "";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

const GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta";
const LOVABLE_CHAT = "https://ai.gateway.lovable.dev/v1/chat/completions";

/** Last-resort image model on AI Studio keys (Nano Banana). */
const GOOGLE_IMAGE_FALLBACK = Deno.env.get("GOOGLE_IMAGE_MODEL") ?? "gemini-2.5-flash-image";

/**
 * Gateway model ids -> Google AI Studio model ids.
 * AI Studio does not expose the gateway's "-preview" image aliases, and the
 * legacy 2.5 text ids are closed to new API keys, so map them explicitly.
 */
const GOOGLE_MODEL_MAP: Record<string, string> = {
  "gemini-3.1-flash-image-preview": GOOGLE_IMAGE_FALLBACK,
  "gemini-3.1-flash-image": GOOGLE_IMAGE_FALLBACK,
  "gemini-2.5-flash": "gemini-flash-latest",
  "gemini-2.5-flash-lite": "gemini-flash-lite-latest",
  "gemini-2.5-pro": "gemini-pro-latest",
};

export function usingGoogleDirect(): boolean {
  return GOOGLE_KEY.length > 0;
}

/** "google/gemini-2.5-flash" -> "gemini-flash-latest" */
function toGoogleModel(model: string): string {
  const bare = model.replace(/^google\//, "");
  return GOOGLE_MODEL_MAP[bare] ?? bare;
}


function providerError(status: number, body: string, label: string): Error {
  const err: any = new Error(`${label} ${status}: ${body}`);
  err.gatewayStatus = status;
  if (status === 402) err.code = "no_credits";
  else if (status === 429) err.code = "rate_limited";
  return err;
}

/**
 * Retries transient provider failures (503 overload, 429 rate limit, network
 * errors) with exponential backoff. Permanent errors are returned as-is.
 */
const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [4000, 10000, 20000];

async function callWithRetry(fn: () => Promise<Response>): Promise<Response> {
  let last: Response | null = null;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      const wait = RETRY_DELAYS_MS[attempt - 1];
      console.warn(`[imageProvider] transient provider error, retry ${attempt} in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
    try {
      last = await fn();
    } catch (e) {
      if (attempt === RETRY_DELAYS_MS.length) throw e;
      continue;
    }
    if (!RETRY_STATUS.has(last.status)) return last;
  }
  return last!;
}

function b64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function splitDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/s);
  if (!m) return { mimeType: "image/png", data: dataUrl };
  return { mimeType: m[1], data: m[2] };
}

// ---------------------------------------------------------------- Google direct

async function googleGenerateContent(
  model: string,
  prompt: string,
  sourceDataUrl?: string,
): Promise<Uint8Array> {
  const parts: any[] = [{ text: prompt }];
  if (sourceDataUrl) {
    const { mimeType, data } = splitDataUrl(sourceDataUrl);
    parts.push({ inlineData: { mimeType, data } });
  }

  const call = async (m: string) => {
    const resp = await fetch(
      `${GOOGLE_BASE}/models/${m}:generateContent?key=${encodeURIComponent(GOOGLE_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      },
    );
    return resp;
  };

  let resp = await callWithRetry(() => call(toGoogleModel(model)));
  if (resp.status === 404 && toGoogleModel(model) !== GOOGLE_IMAGE_FALLBACK) {
    // Model id not exposed on this AI Studio key — retry on the stable one.
    console.warn(`[imageProvider] model ${model} unavailable on Google direct, falling back to ${GOOGLE_IMAGE_FALLBACK}`);
    resp = await callWithRetry(() => call(GOOGLE_IMAGE_FALLBACK));
  }
  if (!resp.ok) {
    throw providerError(resp.status, await resp.text(), "Google AI");
  }

  const data = await resp.json();
  const candidateParts = data?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = candidateParts.find((p: any) => p?.inlineData?.data || p?.inline_data?.data);
  const b64 = imagePart?.inlineData?.data ?? imagePart?.inline_data?.data;
  if (!b64) throw new Error("No image returned (Google direct)");
  return b64ToBytes(b64);
}

// --------------------------------------------------------------- Lovable gateway

async function lovableGenerate(
  model: string,
  prompt: string,
  sourceDataUrl?: string,
): Promise<Uint8Array> {
  const content = sourceDataUrl
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: sourceDataUrl } },
      ]
    : prompt;

  const resp = await fetch(LOVABLE_CHAT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      modalities: ["image", "text"],
    }),
  });
  if (!resp.ok) {
    throw providerError(resp.status, await resp.text(), "AI gateway");
  }
  const data = await resp.json();
  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("No image returned");
  return b64ToBytes(url.replace(/^data:image\/\w+;base64,/, ""));
}

// ---------------------------------------------------------------- Public API

/**
 * Text-to-image, or image-to-image when `sourceDataUrl` is provided.
 * Returns raw PNG bytes, identical shape on both routes.
 */
export async function generateAvatarImage(
  prompt: string,
  model: string,
  sourceDataUrl?: string,
): Promise<Uint8Array> {
  if (usingGoogleDirect()) return googleGenerateContent(model, prompt, sourceDataUrl);
  return lovableGenerate(model, prompt, sourceDataUrl);
}

/**
 * OpenAI-compatible chat completion (used by QA scoring with tool calling).
 * Google exposes an OpenAI-compatible endpoint, so the request/response shape
 * is the same on both routes.
 */
export async function chatCompletion(body: Record<string, unknown>): Promise<any> {
  if (usingGoogleDirect()) {
    const model = toGoogleModel(String(body.model ?? ""));
    const resp = await callWithRetry(() =>
      fetch(`${GOOGLE_BASE}/openai/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GOOGLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body, model }),
      })
    );
    if (!resp.ok) throw providerError(resp.status, await resp.text(), "Google AI");
    return resp.json();
  }

  const resp = await fetch(LOVABLE_CHAT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw providerError(resp.status, await resp.text(), "AI gateway");
  return resp.json();
}
