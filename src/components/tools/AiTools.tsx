import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, X } from "lucide-react";
import { runAiTool, runTranscribe, runVoiceover } from "@/lib/ai.functions";
import { Btn, CopyBtn, DownloadBtn, Dropzone, ErrorNote, Field, Panel, download, inputCls, loadImage } from "./ui";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong. Please try again.");

function Output({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="grid gap-3 rounded-2xl border bg-muted/50 p-5">
      <div className="flex justify-between gap-2"><span className="flex items-center gap-2 font-display font-bold text-primary"><Sparkles className="h-4 w-4" /> Result</span><CopyBtn text={text} /></div>
      <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{text}</div>
    </div>
  );
}

type FieldDef = { key: string; label: string; type?: "textarea" | "select"; options?: string[]; placeholder?: string };
const CONFIG: Record<string, { fields: FieldDef[]; cta: string }> = {
  "video-summarizer": { cta: "Summarize", fields: [{ key: "Transcript", label: "Paste the video transcript", type: "textarea", placeholder: "Paste a transcript (with timestamps if you have them)…" }, { key: "Length", label: "Summary length", type: "select", options: ["Short", "Medium", "Detailed"] }] },
  "youtube-title-generator": { cta: "Generate titles", fields: [{ key: "Topic or transcript", label: "What's your video about?", type: "textarea", placeholder: "e.g. I tested 5 budget mics for podcasting…" }, { key: "Audience", label: "Who is it for?", placeholder: "Beginner podcasters" }, { key: "Style", label: "Style", type: "select", options: ["Curiosity", "How-to", "Listicle", "Bold & punchy"] }] },
  "content-repurposer": { cta: "Repurpose", fields: [{ key: "Source content", label: "Paste your blog post or transcript", type: "textarea" }, { key: "Voice", label: "Voice", type: "select", options: ["Same as original", "Professional", "Casual", "Witty"] }] },
  "product-description-generator": { cta: "Write description", fields: [{ key: "Product name", label: "Product name", placeholder: "Aurora ceramic mug" }, { key: "Details", label: "Key details & features", type: "textarea", placeholder: "350ml, handmade, dishwasher safe…" }, { key: "Audience", label: "Ideal customer", placeholder: "Coffee lovers who like slow mornings" }, { key: "Tone", label: "Tone", type: "select", options: ["Warm", "Luxury", "Playful", "Technical", "Minimal"] }] },
  "demo-script-generator": { cta: "Write demo script", fields: [{ key: "Product", label: "Product name & what it does", type: "textarea", placeholder: "Marvedge turns product walkthroughs into interactive demos…" }, { key: "Key features", label: "Features to show", type: "textarea" }, { key: "Audience", label: "Who's watching?", placeholder: "Sales leaders at B2B SaaS companies" }, { key: "Length", label: "Length", type: "select", options: ["60 seconds", "2 minutes", "3 minutes"] }] },
};

export function AiTextTool({ slug }: { slug: string }) {
  const cfg = CONFIG[slug]!;
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(cfg.fields.map((f) => [f.key, f.options?.[0] ?? ""])));
  const [out, setOut] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const run = useServerFn(runAiTool);
  const go = async () => {
    setBusy(true); setErr(null);
    try { setOut((await run({ data: { tool: slug, input: cfg.fields.map((f) => `${f.key}: ${vals[f.key]}`).join("\n\n") } })).text); }
    catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };
  const ready = cfg.fields.filter((f) => f.type === "textarea" || !f.options).some((f) => (vals[f.key] ?? "").trim().length > 2);
  return (
    <Panel>
      <div className="grid gap-4 md:grid-cols-2">
        {cfg.fields.map((f) => (
          <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
            <Field label={f.label}>
              {f.type === "textarea" ? <textarea rows={6} className={inputCls} placeholder={f.placeholder} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
                : f.type === "select" ? <select className={inputCls} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
                : <input className={inputCls} placeholder={f.placeholder} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />}
            </Field>
          </div>
        ))}
      </div>
      <div><Btn busy={busy} disabled={!ready} onClick={go}><Sparkles className="h-4 w-4" />{busy ? "Thinking…" : cfg.cta}</Btn></div>
      <ErrorNote msg={err} />
      <Output text={out} />
    </Panel>
  );
}

/* ---------- Screenshot to Guide ---------- */
async function toDataUrl(f: File) {
  const img = await loadImage(f);
  const s = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas"); c.width = img.naturalWidth * s; c.height = img.naturalHeight * s;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}
export function ScreenshotGuide() {
  const [shots, setShots] = useState<{ url: string; note: string }[]>([]);
  const [title, setTitle] = useState("");
  const [out, setOut] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const run = useServerFn(runAiTool);
  const add = async (fs: File[]) => { const n = await Promise.all(fs.slice(0, 10 - shots.length).map(toDataUrl)); setShots((s) => [...s, ...n.map((url) => ({ url, note: "" }))]); };
  const go = async () => {
    setBusy(true); setErr(null);
    const input = `Guide topic: ${title || "(infer from screenshots)"}\n\n` + shots.map((s, i) => `Screenshot ${i + 1} note: ${s.note || "(none)"}`).join("\n");
    try { setOut((await run({ data: { tool: "screenshot-to-guide", input, images: shots.map((s) => s.url) } })).text); } catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };
  return (
    <Panel>
      <Field label="What is this guide for?"><input className={inputCls} placeholder="How to invite a teammate" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      {shots.length < 10 && <Dropzone accept="image/*" multiple label="Drop screenshots in order (up to 10)" onFiles={add} />}
      {shots.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((s, i) => (
            <div key={i} className="relative grid gap-2 rounded-2xl border p-3">
              <span className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <button onClick={() => setShots(shots.filter((_, j) => j !== i))} className="absolute right-2 top-2 rounded-full bg-background p-1 shadow-soft"><X className="h-3 w-3" /></button>
              <img src={s.url} alt="" className="h-32 w-full rounded-lg object-cover" />
              <input className={inputCls} placeholder="Optional note: what happens here?" value={s.note} onChange={(e) => setShots(shots.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
            </div>
          ))}
        </div>
      )}
      <div><Btn busy={busy} disabled={!shots.length} onClick={go}><Sparkles className="h-4 w-4" />{busy ? "Writing guide…" : "Generate guide"}</Btn></div>
      <ErrorNote msg={err} />
      <Output text={out} />
      {out && <p className="text-xs text-muted-foreground">Always review AI-written steps before sharing.</p>}
    </Panel>
  );
}

/* ---------- Subtitles ---------- */
const ts = (s: number, sep: string) => { const d = new Date(s * 1000).toISOString().slice(11, 23); return sep === "," ? d.replace(".", ",") : d; };
function buildCues(text: string, dur: number) {
  const parts = text.replace(/\s+/g, " ").match(/[^.!?,;]+[.!?,;]*/g)?.flatMap((p) => { const w = p.trim().split(" "); const out = []; for (let i = 0; i < w.length; i += 9) out.push(w.slice(i, i + 9).join(" ")); return out; }).filter(Boolean) ?? [];
  const total = parts.reduce((a, p) => a + p.length, 0) || 1; let t = 0;
  return parts.map((p) => { const len = (p.length / total) * dur; const c = { start: t, end: t + len, text: p }; t += len; return c; });
}
const fileToB64 = (f: File) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1] ?? ""); r.readAsDataURL(f); });
export function SubtitleGenerator() {
  const [cues, setCues] = useState<{ start: number; end: number; text: string }[]>([]);
  const [url, setUrl] = useState(""); const [isVideo, setIsVideo] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const run = useServerFn(runTranscribe);
  const pick = async (f?: File) => {
    if (!f) return; setErr(null); setCues([]);
    if (f.size > 24 * 1024 * 1024) return setErr("Please use a file under 24 MB (trim long recordings first).");
    const u = URL.createObjectURL(f); setUrl(u); setIsVideo(f.type.startsWith("video"));
    const dur = await new Promise<number>((res) => { const m = document.createElement(f.type.startsWith("video") ? "video" : "audio"); m.onloadedmetadata = () => res(m.duration || 60); m.onerror = () => res(60); m.src = u; });
    setBusy(true);
    try { const { text } = await run({ data: { audio: await fileToB64(f), mime: f.type || "audio/mpeg", name: f.name } }); if (!text.trim()) throw new Error("No speech was detected in that file."); setCues(buildCues(text, dur)); }
    catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };
  const srt = () => cues.map((c, i) => `${i + 1}\n${ts(c.start, ",")} --> ${ts(c.end, ",")}\n${c.text}\n`).join("\n");
  const vtt = () => "WEBVTT\n\n" + cues.map((c) => `${ts(c.start, ".")} --> ${ts(c.end, ".")}\n${c.text}\n`).join("\n");
  return (
    <Panel>
      <Dropzone accept="audio/*,video/mp4,video/webm,video/quicktime" label={busy ? "Transcribing… this can take a minute" : "Drop an audio or video file (under 24 MB)"} onFiles={([f]) => pick(f)} />
      <ErrorNote msg={err} />
      {url && (isVideo ? <video src={url} controls className="max-h-72 rounded-2xl" /> : <audio src={url} controls className="w-full" />)}
      {cues.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">Timings are estimated from the length of each line — nudge them below if needed.</p>
          <div className="grid max-h-[480px] gap-2 overflow-y-auto pr-1">
            {cues.map((c, i) => (
              <div key={i} className="grid grid-cols-[70px_70px_1fr] gap-2">
                <input className={inputCls} type="number" step={0.1} value={c.start.toFixed(1)} onChange={(e) => setCues(cues.map((x, j) => (j === i ? { ...x, start: +e.target.value } : x)))} />
                <input className={inputCls} type="number" step={0.1} value={c.end.toFixed(1)} onChange={(e) => setCues(cues.map((x, j) => (j === i ? { ...x, end: +e.target.value } : x)))} />
                <input className={inputCls} value={c.text} onChange={(e) => setCues(cues.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <DownloadBtn onClick={() => download(new Blob([srt()], { type: "text/plain" }), "subtitles.srt")}>Download SRT</DownloadBtn>
            <Btn variant="ghost" onClick={() => download(new Blob([vtt()], { type: "text/vtt" }), "subtitles.vtt")}>Download VTT</Btn>
            <CopyBtn text={cues.map((c) => c.text).join(" ")} />
          </div>
        </>
      )}
    </Panel>
  );
}

/* ---------- Voiceover ---------- */
const VOICES = [["Kore", "Firm & clear"], ["Puck", "Upbeat"], ["Charon", "Informative"], ["Aoede", "Breezy"], ["Fenrir", "Excitable"], ["Leda", "Youthful"]];
export function VoiceoverGenerator() {
  const [text, setText] = useState("Welcome to Marvedge. In the next sixty seconds, I'll show you how to turn any product into a demo that sells itself.");
  const [voice, setVoice] = useState("Kore"); const [style, setStyle] = useState("");
  const [audio, setAudio] = useState<{ url: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const run = useServerFn(runVoiceover);
  const go = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await run({ data: { text: style ? `Say ${style}: ${text}` : text, voice } });
      const blob = new Blob([Uint8Array.from(atob(r.audio), (c) => c.charCodeAt(0))], { type: r.type });
      setAudio({ blob, url: URL.createObjectURL(blob) });
    } catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };
  return (
    <Panel>
      <Field label={`Script (${text.length}/4000)`}><textarea rows={6} maxLength={4000} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <Field label="Voice">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VOICES.map(([v, d]) => (
            <button key={v} onClick={() => setVoice(v ?? "Kore")} className={`rounded-2xl border p-3 text-left ${voice === v ? "border-primary bg-secondary" : "hover:bg-muted"}`}>
              <p className="font-bold">{v}</p><p className="text-xs text-muted-foreground">{d}</p>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Delivery (optional)"><input className={inputCls} placeholder="warmly, with energy" value={style} onChange={(e) => setStyle(e.target.value)} /></Field>
      <div><Btn busy={busy} disabled={!text.trim()} onClick={go}><Sparkles className="h-4 w-4" />{busy ? "Recording…" : "Generate voiceover"}</Btn></div>
      <ErrorNote msg={err} />
      {audio && <div className="flex flex-wrap items-center gap-3"><audio src={audio.url} controls autoPlay className="flex-1" /><DownloadBtn onClick={() => download(audio.blob, "voiceover.wav")} /></div>}
    </Panel>
  );
}
