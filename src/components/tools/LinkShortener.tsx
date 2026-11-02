import { useState } from "react";
import { createShortLink } from "@/lib/links.functions";
import { Btn, CopyBtn, ErrorNote, Field, Panel, inputCls } from "./ui";

const EXPIRY = [
  { label: "Never", h: 0 },
  { label: "1 hour", h: 1 },
  { label: "24 hours", h: 24 },
  { label: "7 days", h: 168 },
  { label: "30 days", h: 720 },
  { label: "Custom date", h: -1 },
];

export function LinkShortener() {
  const [url, setUrl] = useState("https://marvedge.com/");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [exp, setExp] = useState(0);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<{ link: string; note: string } | null>(null);

  const go = async () => {
    setErr(null); setOut(null);
    const h = EXPIRY[exp]?.h ?? 0;
    let expiresAt: string | undefined;
    if (h > 0) expiresAt = new Date(Date.now() + h * 3600e3).toISOString();
    if (h === -1) {
      if (!custom) return setErr("Pick an expiry date.");
      const d = new Date(custom);
      if (d <= new Date()) return setErr("The expiry must be in the future.");
      expiresAt = d.toISOString();
    }
    setBusy(true);
    try {
      const r = await createShortLink({ data: { url: url.trim(), code: code.trim() || undefined, password: pw || undefined, expiresAt } });
      if (!r.ok) return setErr(r.error);
      setOut({
        link: `${window.location.origin}/go/${r.code}`,
        note: [pw && "Password protected", expiresAt ? `Expires ${new Date(expiresAt).toLocaleString()}` : "Never expires"].filter(Boolean).join(" · "),
      });
    } catch (e) {
      setErr(e instanceof Error && e.message.includes("[") ? "Check the link and custom name (3–40 letters, numbers, - or _; password at least 4 characters)." : "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><Field label="Long link"><input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></Field></div>
        <Field label="Custom link (optional)" hint="Letters, numbers, - or _">
          <div className="flex items-center rounded-xl border bg-background pl-3 text-sm text-muted-foreground">
            /go/<input className="w-full bg-transparent px-1 py-2.5 text-foreground outline-none" value={code} onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9_-]/g, ""))} placeholder="summer-sale" />
          </div>
        </Field>
        <Field label="Password (optional)" hint="Visitors must enter it to open the link">
          <input type="password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Leave empty for public" />
        </Field>
        <Field label="Expiration">
          <select className={inputCls} value={exp} onChange={(e) => setExp(+e.target.value)}>
            {EXPIRY.map((x, i) => <option key={x.label} value={i}>{x.label}</option>)}
          </select>
        </Field>
        {EXPIRY[exp]?.h === -1 && <Field label="Expires on"><input type="datetime-local" className={inputCls} value={custom} onChange={(e) => setCustom(e.target.value)} /></Field>}
      </div>
      <div className="mt-5"><Btn onClick={go} busy={busy} disabled={!url}>Shorten link</Btn></div>
      <ErrorNote msg={err} />
      {out && (
        <div className="mt-5 rounded-2xl border border-lavender bg-secondary p-4">
          <div className="flex flex-wrap items-center gap-3">
            <a href={out.link} target="_blank" rel="noreferrer" className="break-all font-display text-lg font-bold text-primary">{out.link}</a>
            <CopyBtn text={out.link} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{out.note}</p>
        </div>
      )}
    </Panel>
  );
}
