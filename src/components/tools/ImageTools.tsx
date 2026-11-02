import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { AlertTriangle, ArrowDown, ArrowUp, Check, Globe, IdCard, Loader2, Mail, Phone, Type, Upload, Wifi, X } from "lucide-react";
import { loadSample } from "@/lib/samples";
import { PresetPicker } from "@/components/tools/PresetPicker";

import { fitToTarget } from "@/lib/fit-size";
import { Btn, Dropzone, DownloadBtn, ErrorNote, Field, Panel, baseName, canvasBlob, download, extFor, fmtBytes, inputCls, loadImage, rangeCls } from "./ui";

type Out = { name: string; before: number; blob: Blob; url: string };

/* ---------- Image Compressor ---------- */
export function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(70);
  const [format, setFormat] = useState("image/webp");
  const [out, setOut] = useState<Out[]>([]);
  const [busy, setBusy] = useState(false);
  const [sampling, setSampling] = useState(false);
  const run = async () => {
    setBusy(true);
    const res: Out[] = [];
    for (const f of files) {
      const img = await loadImage(f);
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      if (format === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasBlob(c, format, quality / 100);
      res.push({ name: `${baseName(f.name)}-compressed.${extFor(format)}`, before: f.size, blob, url: URL.createObjectURL(blob) });
    }
    setOut(res); setBusy(false);
  };
  const saved = out.reduce((s, o) => s + o.before - o.blob.size, 0);
  return (
    <Panel>
      <Dropzone accept="image/jpeg,image/png,image/webp" multiple label="Drop JPG, PNG or WebP images" onFiles={(f) => { setFiles(f); setOut([]); }}
        sample={{ label: "Try a sample photo", busy: sampling, onPick: async () => { setSampling(true); const f = await loadSample("photo"); setFiles([f]); setOut([]); setSampling(false); } }} />
      {files.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={`Quality: ${quality}%`}><input type="range" min={10} max={95} value={quality} onChange={(e) => setQuality(+e.target.value)} className={rangeCls} /></Field>
          <Field label="Output format">
            <select className={inputCls} value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="image/webp">WebP (smallest)</option><option value="image/jpeg">JPG</option>
            </select>
          </Field>
          <div className="flex items-end"><Btn busy={busy} onClick={run}>Compress {files.length} image{files.length > 1 ? "s" : ""}</Btn></div>
        </div>
      )}
      {out.length > 0 && (
        <>
          <p className="font-display text-lg font-bold text-primary">You saved {fmtBytes(Math.max(0, saved))} 🎉</p>
          <div className="grid gap-3">
            {out.map((o) => (
              <div key={o.name} className="flex flex-wrap items-center gap-4 rounded-2xl border p-3">
                <img src={o.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 text-sm"><p className="font-semibold">{o.name}</p>
                  <p className="text-muted-foreground">{fmtBytes(o.before)} → <b className="text-primary">{fmtBytes(o.blob.size)}</b> ({Math.round((1 - o.blob.size / o.before) * 100)}% smaller)</p></div>
                <DownloadBtn onClick={() => download(o.blob, o.name)} />
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}

/* ---------- Image Resizer ---------- */
export function ImageResizer() {

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [name, setName] = useState("image");
  const [w, setW] = useState(0); const [h, setH] = useState(0);
  const [lock, setLock] = useState(true);
  const [sampling, setSampling] = useState(false);
  const [fit, setFit] = useState<"cover" | "contain" | "stretch">("cover");
  const [kb, setKb] = useState<number | "">("");
  const [out, setOut] = useState<{ blob: Blob; url: string; q: number; scale: number; hits: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const ratio = img ? img.naturalWidth / img.naturalHeight : 1;
  const target = kb ? Math.max(1, Math.round(kb * 1024)) : 0;

  const draw = (scale = 1) => {
    if (!img || !w || !h) return null;
    const W = Math.max(1, Math.round(w * scale)), H = Math.max(1, Math.round(h * scale));
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    if (fit === "stretch") ctx.drawImage(img, 0, 0, W, H);
    else {
      const s = fit === "cover" ? Math.max(W / img.naturalWidth, H / img.naturalHeight) : Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }
    return c;
  };

  // Hit the target file size: tune JPEG quality first, and only give up pixels if quality alone can't get there.
  const make = async () => {
    const base = draw(); if (!base) return null;
    const mk = (blob: Blob, q: number, scale: number, hits: boolean) => ({ blob, url: URL.createObjectURL(blob), q, scale, hits });
    if (!target) return mk(await canvasBlob(base, "image/jpeg", 0.92), 0.92, 1, true);
    const cache = new Map<string, Blob>();
    const encode = async (q: number, scale: number) => {
      const key = `${q}|${scale}`;
      let blob = cache.get(key);
      if (!blob) { blob = await canvasBlob(scale === 1 ? base : draw(scale)!, "image/jpeg", q); cache.set(key, blob); }
      return { size: blob.size, blob };
    };
    const fit = await fitToTarget(encode, target);
    return mk((await encode(fit.q, fit.scale)).blob, fit.q, fit.scale, fit.hits);
  };

  useEffect(() => {
    if (!img || !w || !h) return;
    let alive = true;
    const t = setTimeout(() => {
      setBusy(true);
      make().then((r) => {
        if (!alive) { if (r) URL.revokeObjectURL(r.url); return; }
        setOut((prev) => { if (prev) URL.revokeObjectURL(prev.url); return r; });
        setBusy(false);
      });
    }, 250);
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, w, h, fit, kb]);

  const pick = async (f: File) => { const i = await loadImage(f); setImg(i); setName(baseName(f.name)); setW(i.naturalWidth); setH(i.naturalHeight); };
  return (
    <Panel>
      {!img ? (
        <Dropzone accept="image/*" label="Drop an image to resize or crop" onFiles={async ([f]) => { if (f) await pick(f); }}
          sample={{ label: "Try a sample passport photo", busy: sampling, onPick: async () => { setSampling(true); await pick(await loadSample("portrait")); setSampling(false); } }} />
      ) : (
        <>
          <PresetPicker w={w} h={h} kb={kb} onPick={(p) => { setW(p.w); setH(p.h); setKb(p.kb ?? ""); setLock(false); }} />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          <div className="grid content-start gap-3">
            <div className="flex min-h-64 items-center justify-center rounded-2xl bg-muted grid-dots p-4">
              {out ? <img src={out.url} alt="Preview" className="max-h-96 max-w-full rounded-lg shadow-soft" /> : <div className="h-40 w-40 rounded-lg bg-secondary" />}
            </div>
            <div className={`rounded-2xl border p-4 text-sm ${out && !out.hits ? "border-destructive/40 bg-destructive/5" : "border-primary/20 bg-secondary/40"}`}>
              {busy ? (
                <p className="flex items-center gap-2 font-semibold text-primary"><Loader2 className="h-4 w-4 animate-spin" /> Matching your target size…</p>
              ) : out ? (
                <>
                  <p className="flex items-center gap-2 font-semibold">
                    {out.hits ? <Check className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {fmtBytes(out.blob.size)}
                    {target ? (out.hits ? <span className="text-primary">— under your {kb} KB target</span> : <span className="text-destructive">— still above your {kb} KB target</span>) : <span className="text-muted-foreground">— no target set</span>}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Quality {Math.round(out.q * 100)}%
                    {out.scale < 1 ? ` · output ${Math.round(w * out.scale)}×${Math.round(h * out.scale)} px to fit the target` : target ? " · full size kept" : ""}
                    {out.q < 0.25 ? " · it will look soft — a looser target stays sharper" : ""}
                    {target && !out.hits ? " · try a smaller width/height or a looser target" : ""}
                  </p>
                </>
              ) : null}
            </div>
          </div>
          <div className="grid content-start gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Width px"><input className={inputCls} type="number" value={w} onChange={(e) => { const v = +e.target.value; setW(v); if (lock) setH(Math.round(v / ratio)); }} /></Field>
              <Field label="Height px"><input className={inputCls} type="number" value={h} onChange={(e) => { const v = +e.target.value; setH(v); if (lock) setW(Math.round(v * ratio)); }} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="accent-primary" /> Lock aspect ratio</label>
            <Field label="Fit">
              <select className={inputCls} value={fit} onChange={(e) => setFit(e.target.value as typeof fit)}>
                <option value="cover">Crop to fill</option><option value="contain">Fit inside (white bars)</option><option value="stretch">Stretch</option>
              </select>
            </Field>
            <Field label="Target file size (KB)" hint="Tell us the portal's limit — we tune quality, then pixels, to land under it.">
              <div className="grid gap-2">
                <input className={inputCls} type="number" min={1} value={kb} onChange={(e) => setKb(e.target.value ? +e.target.value : "")} placeholder="e.g. 20" />
                <div className="flex flex-wrap gap-1.5">
                  {[10, 20, 50, 100, 200].map((v) => (
                    <button key={v} type="button" onClick={() => setKb(v)} className={`rounded-full border px-3 py-1 text-xs font-bold ${kb === v ? "bg-gradient-primary text-primary-foreground" : "hover:bg-secondary"}`}>≤ {v} KB</button>
                  ))}
                  {kb !== "" && <button type="button" onClick={() => setKb("")} className="rounded-full border px-3 py-1 text-xs font-bold text-muted-foreground hover:bg-secondary">No target</button>}
                </div>
              </div>
            </Field>
            <div className="flex flex-wrap gap-2">
              <DownloadBtn onClick={() => out && download(out.blob, `${name}-${w}x${h}.jpg`)}>Download {out ? fmtBytes(out.blob.size) : ""}</DownloadBtn>
              <Btn variant="ghost" onClick={() => setImg(null)}>New image</Btn>
            </div>
          </div>
        </div>
        </>
      )}

    </Panel>
  );
}

/* ---------- Format Converter ---------- */
export function FormatConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [to, setTo] = useState("image/png");
  const [out, setOut] = useState<Out[]>([]);
  const [busy, setBusy] = useState(false);
  const [sampling, setSampling] = useState(false);
  const run = async () => {
    setBusy(true); const res: Out[] = [];
    for (const f of files) {
      const img = await loadImage(f);
      const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      if (to === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasBlob(c, to, 0.92);
      res.push({ name: `${baseName(f.name)}.${extFor(to)}`, before: f.size, blob, url: URL.createObjectURL(blob) });
    }
    setOut(res); setBusy(false);
  };
  const zip = async () => { const z = new JSZip(); out.forEach((o) => z.file(o.name, o.blob)); download(await z.generateAsync({ type: "blob" }), "converted-images.zip"); };
  return (
    <Panel>
      <Dropzone accept="image/*" multiple label="Drop images to convert" onFiles={(f) => { setFiles(f); setOut([]); }}
        sample={{ label: "Try sample images", busy: sampling, onPick: async () => { setSampling(true); const [a, b] = await Promise.all([loadSample("photo"), loadSample("logo")]); setFiles([a, b]); setOut([]); setSampling(false); } }} />
      {files.length > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Convert to">
            <div className="flex gap-2">
              {["image/png", "image/jpeg", "image/webp"].map((m) => (
                <button key={m} onClick={() => setTo(m)} className={`rounded-full border px-4 py-2 text-sm font-bold ${to === m ? "bg-gradient-primary text-primary-foreground" : "hover:bg-secondary"}`}>{extFor(m).toUpperCase()}</button>
              ))}
            </div>
          </Field>
          <Btn busy={busy} onClick={run}>Convert {files.length} file{files.length > 1 ? "s" : ""}</Btn>
          {to === "image/jpeg" && <span className="text-xs text-muted-foreground">JPG has no transparency — transparent areas become white.</span>}
        </div>
      )}
      {out.length > 0 && (
        <div className="grid gap-3">
          {out.map((o) => (
            <div key={o.name} className="flex items-center gap-3 rounded-2xl border p-3 text-sm">
              <img src={o.url} alt="" className="h-12 w-12 rounded object-cover" /><span className="flex-1 font-semibold">{o.name}</span><span className="text-muted-foreground">{fmtBytes(o.blob.size)}</span>
              <DownloadBtn onClick={() => download(o.blob, o.name)}>Save</DownloadBtn>
            </div>
          ))}
          {out.length > 1 && <div><DownloadBtn onClick={zip}>Download all as ZIP</DownloadBtn></div>}
        </div>
      )}
    </Panel>
  );
}

/* ---------- QR Code ---------- */
type QrType = "url" | "text" | "wifi" | "email" | "phone" | "vcard";
const QR_TYPES: { id: QrType; label: string; Icon: typeof Globe }[] = [
  { id: "url", label: "Website", Icon: Globe },
  { id: "text", label: "Text", Icon: Type },
  { id: "wifi", label: "Wi-Fi", Icon: Wifi },
  { id: "email", label: "Email", Icon: Mail },
  { id: "phone", label: "Phone", Icon: Phone },
  { id: "vcard", label: "vCard", Icon: IdCard },
];
const QR_LEVELS = [
  { id: "L", label: "L · 7%", hint: "Smallest code" },
  { id: "M", label: "M · 15%", hint: "Everyday use" },
  { id: "Q", label: "Q · 25%", hint: "Print & posters" },
  { id: "H", label: "H · 30%", hint: "Withstands damage" },
] as const;
const QR_SWATCHES = ["#4C0585", "#1e1b4b", "#0f766e", "#b45309", "#be123c", "#111111"];

function StepHead({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary font-display text-sm font-extrabold text-primary-foreground">{n}</span>
      <h3 className="font-display text-lg font-bold">{title}</h3>
    </div>
  );
}

type QrShape = "square" | "rounded" | "dots" | "diamond" | "star" | "classy" | "fluid" | "bars";
type QrCorner = "square" | "rounded" | "circle" | "leaf";
type QrFrame = "none" | "border" | "banner" | "badge";
type QrDesignTab = "frame" | "shape" | "logo" | "level";

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

function drawModule(ctx: CanvasRenderingContext2D, shape: QrShape, x: number, y: number, cell: number, on: (dr: number, dc: number) => boolean) {
  const cx = x + cell / 2, cy = y + cell / 2;
  if (shape === "dots") { ctx.beginPath(); ctx.arc(cx, cy, cell * 0.42, 0, 7); ctx.fill(); }
  else if (shape === "rounded") { rr(ctx, x + cell * 0.08, y + cell * 0.08, cell * 0.84, cell * 0.84, cell * 0.38); ctx.fill(); }
  else if (shape === "diamond") { ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(x + cell, cy); ctx.lineTo(cx, y + cell); ctx.lineTo(x, cy); ctx.closePath(); ctx.fill(); }
  else if (shape === "star") {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? cell * 0.24 : cell * 0.54; ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
    ctx.closePath(); ctx.fill();
  }
  else if (shape === "classy") { ctx.beginPath(); ctx.roundRect(x + cell * 0.04, y + cell * 0.04, cell * 0.92, cell * 0.92, [cell * 0.46, 0, cell * 0.46, 0]); ctx.fill(); }
  else if (shape === "fluid") {
    rr(ctx, x, y, cell, cell, cell * 0.5); ctx.fill();
    if (on(0, 1)) ctx.fillRect(cx, y, cell, cell);
    if (on(1, 0)) ctx.fillRect(x, cy, cell, cell);
  }
  else if (shape === "bars") {
    rr(ctx, x + cell * 0.14, y, cell * 0.72, cell, cell * 0.36); ctx.fill();
    if (on(1, 0)) ctx.fillRect(x + cell * 0.14, cy, cell * 0.72, cell);
  }
  else ctx.fillRect(x, y, cell + 0.5, cell + 0.5);
}

function cornerRadii(corner: QrCorner, s: number): number | number[] {
  if (corner === "square") return 0;
  if (corner === "circle") return s / 2;
  if (corner === "leaf") return [s * 0.45, 0, s * 0.45, 0];
  return s * 0.25;
}

function drawQr(canvas: HTMLCanvasElement, value: string, o: { fg: string; bg: string; size: number; level: "L" | "M" | "Q" | "H"; shape: QrShape; corner: QrCorner; frame: QrFrame; logo: HTMLImageElement | null }) {
  const qr = QRCode.create(value, { errorCorrectionLevel: o.logo ? "H" : o.level });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const dpr = 2;
  const pad = o.frame === "none" ? Math.round(o.size * 0.04) : Math.round(o.size * 0.09);
  const bannerH = o.frame === "banner" ? Math.round(o.size * 0.18) : 0;
  const W = o.size + pad * 2;
  const H = o.size + pad * 2 + bannerH;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.aspectRatio = `${W} / ${H}`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = o.bg;
  if (o.frame === "none") ctx.fillRect(0, 0, W, H);
  else { rr(ctx, 0, 0, W, H, Math.round(o.size * 0.06)); ctx.fill(); }
  if (o.frame === "border") {
    ctx.strokeStyle = o.fg; ctx.lineWidth = Math.max(3, o.size * 0.012);
    rr(ctx, ctx.lineWidth, ctx.lineWidth, W - ctx.lineWidth * 2, H - ctx.lineWidth * 2, Math.round(o.size * 0.05)); ctx.stroke();
  }
  if (o.frame === "badge") {
    ctx.strokeStyle = o.fg; ctx.lineWidth = Math.max(4, o.size * 0.016);
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) / 2 - ctx.lineWidth, 0, 7); ctx.stroke();
  }
  const ox = pad, oy = pad, cell = o.size / n;
  const isFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  ctx.fillStyle = o.fg;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!data[r * n + c] || isFinder(r, c)) continue;
    const x = ox + c * cell, y = oy + r * cell;
    drawModule(ctx, o.shape, x, y, cell, (dr, dc) => {
      const rr2 = r + dr, cc = c + dc;
      return rr2 < n && cc < n && !!data[rr2 * n + cc] && !isFinder(rr2, cc);
    });
  }
  const box = (x: number, y: number, s: number) => { ctx.beginPath(); ctx.roundRect(x, y, s, s, cornerRadii(o.corner, s)); ctx.fill(); };
  const finder = (r0: number, c0: number) => {
    const x = ox + c0 * cell, y = oy + r0 * cell, s = cell * 7;
    ctx.fillStyle = o.fg; box(x, y, s);
    ctx.fillStyle = o.bg; box(x + cell, y + cell, s - cell * 2);
    ctx.fillStyle = o.fg; box(x + cell * 2, y + cell * 2, s - cell * 4);
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  if (o.logo) {
    const ls = o.size * 0.22, lx = ox + (o.size - ls) / 2, ly = oy + (o.size - ls) / 2, lp = ls * 0.14;
    ctx.fillStyle = o.bg; rr(ctx, lx - lp, ly - lp, ls + lp * 2, ls + lp * 2, ls * 0.25); ctx.fill();
    const img = o.logo, ir = img.naturalWidth / img.naturalHeight;
    let dw = ls, dh = ls; if (ir > 1) dh = ls / ir; else dw = ls * ir;
    ctx.drawImage(img, lx + (ls - dw) / 2, ly + (ls - dh) / 2, dw, dh);
  }
  if (o.frame === "banner") {
    ctx.fillStyle = o.fg;
    rr(ctx, pad * 0.4, H - bannerH - pad * 0.4, W - pad * 0.8, bannerH, bannerH * 0.3); ctx.fill();
    ctx.fillStyle = o.bg;
    ctx.font = `800 ${Math.round(bannerH * 0.42)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("SCAN ME", W / 2, H - bannerH / 2 - pad * 0.4 + 1);
  }
}

const QR_SHAPES: { id: QrShape; label: string; hint: string }[] = [
  { id: "square", label: "Classic", hint: "Sharp square modules" },
  { id: "rounded", label: "Rounded", hint: "Soft corners" },
  { id: "dots", label: "Dots", hint: "Playful circles" },
  { id: "diamond", label: "Diamond", hint: "Sharp gems" },
  { id: "star", label: "Stars", hint: "Little sparkles" },
  { id: "classy", label: "Classy", hint: "Leaf-cut corners" },
  { id: "fluid", label: "Fluid", hint: "Blobs that join up" },
  { id: "bars", label: "Bars", hint: "Vertical stripes" },
];
const QR_CORNERS: { id: QrCorner; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
  { id: "leaf", label: "Leaf" },
];
const THUMB = [1,1,0,1,0, 0,1,1,1,1, 1,0,1,0,1, 1,1,1,0,0, 0,1,0,1,1];
function ShapeThumb({ shape }: { shape: QrShape }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!; c.width = 100; c.height = 100;
    ctx.clearRect(0, 0, 100, 100); ctx.fillStyle = "#4C0585";
    for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) if (THUMB[r * 5 + k])
      drawModule(ctx, shape, 4 + k * 18.4, 4 + r * 18.4, 18.4, (dr, dc) => r + dr < 5 && k + dc < 5 && !!THUMB[(r + dr) * 5 + k + dc]);
  }, [shape]);
  return <canvas ref={ref} className="mb-2 h-12 w-12" aria-hidden />;
}
function CornerThumb({ corner }: { corner: QrCorner }) {
  const r = (s: number) => { const v = cornerRadii(corner, s); return Array.isArray(v) ? v[0] : v; };
  const leaf = corner === "leaf";
  const style = (s: number) => leaf ? { borderRadius: `${r(s)}px 0 ${r(s)}px 0` } : { borderRadius: r(s) };
  return (
    <span className="mb-2 grid h-12 w-12 place-items-center bg-primary" style={style(48)}>
      <span className="grid h-8 w-8 place-items-center bg-background" style={style(32)}>
        <span className="h-4 w-4 bg-primary" style={style(16)} />
      </span>
    </span>
  );
}
const QR_FRAMES: { id: QrFrame; label: string }[] = [
  { id: "none", label: "No frame" },
  { id: "border", label: "Border" },
  { id: "banner", label: "Scan-me banner" },
  { id: "badge", label: "Badge ring" },
];

function FrameThumb({ id, fg }: { id: QrFrame; fg: string }) {
  const dots: [number, number][] = [[2, 2], [5, 2], [8, 2], [2, 5], [5, 5], [8, 5], [2, 8], [5, 8], [8, 8], [5, 11], [8, 11]];
  const qr = <g fill={fg} opacity={0.85}>{dots.map(([x, y], i) => <rect key={i} x={x * 2.4} y={y * 2.4} width={2} height={2} rx={0.5} />)}</g>;
  return (
    <svg viewBox="0 0 28 34" className="h-14 w-full" aria-hidden>
      {id === "none" && <g><circle cx="14" cy="15" r="9" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" /><line x1="7" y1="22" x2="21" y2="8" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" /></g>}
      {id === "border" && <g><rect x="4" y="4" width="20" height="26" rx="4" fill="none" stroke={fg} strokeWidth="2" /><g transform="translate(4.5 7)">{qr}</g></g>}
      {id === "banner" && <g><rect x="4" y="3" width="20" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-border" /><g transform="translate(4.5 6)">{qr}</g><rect x="6" y="25" width="16" height="4.5" rx="2.2" fill={fg} /></g>}
      {id === "badge" && <g><circle cx="14" cy="17" r="12.5" fill="none" stroke={fg} strokeWidth="2" /><g transform="translate(4.5 9)">{qr}</g></g>}
    </svg>
  );
}

export function QrGenerator() {
  const [type, setType] = useState<QrType>("url");
  const [text, setText] = useState("https://marvedge.com/");
  const [ssid, setSsid] = useState(""); const [pass, setPass] = useState(""); const [enc, setEnc] = useState("WPA");
  const [mailTo, setMailTo] = useState(""); const [mailSub, setMailSub] = useState(""); const [mailBody, setMailBody] = useState("");
  const [phone, setPhone] = useState("");
  const [vName, setVName] = useState(""); const [vOrg, setVOrg] = useState(""); const [vTel, setVTel] = useState(""); const [vMail, setVMail] = useState(""); const [vUrl, setVUrl] = useState("");
  const [fg, setFg] = useState("#4C0585"); const [bg, setBg] = useState("#FFFDFE");
  const [size, setSize] = useState(512);
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [designTab, setDesignTab] = useState<QrDesignTab>("frame");
  const [frame, setFrame] = useState<QrFrame>("none");
  const [shape, setShape] = useState<QrShape>("square");
  const [corner, setCorner] = useState<QrCorner>("square");
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const value =
    type === "wifi" ? `WIFI:T:${enc};S:${ssid};P:${pass};;`
    : type === "email" ? `mailto:${mailTo}?subject=${encodeURIComponent(mailSub)}&body=${encodeURIComponent(mailBody)}`
    : type === "phone" ? `tel:${phone.replace(/[^+\d]/g, "")}`
    : type === "vcard" ? ["BEGIN:VCARD", "VERSION:3.0", `FN:${vName}`, vOrg && `ORG:${vOrg}`, vTel && `TEL:${vTel}`, vMail && `EMAIL:${vMail}`, vUrl && `URL:${vUrl}`, "END:VCARD"].filter(Boolean).join("\n")
    : text;
  const plainSvg = shape === "square" && corner === "square" && frame === "none" && !logo;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !value.trim()) return;
    try { drawQr(c, value, { fg, bg, size, level, shape, corner, frame, logo }); } catch { /* invalid content — keep last frame */ }
  }, [value, fg, bg, size, level, shape, corner, frame, logo]);

  const downloadPng = () => { const c = canvasRef.current; if (c) download(c.toDataURL("image/png"), "qr-code.png"); };
  const downloadSvg = async () => download(new Blob([await QRCode.toString(value, { width: size, margin: 2, color: { dark: fg, light: bg }, errorCorrectionLevel: level, type: "svg" })], { type: "image/svg+xml" }), "qr-code.svg");

  return (
    <Panel>
      {/* type tabs */}
      <div className="flex flex-wrap gap-2">
        {QR_TYPES.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setType(id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${type === id ? "border-primary bg-secondary text-primary shadow-soft" : "hover:border-lavender hover:bg-muted"}`}>
            <span className={`grid h-7 w-7 place-items-center rounded-lg ${type === id ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-primary"}`}><Icon className="h-4 w-4" /></span>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="grid content-start gap-7">
          {/* step 1: content */}
          <div className="grid gap-3">
            <StepHead n={1} title="Complete the content" />
            {type === "wifi" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Network name"><input className={inputCls} value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="MyHomeWifi" /></Field>
                <Field label="Password"><input className={inputCls} value={pass} onChange={(e) => setPass(e.target.value)} /></Field>
                <Field label="Security"><select className={inputCls} value={enc} onChange={(e) => setEnc(e.target.value)}><option>WPA</option><option>WEP</option><option value="nopass">None</option></select></Field>
              </div>
            )}
            {type === "email" && (
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Send to"><input className={inputCls} value={mailTo} onChange={(e) => setMailTo(e.target.value)} placeholder="hello@example.com" /></Field>
                  <Field label="Subject"><input className={inputCls} value={mailSub} onChange={(e) => setMailSub(e.target.value)} /></Field>
                </div>
                <Field label="Message"><textarea rows={2} className={inputCls} value={mailBody} onChange={(e) => setMailBody(e.target.value)} /></Field>
              </div>
            )}
            {type === "phone" && (
              <Field label="Phone number" hint="Include the country code, e.g. +91 98765 43210"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" /></Field>
            )}
            {type === "vcard" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name"><input className={inputCls} value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Asha Verma" /></Field>
                <Field label="Company"><input className={inputCls} value={vOrg} onChange={(e) => setVOrg(e.target.value)} /></Field>
                <Field label="Phone"><input className={inputCls} value={vTel} onChange={(e) => setVTel(e.target.value)} /></Field>
                <Field label="Email"><input className={inputCls} value={vMail} onChange={(e) => setVMail(e.target.value)} /></Field>
                <Field label="Website"><input className={inputCls} value={vUrl} onChange={(e) => setVUrl(e.target.value)} /></Field>
              </div>
            )}
            {(type === "url" || type === "text") && (
              <Field label={type === "url" ? "Enter your website" : "Enter your text"}>
                <textarea rows={type === "url" ? 1 : 3} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder={type === "url" ? "E.g. https://www.myweb.com/" : "Anything you like…"} />
              </Field>
            )}
          </div>

          {/* step 2: design */}
          <div className="grid gap-4">
            <StepHead n={2} title="Design your QR" />
            <div className="flex flex-wrap gap-1 rounded-2xl bg-muted p-1">
              {(["frame", "shape", "logo", "level"] as const).map((t) => (
                <button key={t} onClick={() => setDesignTab(t)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${designTab === t ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>

            {designTab === "frame" && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {QR_FRAMES.map((f) => (
                  <button key={f.id} onClick={() => setFrame(f.id)}
                    className={`grid justify-items-center gap-1 rounded-2xl border p-3 transition ${frame === f.id ? "border-primary bg-secondary shadow-soft" : "hover:border-lavender hover:bg-muted"}`}>
                    <FrameThumb id={f.id} fg={fg} />
                    <span className="text-xs font-bold">{f.label}</span>
                  </button>
                ))}
              </div>
            )}

            {designTab === "shape" && (
              <div className="grid gap-4">
                <span className="text-sm font-semibold">Dot style</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {QR_SHAPES.map((s) => (
                    <button key={s.id} onClick={() => setShape(s.id)}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${shape === s.id ? "border-primary bg-secondary shadow-soft" : "hover:border-lavender hover:bg-muted"}`}>
                      <ShapeThumb shape={s.id} />
                      <span className="block text-sm font-bold">{s.label}</span>
                      <span className="block text-xs text-muted-foreground">{s.hint}</span>
                    </button>
                  ))}
                </div>
                <span className="text-sm font-semibold">Corner eyes</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {QR_CORNERS.map((k) => (
                    <button key={k.id} onClick={() => setCorner(k.id)}
                      className={`flex flex-col items-center rounded-2xl border px-3 py-3 transition ${corner === k.id ? "border-primary bg-secondary shadow-soft" : "hover:border-lavender hover:bg-muted"}`}>
                      <CornerThumb corner={k.id} />
                      <span className="text-sm font-bold">{k.label}</span>
                    </button>
                  ))}
                </div>
                <div className="grid gap-3">
                  <span className="text-sm font-semibold">Code color</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {QR_SWATCHES.map((c) => (
                      <button key={c} aria-label={`Code color ${c}`} onClick={() => setFg(c)}
                        className={`h-9 w-9 rounded-full border-2 transition ${fg === c ? "scale-110 border-primary ring-2 ring-ring/40" : "border-transparent hover:scale-105"}`}
                        style={{ background: c }} />
                    ))}
                    <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} aria-label="Custom code color" className="h-9 w-12 cursor-pointer rounded-lg border" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Background">
                    <div className="flex items-center gap-2">
                      {["#FFFDFE", "#ffffff", "#f5f3ff", "#111111"].map((c) => (
                        <button key={c} aria-label={`Background ${c}`} onClick={() => setBg(c)}
                          className={`h-9 w-9 rounded-full border-2 transition ${bg === c ? "scale-110 border-primary ring-2 ring-ring/40" : "border-border hover:scale-105"}`}
                          style={{ background: c }} />
                      ))}
                      <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} aria-label="Custom background color" className="h-9 w-12 cursor-pointer rounded-lg border" />
                    </div>
                  </Field>
                  <Field label={`Size · ${size}px`}><input type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(+e.target.value)} className={rangeCls} /></Field>
                </div>
              </div>
            )}

            {designTab === "logo" && (
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Btn variant="ghost" onClick={() => logoInputRef.current?.click()}><Upload className="h-4 w-4" />{logo ? "Change logo" : "Upload a logo"}</Btn>
                  {logo && <Btn variant="ghost" onClick={() => setLogo(null)}><X className="h-4 w-4" />Remove</Btn>}
                  <input ref={logoInputRef} type="file" hidden accept="image/*"
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) setLogo(await loadImage(f)); e.target.value = ""; }} />
                </div>
                <p className="text-xs text-muted-foreground">Your logo sits in the middle on a clean patch. We automatically switch to the strongest error correction (H) so the code keeps scanning.</p>
              </div>
            )}

            {designTab === "level" && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {QR_LEVELS.map((l) => (
                  <button key={l.id} onClick={() => setLevel(l.id)} disabled={!!logo}
                    className={`rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${level === l.id ? "border-primary bg-secondary shadow-soft" : "hover:border-lavender hover:bg-muted"}`}>
                    <span className="block text-sm font-bold">{l.label}</span>
                    <span className="block text-xs text-muted-foreground">{l.hint}</span>
                  </button>
                ))}
                {logo && <p className="col-span-full text-xs text-muted-foreground">Locked to H while a logo is placed — remove the logo to change it.</p>}
              </div>
            )}
          </div>
        </div>

        {/* step 3: download */}
        <div className="grid content-start justify-items-center gap-4 rounded-3xl border bg-muted/50 p-6">
          <StepHead n={3} title="Download your QR" />
          <div className="rounded-2xl bg-card p-4 shadow-elegant">
            <canvas ref={canvasRef} className="w-56 rounded-lg" aria-label="QR code preview" />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <DownloadBtn onClick={downloadPng}>PNG</DownloadBtn>
            <Btn variant="ghost" onClick={() => { if (plainSvg) void downloadSvg(); }} disabled={!plainSvg}>SVG</Btn>
          </div>
          {!plainSvg && <p className="text-center text-xs text-muted-foreground">SVG export is available for the classic square style without a frame or logo.</p>}
          <p className="text-center text-xs text-muted-foreground">Updates live as you type — scan it with your phone to test.</p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------- Favicon ---------- */
const SIZES = [16, 32, 48, 180, 192, 512];
export function FaviconGenerator() {
  const [icons, setIcons] = useState<{ s: number; blob: Blob; url: string }[]>([]);
  const [radius, setRadius] = useState(20);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [sampling, setSampling] = useState(false);
  useEffect(() => {
    if (!img) return;
    Promise.all(SIZES.map(async (s) => {
      const c = document.createElement("canvas"); c.width = c.height = s;
      const ctx = c.getContext("2d")!;
      const r = (radius / 100) * s * 0.5;
      ctx.beginPath(); ctx.roundRect(0, 0, s, s, r); ctx.clip();
      const m = Math.min(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, s, s);
      const blob = await canvasBlob(c, "image/png");
      return { s, blob, url: URL.createObjectURL(blob) };
    })).then(setIcons);
  }, [img, radius]);
  const zip = async () => {
    const z = new JSZip();
    icons.forEach((i) => z.file(i.s === 180 ? "apple-touch-icon.png" : `favicon-${i.s}x${i.s}.png`, i.blob));
    z.file("snippet.html", `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">`);
    download(await z.generateAsync({ type: "blob" }), "favicons.zip");
  };
  return (
    <Panel>
      <Dropzone accept="image/*" label="Drop your logo (square works best)" onFiles={async ([f]) => f && setImg(await loadImage(f))}
        sample={{ label: "Try a sample logo", busy: sampling, onPick: async () => { setSampling(true); setImg(await loadImage(await loadSample("logo"))); setSampling(false); } }} />
      {icons.length > 0 && (
        <>
          <div className="flex items-center gap-3 rounded-t-xl border bg-muted px-3 py-2 text-sm">
            <img src={icons[0]?.url} alt="" className="h-4 w-4" /><span className="font-medium">Your Site — Home</span><span className="ml-auto text-muted-foreground">tab preview</span>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            {icons.map((i) => (
              <div key={i.s} className="flex flex-col items-center gap-1">
                <img src={i.url} alt="" style={{ width: Math.min(i.s, 96), height: Math.min(i.s, 96) }} className="shadow-soft" />
                <span className="text-xs text-muted-foreground">{i.s}px</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <Field label={`Corner rounding ${radius}%`}><input type="range" min={0} max={100} value={radius} onChange={(e) => setRadius(+e.target.value)} className={rangeCls} /></Field>
            <DownloadBtn onClick={zip}>Download icon pack</DownloadBtn>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ---------- PDF Merger & Splitter ---------- */
const parseRanges = (s: string, max: number) => {
  const pages: number[] = [];
  s.split(",").forEach((part) => {
    const [a, b] = part.trim().split("-").map((x) => parseInt(x, 10));
    if (!a) return;
    for (let p = a; p <= (b || a); p++) if (p >= 1 && p <= max) pages.push(p - 1);
  });
  return pages;
};
/** Dummy PDFs built in-browser so the PDF tool can be tried without a real file. */
async function dummyPdf(title: string, pages: number, name: string) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 1; i <= pages; i++) {
    const p = doc.addPage([595, 842]);
    p.drawText(title, { x: 56, y: 762, size: 22, font: bold, color: rgb(0.3, 0.02, 0.52) });
    p.drawText(`Page ${i} of ${pages}`, { x: 56, y: 726, size: 12, font, color: rgb(0.35, 0.35, 0.35) });
    p.drawText("A dummy document created in your browser so you can try this tool.", { x: 56, y: 690, size: 12, font });
    p.drawText("Marvedge Tools · marvedge.com", { x: 56, y: 60, size: 10, font, color: rgb(0.5, 0.5, 0.5) });
  }
  const bytes = await doc.save();
  return new File([bytes as Uint8Array<ArrayBuffer>], name, { type: "application/pdf" });
}
export function PdfTool() {
  const [mode, setMode] = useState<"merge" | "split">("merge");
  const [files, setFiles] = useState<{ file: File; pages: number }[]>([]);
  const [range, setRange] = useState("1-2");
  const [busy, setBusy] = useState(false);
  const [sampling, setSampling] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const add = async (fs: File[]) => {
    setErr(null);
    try {
      const loaded = await Promise.all(fs.map(async (file) => ({ file, pages: (await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })).getPageCount() })));
      setFiles((prev) => (mode === "split" ? loaded.slice(0, 1) : [...prev, ...loaded]));
    } catch { setErr("One of those files couldn't be read as a PDF."); }
  };
  const move = (i: number, d: number) => setFiles((f) => { const n = [...f]; const [x] = n.splice(i, 1); if (x) n.splice(i + d, 0, x); return n; });
  const run = async () => {
    setBusy(true); setErr(null);
    try {
      const out = await PDFDocument.create();
      if (mode === "merge") {
        for (const { file } of files) {
          const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
          (await out.copyPages(src, src.getPageIndices())).forEach((p) => out.addPage(p));
        }
      } else {
        const src = await PDFDocument.load(await files[0]!.file.arrayBuffer(), { ignoreEncryption: true });
        const idx = parseRanges(range, src.getPageCount());
        if (!idx.length) throw new Error("Enter page numbers like 1-3, 5");
        (await out.copyPages(src, idx)).forEach((p) => out.addPage(p));
      }
      download(new Blob([(await out.save()) as Uint8Array<ArrayBuffer>], { type: "application/pdf" }), mode === "merge" ? "merged.pdf" : "extracted-pages.pdf");
    } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong."); }
    setBusy(false);
  };
  return (
    <Panel>
      <div className="flex gap-2">
        {(["merge", "split"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setFiles([]); }} className={`rounded-full border px-4 py-2 text-sm font-bold capitalize ${mode === m ? "bg-gradient-primary text-primary-foreground" : "hover:bg-secondary"}`}>{m === "merge" ? "Merge PDFs" : "Split / extract pages"}</button>
        ))}
      </div>
      <Dropzone accept="application/pdf" multiple={mode === "merge"} label={mode === "merge" ? "Drop PDFs to merge" : "Drop a PDF to split"} onFiles={add}
        sample={{ label: mode === "merge" ? "Try two sample PDFs" : "Try a sample PDF", busy: sampling, onPick: async () => { setSampling(true); await add(mode === "merge" ? [await dummyPdf("Quarterly Report", 3, "quarterly-report.pdf"), await dummyPdf("Invoice #1042", 2, "invoice-1042.pdf")] : [await dummyPdf("Project Handbook", 4, "handbook.pdf")]); setSampling(false); } }} />
      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border p-3 text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-bold text-primary">{i + 1}</span>
              <span className="flex-1 font-semibold">{f.file.name}</span><span className="text-muted-foreground">{f.pages} pages</span>
              {mode === "merge" && <>
                <button disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 hover:bg-secondary disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button disabled={i === files.length - 1} onClick={() => move(i, 1)} className="rounded p-1 hover:bg-secondary disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              </>}
              <button onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} className="rounded p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
          ))}
          {mode === "split" && <Field label="Pages to extract" hint="e.g. 1-3, 5, 8-10"><input className={inputCls} value={range} onChange={(e) => setRange(e.target.value)} /></Field>}
          <div><Btn busy={busy} disabled={mode === "merge" && files.length < 2} onClick={run}>{mode === "merge" ? `Merge ${files.length} PDFs` : "Extract pages"}</Btn></div>
        </div>
      )}
      <ErrorNote msg={err} />
    </Panel>
  );
}
