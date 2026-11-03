import { useEffect, useRef, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { drawQr, rr, type QrCorner, type QrShape } from "@/lib/qr-render";
import { Btn, Field, download, inputCls, rangeCls } from "./ui";

type Item = { id: number; value: string; caption: string; fg: string };
const SWATCHES = ["#4C0585", "#1e1b4b", "#0f766e", "#b45309", "#be123c", "#111111"];
let nextId = 1;

/** Collage mode: several QR codes sharing the designed dot/corner style, laid out in a grid with printer-style borders. */
export function QrCollage({ value, fg, bg, shape, corner, logo }: {
  value: string; fg: string; bg: string; shape: QrShape; corner: QrCorner; logo: HTMLImageElement | null;
}) {
  const [items, setItems] = useState<Item[]>(() => [
    { id: nextId++, value, caption: "Website", fg },
    { id: nextId++, value: "https://marvedge.com/blog", caption: "Blog", fg: "#0f766e" },
    { id: nextId++, value: "mailto:hello@marvedge.com", caption: "Email us", fg: "#be123c" },
    { id: nextId++, value: "tel:+10000000000", caption: "Call", fg: "#1e1b4b" },
  ]);
  const [cols, setCols] = useState(2);
  const [cell, setCell] = useState(320);
  const [gap, setGap] = useState(32);
  const [borderOn, setBorderOn] = useState(true);
  const [borderW, setBorderW] = useState(6);
  const [borderColor, setBorderColor] = useState("#4C0585");
  const [radius, setRadius] = useState(24);
  const [title, setTitle] = useState("Scan to connect");
  const ref = useRef<HTMLCanvasElement>(null);

  const update = (id: number, patch: Partial<Item>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const n = Math.max(1, items.length);
    const cc = Math.min(cols, n);
    const rows = Math.ceil(n / cc);
    const pad = borderOn ? borderW + 14 : 0;
    const capH = 44;
    const boxW = cell + pad * 2;
    const boxH = boxW + capH;
    const top = title ? 90 : gap;
    c.width = cc * boxW + (cc + 1) * gap;
    c.height = top + rows * boxH + rows * gap;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
    if (title) {
      ctx.fillStyle = fg; ctx.font = "800 40px 'Plus Jakarta Sans', sans-serif"; ctx.textAlign = "center";
      ctx.fillText(title, c.width / 2, 60);
    }
    const tmp = document.createElement("canvas");
    items.forEach((it, i) => {
      const x = gap + (i % cc) * (boxW + gap);
      const y = top + Math.floor(i / cc) * (boxH + gap);
      if (borderOn) {
        ctx.strokeStyle = borderColor; ctx.lineWidth = borderW;
        rr(ctx, x + borderW / 2, y + borderW / 2, boxW - borderW, boxW - borderW, radius); ctx.stroke();
      }
      if (it.value.trim()) {
        try {
          drawQr(tmp, it.value, { fg: it.fg, bg, size: cell, level: logo ? "H" : "Q", shape, corner, frame: "none", logo });
          ctx.drawImage(tmp, x + pad, y + pad, cell, cell);
        } catch { /* skip invalid */ }
      }
      if (it.caption) {
        ctx.fillStyle = it.fg; ctx.font = "700 24px Inter, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(it.caption, x + boxW / 2, y + boxW + 32);
      }
    });
  }, [items, cols, cell, gap, borderOn, borderW, borderColor, radius, title, bg, fg, shape, corner, logo]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="grid content-start gap-6">
        <div className="grid gap-3">
          <span className="text-sm font-semibold">Codes in the collage · {items.length}</span>
          {items.map((it) => (
            <div key={it.id} className="grid items-center gap-2 rounded-2xl border bg-card p-3 sm:grid-cols-[1fr_140px_auto_auto]">
              <input className={inputCls} value={it.value} onChange={(e) => update(it.id, { value: e.target.value })} placeholder="https://…" aria-label="QR content" />
              <input className={inputCls} value={it.caption} onChange={(e) => update(it.id, { caption: e.target.value })} placeholder="Caption" aria-label="Caption" />
              <input type="color" value={it.fg} onChange={(e) => update(it.id, { fg: e.target.value })} aria-label="Code color" className="h-10 w-12 cursor-pointer rounded-lg border" />
              <button onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))} disabled={items.length <= 1} aria-label="Remove code"
                className="grid h-10 w-10 place-items-center rounded-lg border hover:bg-secondary disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setItems((xs) => [...xs, { id: nextId++, value, caption: "", fg }])} disabled={items.length >= 24}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold hover:bg-secondary"><Plus className="h-4 w-4" />Add my designed code</button>
            <button onClick={() => setItems((xs) => [...xs, { id: nextId++, value: "", caption: "", fg }])} disabled={items.length >= 24}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold hover:bg-secondary"><Plus className="h-4 w-4" />Add blank</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={`Columns · ${cols}`}><input type="range" min={1} max={6} value={cols} onChange={(e) => setCols(+e.target.value)} className={rangeCls} /></Field>
          <Field label={`Code size · ${cell}px`}><input type="range" min={160} max={600} step={20} value={cell} onChange={(e) => setCell(+e.target.value)} className={rangeCls} /></Field>
          <Field label={`Gap · ${gap}px`}><input type="range" min={0} max={80} step={4} value={gap} onChange={(e) => setGap(+e.target.value)} className={rangeCls} /></Field>
        </div>

        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={borderOn} onChange={(e) => setBorderOn(e.target.checked)} className="accent-primary" /> Border around each code
          </label>
          {borderOn && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`Thickness · ${borderW}px`}><input type="range" min={2} max={20} value={borderW} onChange={(e) => setBorderW(+e.target.value)} className={rangeCls} /></Field>
              <Field label={`Corner radius · ${radius}px`}><input type="range" min={0} max={60} value={radius} onChange={(e) => setRadius(+e.target.value)} className={rangeCls} /></Field>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Border color:</span>
                {SWATCHES.map((c) => (
                  <button key={c} aria-label={`Border color ${c}`} onClick={() => setBorderColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition ${borderColor === c ? "scale-110 border-primary ring-2 ring-ring/40" : "border-transparent hover:scale-105"}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          )}
          <Field label="Collage title (optional)"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        </div>
      </div>

      <div className="grid content-start justify-items-center gap-4 rounded-3xl border bg-muted/50 p-6">
        <h3 className="font-display text-lg font-bold">Collage preview</h3>
        <canvas ref={ref} className="h-auto max-w-full rounded-lg shadow-elegant" />
        <p className="text-center text-xs text-muted-foreground">Uses the dot and corner style from the Design tab.</p>
        <Btn onClick={() => ref.current && download(ref.current.toDataURL("image/png"), "qr-collage.png")}><Download className="h-4 w-4" />Download collage PNG</Btn>
      </div>
    </div>
  );
}
