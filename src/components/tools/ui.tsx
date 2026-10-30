import { useRef, useState, type ReactNode } from "react";
import { Upload, Download, Copy, Check, Loader2 } from "lucide-react";

export const fmtBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;

export function download(blob: Blob | string, name: string) {
  const url = typeof blob === "string" ? blob : URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  if (typeof blob !== "string") setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function Dropzone({ accept, multiple, onFiles, label }: { accept: string; multiple?: boolean; onFiles: (f: File[]) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${over ? "border-primary bg-secondary" : "border-lavender hover:bg-muted"}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"><Upload className="h-5 w-5" /></span>
      <p className="font-semibold">{label}</p>
      <p className="text-sm text-muted-foreground">Drag & drop or click to choose · processed on your device</p>
      <input ref={ref} type="file" hidden accept={accept} multiple={multiple}
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
export const rangeCls = "w-full accent-primary";

export function Btn({ children, onClick, disabled, busy, variant = "primary" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; busy?: boolean; variant?: "primary" | "ghost" }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || busy}
      className={`${variant === "primary" ? "btn-primary" : "btn-ghost"} disabled:pointer-events-none disabled:opacity-50`}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}{children}
    </button>
  );
}

export function DownloadBtn({ onClick, children = "Download" }: { onClick: () => void; children?: ReactNode }) {
  return <Btn onClick={onClick}><Download className="h-4 w-4" />{children}</Btn>;
}

export function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Btn variant="ghost" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>
      {ok ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{ok ? "Copied" : "Copy"}
    </Btn>
  );
}

export function ErrorNote({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{msg}</p>;
}

export function Panel({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 rounded-3xl border bg-card p-5 shadow-soft md:p-7">{children}</div>;
}

export const loadImage = (file: Blob) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("Could not read that image."));
    img.src = URL.createObjectURL(file);
  });

export const canvasBlob = (c: HTMLCanvasElement, type: string, q?: number) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Export failed"))), type, q));

export const extFor = (mime: string) => ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" })[mime] ?? "img";
export const baseName = (n: string) => n.replace(/\.[^.]+$/, "");
