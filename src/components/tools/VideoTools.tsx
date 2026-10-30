import { useEffect, useRef, useState } from "react";
import gifenc from "gifenc";
const { GIFEncoder, quantize, applyPalette } = gifenc;
import { parseGIF, decompressFrames } from "gifuct-js";
import { loadSample } from "@/lib/samples";
import { Btn, Dropzone, DownloadBtn, ErrorNote, Field, Panel, baseName, download, fmtBytes, inputCls, rangeCls } from "./ui";

const seek = (v: HTMLVideoElement, t: number) =>
  new Promise<void>((res) => {
    if (Math.abs(v.currentTime - t) < 0.01 && v.readyState >= 2) return res();
    v.onseeked = () => res();
    v.currentTime = t;
  });

function useVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [dur, setDur] = useState(0);
  const [sampling, setSampling] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const pick = (f?: File) => { if (!f) return; setFile(f); setUrl(URL.createObjectURL(f)); };
  const pickSample = async () => { setSampling(true); try { pick(await loadSample("clip")); } finally { setSampling(false); } };
  return { file, url, dur, setDur, ref, pick, pickSample, sampling, reset: () => { setFile(null); setUrl(""); } };
}

type Res = { blob: Blob; url: string; name: string };

function ResultBox({ res, kind }: { res: Res; kind: "gif" | "video" }) {
  return (
    <div className="grid gap-3 rounded-2xl border bg-muted/50 p-4">
      {kind === "gif" ? <img src={res.url} alt="Result" className="max-h-80 rounded-lg" /> : <video src={res.url} controls className="max-h-80 rounded-lg" />}
      <div className="flex flex-wrap items-center gap-3"><span className="font-display font-bold text-primary">{fmtBytes(res.blob.size)}</span><DownloadBtn onClick={() => download(res.blob, res.name)} /></div>
    </div>
  );
}

/* ---------- MP4 → GIF ---------- */
export function Mp4ToGif() {
  const v = useVideo();
  const [start, setStart] = useState(0); const [end, setEnd] = useState(3);
  const [width, setWidth] = useState(480); const [fps, setFps] = useState(10); const [colors, setColors] = useState(128);
  const [progress, setProgress] = useState(0); const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res | null>(null); const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    const vid = v.ref.current; if (!vid) return;
    if (end - start > 20) return setErr("Keep clips under 20 seconds for a smooth GIF.");
    setBusy(true); setErr(null); setRes(null); vid.pause();
    const h = Math.round((vid.videoHeight / vid.videoWidth) * width);
    const c = document.createElement("canvas"); c.width = width; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    const enc = GIFEncoder(); const frames = Math.max(1, Math.round((end - start) * fps));
    for (let i = 0; i < frames; i++) {
      await seek(vid, start + i / fps);
      ctx.drawImage(vid, 0, 0, width, h);
      const { data } = ctx.getImageData(0, 0, width, h);
      const palette = quantize(data, colors); const index = applyPalette(data, palette);
      enc.writeFrame(index, width, h, { palette, delay: Math.round(1000 / fps) });
      setProgress(Math.round(((i + 1) / frames) * 100));
    }
    enc.finish();
    const blob = new Blob([enc.bytes()], { type: "image/gif" });
    setRes({ blob, url: URL.createObjectURL(blob), name: `${baseName(v.file!.name)}.gif` }); setBusy(false);
  };
  return (
    <Panel>
      {!v.url ? <Dropzone accept="video/*" label="Drop an MP4, MOV or WebM clip" onFiles={([f]) => v.pick(f)}
        sample={{ label: "Try a sample clip", busy: v.sampling, onPick: v.pickSample, note: "A 5-second dummy video so you can make a GIF straight away." }} /> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-3">
            <video ref={v.ref} src={v.url} controls muted className="w-full rounded-2xl bg-ink" onLoadedMetadata={(e) => { const d = e.currentTarget.duration; v.setDur(d); setEnd(Math.min(3, d)); }} />
            <Btn variant="ghost" onClick={v.reset}>Choose another video</Btn>
          </div>
          <div className="grid content-start gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start (s)"><input className={inputCls} type="number" step={0.1} min={0} max={v.dur} value={start} onChange={(e) => setStart(+e.target.value)} /></Field>
              <Field label="End (s)"><input className={inputCls} type="number" step={0.1} min={0} max={v.dur} value={end} onChange={(e) => setEnd(+e.target.value)} /></Field>
            </div>
            <Field label={`Width ${width}px`}><input type="range" min={160} max={960} step={20} value={width} onChange={(e) => setWidth(+e.target.value)} className={rangeCls} /></Field>
            <Field label={`Frame rate ${fps} fps`}><input type="range" min={5} max={25} value={fps} onChange={(e) => setFps(+e.target.value)} className={rangeCls} /></Field>
            <Field label={`Colors ${colors}`} hint="Fewer colors = smaller file"><input type="range" min={16} max={256} step={16} value={colors} onChange={(e) => setColors(+e.target.value)} className={rangeCls} /></Field>
            <Btn busy={busy} onClick={run}>{busy ? `Making GIF… ${progress}%` : "Create GIF"}</Btn>
          </div>
        </div>
      )}
      <ErrorNote msg={err} />
      {res && <ResultBox res={res} kind="gif" />}
    </Panel>
  );
}

/* ---------- Shared recorder for compress / aspect ---------- */
async function recordVideo(vid: HTMLVideoElement, w: number, h: number, bitrate: number, draw: (ctx: CanvasRenderingContext2D) => void, onProgress: (p: number) => void) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const stream = c.captureStream(30);
  const vs = (vid as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.();
  vs?.getAudioTracks().forEach((t) => stream.addTrack(t));
  const mime = ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bitrate });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  await seek(vid, 0);
  vid.muted = false;
  const done = new Promise<Blob>((res) => { rec.onstop = () => res(new Blob(chunks, { type: mime.split(";")[0] ?? "video/webm" })); });
  rec.start(500);
  let raf = 0;
  const loop = () => { draw(ctx); onProgress(Math.round((vid.currentTime / vid.duration) * 100)); raf = requestAnimationFrame(loop); };
  vid.onended = () => { cancelAnimationFrame(raf); rec.stop(); };
  await vid.play(); loop();
  return done;
}
const extOf = (b: Blob) => (b.type.includes("mp4") ? "mp4" : "webm");

/* ---------- Video Compressor ---------- */
export function VideoCompressor() {
  const v = useVideo();
  const [height, setHeight] = useState(720); const [mbps, setMbps] = useState(1.5);
  const [p, setP] = useState(0); const [busy, setBusy] = useState(false); const [res, setRes] = useState<Res | null>(null);
  const est = v.dur ? (mbps * 1e6 * v.dur) / 8 : 0;
  const run = async () => {
    const vid = v.ref.current!; setBusy(true); setRes(null);
    const h = Math.min(height, vid.videoHeight); const w = Math.round((vid.videoWidth / vid.videoHeight) * h / 2) * 2;
    const blob = await recordVideo(vid, w, h, mbps * 1e6, (ctx) => ctx.drawImage(vid, 0, 0, w, h), setP);
    setRes({ blob, url: URL.createObjectURL(blob), name: `${baseName(v.file!.name)}-compressed.${extOf(blob)}` }); setBusy(false);
  };
  return (
    <Panel>
      {!v.url ? <Dropzone accept="video/*" label="Drop a video to compress" onFiles={([f]) => v.pick(f)}
        sample={{ label: "Try a sample clip", busy: v.sampling, onPick: v.pickSample, note: "A 5-second dummy video — compression runs in real time." }} /> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <video ref={v.ref} src={v.url} controls playsInline className="w-full rounded-2xl bg-ink" onLoadedMetadata={(e) => v.setDur(e.currentTarget.duration)} />
          <div className="grid content-start gap-4">
            <p className="text-sm">Original: <b>{fmtBytes(v.file!.size)}</b> · {v.dur.toFixed(1)}s</p>
            <Field label="Resolution">
              <select className={inputCls} value={height} onChange={(e) => setHeight(+e.target.value)}>
                {[1080, 720, 480, 360].map((r) => <option key={r} value={r}>{r}p</option>)}
              </select>
            </Field>
            <Field label={`Quality ${mbps} Mbps`} hint={`Estimated output ≈ ${fmtBytes(est)}`}><input type="range" min={0.3} max={6} step={0.1} value={mbps} onChange={(e) => setMbps(+e.target.value)} className={rangeCls} /></Field>
            <Btn busy={busy} onClick={run}>{busy ? `Compressing… ${p}%` : "Compress video"}</Btn>
            <p className="text-xs text-muted-foreground">Processing plays the video in real time inside your browser — keep this tab open.</p>
            <Btn variant="ghost" onClick={v.reset}>Choose another video</Btn>
          </div>
        </div>
      )}
      {res && <ResultBox res={res} kind="video" />}
    </Panel>
  );
}

/* ---------- Aspect Ratio ---------- */
const RATIOS = { "16:9": [1280, 720], "9:16": [720, 1280], "1:1": [1080, 1080], "4:5": [1080, 1350] } as const;
export function AspectRatio() {
  const v = useVideo();
  const [ratio, setRatio] = useState<keyof typeof RATIOS>("9:16");
  const [mode, setMode] = useState<"blur" | "pad" | "crop">("blur");
  const [color, setColor] = useState("#4C0585");
  const [p, setP] = useState(0); const [busy, setBusy] = useState(false); const [res, setRes] = useState<Res | null>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const paint = (ctx: CanvasRenderingContext2D, vid: HTMLVideoElement, W: number, H: number) => {
    const vw = vid.videoWidth, vh = vid.videoHeight; if (!vw) return;
    const cover = Math.max(W / vw, H / vh), contain = Math.min(W / vw, H / vh);
    if (mode === "crop") { ctx.drawImage(vid, (W - vw * cover) / 2, (H - vh * cover) / 2, vw * cover, vh * cover); return; }
    if (mode === "blur") { ctx.filter = "blur(24px) brightness(0.7)"; ctx.drawImage(vid, (W - vw * cover) / 2, (H - vh * cover) / 2, vw * cover, vh * cover); ctx.filter = "none"; }
    else { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); }
    ctx.drawImage(vid, (W - vw * contain) / 2, (H - vh * contain) / 2, vw * contain, vh * contain);
  };
  useEffect(() => {
    const vid = v.ref.current, c = preview.current; if (!vid || !c) return;
    const [W, H] = RATIOS[ratio]; c.width = W / 4; c.height = H / 4;
    const ctx = c.getContext("2d")!; let raf = 0;
    const loop = () => { ctx.save(); ctx.scale(0.25, 0.25); paint(ctx, vid, W, H); ctx.restore(); raf = requestAnimationFrame(loop); };
    loop(); return () => cancelAnimationFrame(raf);
  }, [v.url, ratio, mode, color]); // eslint-disable-line react-hooks/exhaustive-deps
  const run = async () => {
    const vid = v.ref.current!; const [W, H] = RATIOS[ratio]; setBusy(true); setRes(null);
    const blob = await recordVideo(vid, W, H, 4e6, (ctx) => paint(ctx, vid, W, H), setP);
    setRes({ blob, url: URL.createObjectURL(blob), name: `${baseName(v.file!.name)}-${ratio.replace(":", "x")}.${extOf(blob)}` }); setBusy(false);
  };
  return (
    <Panel>
      {!v.url ? <Dropzone accept="video/*" label="Drop a video to reframe" onFiles={([f]) => v.pick(f)}
        sample={{ label: "Try a sample clip", busy: v.sampling, onPick: v.pickSample, note: "A 5-second dummy video so you can preview every ratio." }} /> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_280px]">
          <video ref={v.ref} src={v.url} controls muted playsInline className="w-full rounded-2xl bg-ink" />
          <div className="flex items-center justify-center rounded-2xl bg-muted p-3 grid-dots"><canvas ref={preview} className="max-h-80 max-w-full rounded-lg shadow-soft" /></div>
          <div className="grid content-start gap-4">
            <Field label="Aspect ratio">
              <div className="flex flex-wrap gap-2">{(Object.keys(RATIOS) as (keyof typeof RATIOS)[]).map((r) => (
                <button key={r} onClick={() => setRatio(r)} className={`rounded-full border px-3 py-1.5 text-sm font-bold ${ratio === r ? "bg-gradient-primary text-primary-foreground" : "hover:bg-secondary"}`}>{r}</button>
              ))}</div>
            </Field>
            <Field label="Fill style">
              <select className={inputCls} value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                <option value="blur">Blurred background</option><option value="pad">Solid color bars</option><option value="crop">Crop to fill</option>
              </select>
            </Field>
            {mode === "pad" && <Field label="Bar color"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-full rounded-xl border" /></Field>}
            <Btn busy={busy} onClick={run}>{busy ? `Exporting… ${p}%` : "Export video"}</Btn>
            <Btn variant="ghost" onClick={v.reset}>Choose another video</Btn>
          </div>
        </div>
      )}
      {res && <ResultBox res={res} kind="video" />}
    </Panel>
  );
}

/* ---------- GIF Compressor ---------- */
export function GifCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(75); const [skip, setSkip] = useState(1); const [colors, setColors] = useState(64);
  const [busy, setBusy] = useState(false); const [res, setRes] = useState<Res | null>(null); const [err, setErr] = useState<string | null>(null);
  const [sampling, setSampling] = useState(false);
  const run = async () => {
    if (!file) return; setBusy(true); setErr(null); setRes(null);
    try {
      const gif = parseGIF(await file.arrayBuffer());
      const frames = decompressFrames(gif, true);
      const W = gif.lsd.width, H = gif.lsd.height;
      const full = document.createElement("canvas"); full.width = W; full.height = H;
      const fctx = full.getContext("2d", { willReadFrequently: true })!;
      const patch = document.createElement("canvas"); const pctx = patch.getContext("2d")!;
      const w = Math.max(1, Math.round((W * scale) / 100)), h = Math.max(1, Math.round((H * scale) / 100));
      const out = document.createElement("canvas"); out.width = w; out.height = h;
      const octx = out.getContext("2d", { willReadFrequently: true })!;
      const enc = GIFEncoder(); let delay = 0;
      frames.forEach((f, i) => {
        const { width, height, top, left } = f.dims;
        patch.width = width; patch.height = height;
        pctx.putImageData(new ImageData(new Uint8ClampedArray(f.patch), width, height), 0, 0);
        fctx.drawImage(patch, left, top);
        delay += f.delay || 100;
        if (i % skip === 0) {
          octx.clearRect(0, 0, w, h); octx.drawImage(full, 0, 0, w, h);
          const { data } = octx.getImageData(0, 0, w, h);
          const palette = quantize(data, colors);
          enc.writeFrame(applyPalette(data, palette), w, h, { palette, delay });
          delay = 0;
        }
        if (f.disposalType === 2) fctx.clearRect(left, top, width, height);
      });
      enc.finish();
      const blob = new Blob([enc.bytes()], { type: "image/gif" });
      setRes({ blob, url: URL.createObjectURL(blob), name: `${baseName(file.name)}-compressed.gif` });
    } catch { setErr("That file couldn't be read as a GIF."); }
    setBusy(false);
  };
  return (
    <Panel>
      <Dropzone accept="image/gif" label={file ? `Selected: ${file.name} (${fmtBytes(file.size)})` : "Drop a GIF to compress"} onFiles={([f]) => { setFile(f ?? null); setRes(null); }}
        sample={{ label: "Try a sample GIF", busy: sampling, onPick: async () => { setSampling(true); const f = await loadSample("gif"); setFile(f); setRes(null); setSampling(false); }, note: "A dummy animation so you can see the size drop before using your own." }} />
      {file && (
        <div className="grid gap-4 md:grid-cols-4">
          <Field label={`Size ${scale}%`}><input type="range" min={20} max={100} step={5} value={scale} onChange={(e) => setScale(+e.target.value)} className={rangeCls} /></Field>
          <Field label={skip === 1 ? "Keep all frames" : `Keep every ${skip} frames`}><input type="range" min={1} max={4} value={skip} onChange={(e) => setSkip(+e.target.value)} className={rangeCls} /></Field>
          <Field label={`Colors ${colors}`}><input type="range" min={16} max={256} step={16} value={colors} onChange={(e) => setColors(+e.target.value)} className={rangeCls} /></Field>
          <div className="flex items-end"><Btn busy={busy} onClick={run}>Compress GIF</Btn></div>
        </div>
      )}
      <ErrorNote msg={err} />
      {res && file && <><p className="font-display font-bold text-primary">{fmtBytes(file.size)} → {fmtBytes(res.blob.size)} ({Math.round((1 - res.blob.size / file.size) * 100)}% smaller)</p><ResultBox res={res} kind="gif" /></>}
    </Panel>
  );
}
