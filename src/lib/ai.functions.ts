import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PROMPTS: Record<string, string> = {
  "video-summarizer":
    "You summarize video transcripts. Output: a 2-sentence TL;DR, then 'Key points' (5-8 bullets), then 'Chapters' with timestamps ONLY if timestamps exist in the source. Use plain text with '-' bullets.",
  "youtube-title-generator":
    "You are a YouTube growth strategist. From the topic/transcript, output: 'Titles' (8 options under 70 chars, varied styles), 'Hooks' (3 opening lines), 'Description' (SEO-friendly, 150-250 words, with a CTA), and 'Tags' (15 comma-separated). Plain text.",
  "content-repurposer":
    "You repurpose long content. Output these sections: 'LinkedIn post', 'X / Twitter thread' (5 posts), 'Instagram caption' (with hashtags), 'Newsletter draft' (subject line + body). Match the original voice. Plain text.",
  "product-description-generator":
    "You write benefit-led ecommerce copy. Output: 'Headline', 'Description' (80-150 words), 'Feature bullets' (5), and a 'Short version' (1 sentence). Use the requested tone. Never invent specifications not given. Plain text.",
  "screenshot-to-guide":
    "You turn screenshots and notes into a clear step-by-step guide. Output: a title, a 1-line purpose, numbered steps (one per screenshot, in order, with what to click/see), tips, and a short SOP summary. Only describe what is visible or stated; mark uncertain steps with '(verify)'. Plain text.",
  "demo-script-generator":
    "You write product demo scripts. Output: 'Demo outline', 'Scenes' (numbered, each with on-screen action and narration), and a 'Closing CTA'. Keep it tight (under 3 minutes spoken). Do not claim you visited any URL. Plain text.",
};

export const runAiTool = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        tool: z.string(),
        input: z.string().min(3).max(40000),
        images: z.array(z.string().startsWith("data:image/")).max(10).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const prompt = PROMPTS[data.tool];
    if (!prompt) throw new Error("Unknown tool");
    const { generateText } = await import("./ai.server");
    const content = [
      { type: "text" as const, text: data.input },
      ...(data.images ?? []).map((image) => ({ type: "image" as const, image })),
    ];
    const text = await generateText(prompt, [{ role: "user", content }]);
    return { text };
  });

export const runVoiceover = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().min(1).max(4000), voice: z.string().max(30) }).parse(d))
  .handler(async ({ data }) => {
    const { speak } = await import("./ai.server");
    return speak(data.text, data.voice);
  });

export const runTranscribe = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ audio: z.string().max(34_000_000), mime: z.string().max(100), name: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { transcribe } = await import("./ai.server");
    return { text: await transcribe(data.audio, data.mime, data.name) };
  });
