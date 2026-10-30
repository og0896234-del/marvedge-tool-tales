import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const BASE = "https://ai.gateway.lovable.dev/v1";
const TEXT_MODEL = "openai/gpt-6-astra";
const TTS_MODEL = "google/gemini-3.1-flash-tts-preview";
const STT_MODEL = "openai/gpt-transcribe";

function key() {
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new Error("AI is not configured yet.");
  return k;
}

async function gatewayError(res: Response) {
  let msg = `AI request failed (${res.status})`;
  try {
    const j = (await res.json()) as { error?: { message?: string }; message?: string };
    msg = j.error?.message ?? j.message ?? msg;
  } catch {
    /* ignore */
  }
  if (res.status === 402) msg = "AI credits are used up. Please try again later.";
  if (res.status === 429) msg = "Too many requests right now — please wait a moment and try again.";
  return new Error(msg);
}

export async function generateText(instructions: string, messages: ModelMessage[]) {
  const apiKey = key();
  const provider = createOpenAI({
    baseURL: BASE,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(TEXT_MODEL),
    system: instructions,
    messages,
    maxRetries: 0,
    onError: ({ error }) => {
      failure = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  if (!text && failure) throw failure instanceof Error ? failure : new Error("AI request failed");
  return text;
}

export async function speak(text: string, voice: string) {
  const apiKey = key();
  const res = await fetch(`${BASE}/audio/speech`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: TTS_MODEL,
      contents: [{ role: "user", parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  });
  if (!res.ok) throw await gatewayError(res);
  const buf = new Uint8Array(await res.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { audio: btoa(bin), type: res.headers.get("content-type") ?? "audio/wav" };
}

export async function transcribe(base64: string, mime: string, name: string) {
  const apiKey = key();
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const form = new FormData();
  form.append("model", STT_MODEL);
  form.append("file", new Blob([bytes], { type: mime }), name);
  const res = await fetch(`${BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
    body: form,
  });
  if (!res.ok) throw await gatewayError(res);
  const j = (await res.json()) as { text?: string };
  return j.text ?? "";
}
