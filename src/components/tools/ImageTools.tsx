import { useEffect, useState } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { AlertTriangle, ArrowDown, ArrowUp, Check, Globe, IdCard, Loader2, Mail, Phone, Type, Wifi, X } from "lucide-react";
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
  const [png, setPng] = useState("");

  const value =
    type === "wifi" ? `WIFI:T:${enc};S:${ssid};P:${pass};;`
    : type === "email" ? `mailto:${mailTo}?subject=${encodeURIComponent(mailSub)}&body=${encodeURIComponent(mailBody)}`
    : type === "phone" ? `tel:${phone.replace(/[^+\d]/g, "")}`
    : type === "vcard" ? ["BEGIN:VCARD", "VERSION:3.0", `FN:${vName}`, vOrg && `ORG:${vOrg}`, vTel && `TEL:${vTel}`, vMail && `EMAIL:${vMail}`, vUrl && `URL:${vUrl}`, "END:VCARD"].filter(Boolean).join("\n")
    : text;
  const opts = { width: size, margin: 2, color: { dark: fg, light: bg }, errorCorrectionLevel: level };
  useEffect(() => { if (value.trim()) QRCode.toDataURL(value, opts).then(setPng).catch(() => setPng("")); }, [value, fg, bg, size, level]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <div className="grid gap-3">
              <span className="text-sm font-semibold">Error-correction level</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {QR_LEVELS.map((l) => (
                  <button key={l.id} onClick={() => setLevel(l.id)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${level === l.id ? "border-primary bg-secondary shadow-soft" : "hover:border-lavender hover:bg-muted"}`}>
                    <span className="block text-sm font-bold">{l.label}</span>
                    <span className="block text-xs text-muted-foreground">{l.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* step 3: download */}
        <div className="grid content-start justify-items-center gap-4 rounded-3xl border bg-muted/50 p-6">
          <StepHead n={3} title="Download your QR" />
          <div className="rounded-2xl bg-card p-4 shadow-elegant">
            {png ? <img src={png} alt="QR code preview" className="w-56 rounded-lg" /> : <div className="h-56 w-56 rounded-lg bg-muted" />}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <DownloadBtn onClick={() => download(png, "qr-code.png")}>PNG</DownloadBtn>
            <Btn variant="ghost" onClick={async () => download(new Blob([await QRCode.toString(value, { ...opts, type: "svg" })], { type: "image/svg+xml" }), "qr-code.svg")}>SVG</Btn>
          </div>
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
