import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CalendarClock, ClipboardPaste, Link2, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { createShortLink } from "@/lib/links.functions";
import { CopyBtn, ErrorNote } from "./ui";

const EXPIRY = [
  { label: "1 hour", h: 1 },
  { label: "24 hours", h: 24 },
  { label: "7 days", h: 168 },
  { label: "30 days", h: 720 },
  { label: "Custom date", h: -1 },
];

type Opt = "custom" | "password" | "expiry" | "qr";
const OPTS: { id: Opt; label: string; Icon: typeof Link2 }[] = [
  { id: "custom", label: "Custom Link", Icon: Link2 },
  { id: "password", label: "Password Protection", Icon: ShieldCheck },
  { id: "expiry", label: "Set Expiration", Icon: CalendarClock },
  { id: "qr", label: "Generate QR Code", Icon: QrCode },
];

const field = "w-full rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:border-lavender";

export function LinkShortener() {
  const [url, setUrl] = useState("");
  const [on, setOn] = useState<Record<Opt, boolean>>({ custom: false, password: false, expiry: false, qr: false });
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [exp, setExp] = useState(1);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<{ link: string; note: string } | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (out && on.qr) QRCode.toDataURL(out.link, { width: 360, margin: 1, color: { dark: "#4C0585", light: "#FFFDFE" } }).then(setQr);
    else setQr(null);
  }, [out, on.qr]);

  const paste = async () => {
    try { setUrl((await navigator.clipboard.readText()).trim()); } catch { setErr("Your browser blocked pasting — press Ctrl+V in the box instead."); }
  };

  const go = async () => {
    setErr(null); setOut(null);
    let expiresAt: string | undefined;
    if (on.expiry) {
      const h = EXPIRY[exp]?.h ?? 0;
      if (h > 0) expiresAt = new Date(Date.now() + h * 3600e3).toISOString();
      else {
        if (!custom) return setErr("Pick an expiry date.");
        const d = new Date(custom);
        if (d <= new Date()) return setErr("The expiry must be in the future.");
        expiresAt = d.toISOString();
      }
    }
    const password = on.password && pw ? pw : undefined;
    setBusy(true);
    try {
      const r = await createShortLink({ data: { url: url.trim(), code: (on.custom && code.trim()) || undefined, password, expiresAt } });
      if (!r.ok) return setErr(r.error);
      setOut({
        link: `${window.location.origin}/go/${r.code}`,
        note: [password && "Password protected", expiresAt ? `Expires ${new Date(expiresAt).toLocaleString()}` : "Never expires"].filter(Boolean).join(" · "),
      });
    } catch (e) {
      setErr(e instanceof Error && e.message.includes("[") ? "Check the link and custom name (3–40 letters, numbers, - or _; password at least 4 characters)." : "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-xl md:p-8">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-2 pl-4">
          <input
            className="min-w-0 flex-1 bg-transparent py-2 text-primary-foreground placeholder:text-primary-foreground/50 outline-none"
            value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && url && go()}
            placeholder="Paste your URL here… (e.g. https://mysite.com/very-long-link)"
          />
          <button onClick={paste} className="inline-flex items-center gap-1.5 rounded-lg bg-lavender/25 px-3 py-2 text-sm font-medium hover:bg-lavender/40">
            <ClipboardPaste className="h-4 w-4" /> Paste
          </button>
        </div>
        <button onClick={go} disabled={!url || busy}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lavender px-7 py-4 font-display font-bold text-primary transition hover:brightness-105 disabled:opacity-50">
          <Sparkles className="h-5 w-5" /> {busy ? "Shortening…" : "Shorten Now"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {OPTS.map(({ id, label, Icon }) => (
          <button key={id} aria-pressed={on[id]} onClick={() => setOn((s) => ({ ...s, [id]: !s[id] }))}
            className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-sm font-semibold transition ${on[id] ? "border-lavender bg-lavender/20" : "border-primary-foreground/20 hover:border-lavender/60"}`}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${on[id] ? "bg-lavender text-primary" : "bg-primary-foreground/10"}`}><Icon className="h-5 w-5" /></span>
            {label}
          </button>
        ))}
      </div>

      {(on.custom || on.password || on.expiry) && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {on.custom && (
            <label className="text-sm">Custom name
              <div className={`mt-1 flex items-center ${field}`}>/go/<input className="w-full bg-transparent px-1 outline-none" value={code} onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9_-]/g, ""))} placeholder="summer-sale" /></div>
            </label>
          )}
          {on.password && (
            <label className="text-sm">Password
              <input type="password" className={`mt-1 ${field}`} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 4 characters" />
            </label>
          )}
          {on.expiry && (
            <label className="text-sm">Expires after
              <select className={`mt-1 ${field}`} value={exp} onChange={(e) => setExp(+e.target.value)}>
                {EXPIRY.map((x, i) => <option key={x.label} value={i} className="text-foreground">{x.label}</option>)}
              </select>
              {EXPIRY[exp]?.h === -1 && <input type="datetime-local" className={`mt-2 ${field}`} value={custom} onChange={(e) => setCustom(e.target.value)} />}
            </label>
          )}
        </div>
      )}

      <ErrorNote msg={err} />
      {out && (
        <div className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl bg-background p-4 text-foreground">
          {qr && <a href={qr} download="short-link-qr.png"><img src={qr} alt="QR code for your short link" className="h-28 w-28 rounded-lg" /></a>}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <a href={out.link} target="_blank" rel="noreferrer" className="break-all font-display text-lg font-bold text-primary">{out.link}</a>
              <CopyBtn text={out.link} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{out.note}{qr && " · Tap the QR code to download"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
