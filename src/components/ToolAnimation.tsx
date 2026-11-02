import type { CSSProperties, ReactNode } from "react";

const Stage = ({ children }: { children: ReactNode }) => (
  <div className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-3xl border bg-card grid-dots shadow-elegant">
    {children}
  </div>
);
const Box = "rounded-xl bg-gradient-primary shadow-soft";
const Soft = "rounded-lg bg-lavender/70";
const a = (v: string): CSSProperties => ({ animation: v });

function Anim({ slug }: { slug: string }) {
  switch (slug) {
    case "mp4-to-gif":
      return (
        <div className="relative w-64 overflow-hidden rounded-xl border-4 border-primary">
          <div className="flex w-max" style={a("slide-x 4s linear infinite")}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`m-1 h-24 w-16 ${i % 2 ? Box : Soft}`} />
            ))}
          </div>
          <span className="absolute right-2 top-2 rounded-full bg-background px-2 text-xs font-bold text-primary">GIF ∞</span>
        </div>
      );
    case "image-compressor":
      return (
        <div className="flex flex-col items-center gap-4">
          <div className={`h-36 w-48 ${Box}`} style={a("shrink 3.5s ease-in-out infinite")} />
          <div className="font-display text-sm font-bold text-primary">4.2 MB → 380 KB</div>
        </div>
      );
    case "gif-compressor":
      return <GifSqueeze />;
    case "link-shortener":
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-background px-4 py-2 text-xs font-semibold text-muted-foreground shadow-soft" style={a("ls-long 8s ease-in-out infinite")}>marvedge.com/a-very-long-link?utm=…</div>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden style={a("ls-arrow 8s ease-in-out infinite")}>
            <path d="M2 2 L9 9 L16 2" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="relative flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-soft" style={a("ls-card 8s ease-in-out infinite")}>
            <div className="flex items-center gap-1" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-primary opacity-0"
                  style={{ ...a("ls-dot 8s ease-out infinite"), animationDelay: `${2.0 + i * 0.18}s` }} />
              ))}
            </div>
            <div className="relative h-10 w-9" aria-hidden>
              <div className="absolute left-[6px] top-0 h-5 w-6 rounded-t-full border-[3px] border-b-0 border-primary"
                style={{ ...a("ls-shackle 8s ease-in-out infinite"), transformOrigin: "100% 100%" }} />
              <div className="absolute bottom-0 left-0 flex h-6 w-9 items-center justify-center rounded-md bg-gradient-primary"
                style={a("ls-lockbody 8s ease-in-out infinite")}>
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              </div>
            </div>
            <span className="relative font-display font-bold text-primary">/go/sale
              <span className="absolute left-0 top-1/2 -mt-[1px] h-[2px] w-full origin-left rounded bg-destructive" style={a("ls-strike 8s ease-out infinite")} />
            </span>
            <div className="relative h-11 w-11" aria-hidden style={a("ls-clock 8s ease-in-out infinite")}>
              <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="var(--lavender)" strokeWidth="4" />
                <circle cx="22" cy="22" r="18" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray="113" style={a("ls-ring 8s linear infinite")} />
              </svg>
              <div className="absolute bottom-1/2 left-1/2 h-3.5 w-[2px] -ml-[1px] origin-bottom rounded-full bg-primary" style={a("spin-slow 1.6s linear infinite")} />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-center">
              <div className="rounded-md border-2 border-destructive bg-background px-1.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wide text-destructive shadow-soft"
                style={a("ls-stamp 8s ease-out infinite")}>expired</div>
            </div>
          </div>
          <div className="relative w-60" style={a("ls-meta 8s ease-in-out infinite")}>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full origin-left rounded-full" style={a("ls-bar 8s linear infinite")} />
            </div>
            <div className="relative mt-1.5 h-4 text-[11px] font-semibold">
              <span className="absolute inset-0 flex items-center justify-between text-muted-foreground" style={a("ls-lbl-out 8s ease-in-out infinite")}>
                <span>Expires in 24h</span><span>Password protected</span>
              </span>
              <span className="absolute inset-0 flex items-center justify-between text-destructive" style={a("ls-lbl-in 8s ease-in-out infinite")}>
                <span>Expired</span><span>Link disabled</span>
              </span>
            </div>
          </div>
        </div>
      );
    case "qr-code-generator":
      return (
        <div className="grid grid-cols-7 gap-1 rounded-2xl bg-background p-3 shadow-soft">
          {Array.from({ length: 49 }).map((_, i) => (
            <div key={i} className={`h-5 w-5 rounded-sm ${(i * 7 + (i % 3)) % 5 < 2 ? "bg-primary" : "bg-secondary"}`}
              style={a(`pop 3s ${(i % 7) * 0.08 + Math.floor(i / 7) * 0.05}s ease-in-out infinite`)} />
          ))}
        </div>
      );
    case "video-compressor":
      return (
        <div className="flex items-center gap-2">
          <div className="h-32 w-3 rounded bg-primary" style={a("bracket-l 3s ease-in-out infinite")} />
          <div className={`flex h-28 w-52 items-center justify-center ${Box}`} style={a("squeeze 3s ease-in-out infinite")}>
            <div className="h-0 w-0 border-y-[14px] border-l-[22px] border-y-transparent border-l-primary-foreground" />
          </div>
          <div className="h-32 w-3 rounded bg-primary" style={a("bracket-r 3s ease-in-out infinite")} />
        </div>
      );
    case "image-resizer":
      return <ResizeAnything />;
    case "image-format-converter":
      return (
        <div className="flex items-center gap-4 font-display text-3xl font-extrabold">
          <span className="text-muted-foreground">.img</span>
          <span className="text-primary">→</span>
          <div className="h-12 overflow-hidden rounded-xl bg-gradient-primary px-4 text-primary-foreground">
            <div style={a("cycle-word 4.5s ease-in-out infinite")}>
              {["JPG", "PNG", "WEBP"].map((w) => <div key={w} className="flex h-12 items-center">{w}</div>)}
            </div>
          </div>
        </div>
      );
    case "pdf-merger":
      return (
        <div className="relative h-44 w-32">
          <div className={`absolute inset-0 ${Soft} border`} style={a("merge-l 3.5s ease-in-out infinite")} />
          <div className="absolute inset-0 rounded-lg border bg-card p-3 shadow-soft" style={a("merge-r 3.5s ease-in-out infinite")}>
            {[80, 60, 90, 50, 70].map((w, i) => <div key={i} className="mb-2 h-2 rounded bg-lavender" style={{ width: `${w}%` }} />)}
          </div>
        </div>
      );
    case "favicon-generator":
      return (
        <div className="flex items-end gap-5">
          {[16, 32, 48, 72].map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={Box} style={{ width: s, height: s, ...a(`float-y 2.4s ${i * 0.2}s ease-in-out infinite`) }} />
              <span className="text-xs font-semibold text-muted-foreground">{s}px</span>
            </div>
          ))}
        </div>
      );
    case "video-aspect-ratio":
      return <div className={Box} style={a("morph 6s ease-in-out infinite")} />;
    case "video-summarizer":
      return (
        <div className="flex gap-6">
          <div className="flex flex-col gap-2">
            {[180, 150, 170, 120, 160, 140].map((w, i) => (
              <div key={i} className="h-2.5 rounded bg-lavender" style={{ ["--w" as string]: `${w}px`, ...a(`collapse 4s ${i * 0.1}s ease-in-out infinite`) }} />
            ))}
          </div>
          <div className="flex flex-col justify-center gap-3">
            {["Key point", "Chapter 2", "Takeaway"].map((t, i) => (
              <div key={t} className="flex items-center gap-2 text-sm font-semibold text-primary" style={a(`reveal 4s ${i * 0.15}s ease-in-out infinite`)}>
                <span className="h-2 w-2 rounded-full bg-primary" />{t}
              </div>
            ))}
          </div>
        </div>
      );
    case "subtitle-generator":
    case "voiceover-generator":
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-24 items-center gap-1.5">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="h-full w-2 origin-center rounded-full bg-gradient-primary" style={a(`eq ${0.8 + (i % 4) * 0.2}s ${i * 0.07}s ease-in-out infinite`)} />
            ))}
          </div>
          <div className="overflow-hidden whitespace-nowrap rounded-md bg-ink px-3 py-1.5 font-semibold text-primary-foreground" style={a("typing 4s steps(28) infinite")}>
            {slug === "voiceover-generator" ? "▶ Welcome to your product tour…" : "“Here's how it works in 3 steps”"}
          </div>
        </div>
      );
    case "youtube-title-generator":
      return (
        <div className="w-64">
          <div className={`flex h-36 items-center justify-center ${Box}`}>
            <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-background">
              <div className="h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-primary" />
            </div>
          </div>
          <div className="mt-3 overflow-hidden whitespace-nowrap font-display font-bold" style={a("typing 4s steps(26) infinite")}>
            I tried this for 30 days…
          </div>
        </div>
      );
    case "content-repurposer":
      return (
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div className={`flex h-16 w-14 items-center justify-center text-xs font-bold text-primary-foreground ${Box}`}>Blog</div>
          {["in", "X", "✉", "IG"].map((l, i) => (
            <div key={l} className="absolute flex h-10 w-10 items-center justify-center rounded-full border bg-card text-sm font-bold text-primary shadow-soft"
              style={a(`orbit 8s ${-i * 2}s linear infinite`)}>{l}</div>
          ))}
        </div>
      );
    case "product-description-generator":
      return (
        <div className="relative">
          <div className={`h-36 w-36 ${Box}`} style={a("float-y 4s ease-in-out infinite")} />
          {[[-20, -10], [140, 10], [120, 130], [-14, 120]].map(([x, y], i) => (
            <span key={i} className="absolute text-2xl text-primary-glow" style={{ left: x, top: y, ...a(`sparkle 2s ${i * 0.5}s ease-in-out infinite`) }}>✦</span>
          ))}
        </div>
      );
    case "screenshot-to-guide":
      return (
        <div className="flex gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="relative h-28 w-24 rounded-lg border bg-card p-2 shadow-soft" style={a(`light-up 3s ${n * 0.6}s ease-in-out infinite`)}>
              <div className="h-12 rounded bg-lavender" />
              <div className="mt-2 h-1.5 w-3/4 rounded bg-secondary" />
              <span className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{n}</span>
            </div>
          ))}
        </div>
      );
    case "demo-script-generator":
      return (
        <div className="grid grid-cols-4 gap-2">
          {["Hook", "Problem", "Demo", "CTA"].map((s, i) => (
            <div key={s} className="flex h-24 w-20 flex-col justify-end rounded-lg bg-gradient-primary p-2 text-xs font-bold text-primary-foreground"
              style={a(`light-up 4s ${i * 0.8}s ease-in-out infinite`)}>
              <span className="opacity-70">0{i + 1}</span>{s}
            </div>
          ))}
        </div>
      );
    default:
      return <div className={`h-24 w-24 ${Box}`} />;
  }
}

export function ToolAnimation({ slug }: { slug: string }) {
  return <Stage><Anim slug={slug} /></Stage>;
}

const RESIZE_ITEMS: { label: string; size: string; w: number; h: number; art: ReactNode }[] = [
  {
    label: "Photo", size: "413×531 px", w: 104, h: 134,
    art: (
      <svg viewBox="0 0 60 78" className="h-full w-full">
        <rect width="60" height="78" rx="4" className="fill-lavender" />
        <circle cx="30" cy="30" r="12" className="fill-primary" />
        <path d="M8 78c0-16 10-26 22-26s22 10 22 26z" className="fill-primary" />
      </svg>
    ),
  },
  {
    label: "Signature", size: "140×60 px", w: 170, h: 74,
    art: (
      <svg viewBox="0 0 140 60" className="h-full w-full">
        <rect width="140" height="60" rx="4" className="fill-card" />
        <path d="M10 40c10-26 18-26 16-4s10-22 18-14-4 20 6 10 12-18 18-6 6 10 16 2 14-8 22-4" className="fill-none stroke-primary" strokeWidth="3" strokeLinecap="round" />
        <path d="M10 50h120" className="stroke-lavender" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Fingerprint", size: "240×240 px", w: 120, h: 120,
    art: (
      <svg viewBox="0 0 60 60" className="h-full w-full">
        <rect width="60" height="60" rx="4" className="fill-card" />
        {[6, 10, 14, 18, 22].map((r) => (
          <path key={r} d={`M${30 - r} 34a${r} ${r + 3} 0 0 1 ${r * 2} 0`} className="fill-none stroke-primary" strokeWidth="2" strokeLinecap="round" />
        ))}
        <path d="M30 34v14" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Document", size: "A4 · 1240×1754", w: 96, h: 136,
    art: (
      <svg viewBox="0 0 60 85" className="h-full w-full">
        <rect width="60" height="85" rx="4" className="fill-card" />
        <rect x="8" y="8" width="24" height="5" rx="2" className="fill-primary" />
        {[20, 27, 34, 41, 48, 55].map((y, i) => <rect key={y} x="8" y={y} width={i % 2 ? 34 : 44} height="3" rx="1.5" className="fill-lavender" />)}
        <rect x="36" y="64" width="16" height="13" rx="2" className="fill-primary/40" />
      </svg>
    ),
  },
];

function ResizeAnything() {
  const cycle = RESIZE_ITEMS.length * 3;
  return (
    <div className="relative h-56 w-72">
      {RESIZE_ITEMS.map((it, i) => (
        <div
          key={it.label}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0"
          style={{ animation: `rz-show ${cycle}s ease-in-out ${i * 3}s infinite both` }}
        >
          <div className="relative" style={{ width: it.w, height: it.h, animation: `rz-size ${cycle}s ease-in-out ${i * 3}s infinite both` }}>
            <div className="h-full w-full overflow-hidden rounded-md border border-lavender shadow-soft">{it.art}</div>
            <div className="absolute -inset-1.5 rounded-lg border-2 border-dashed border-primary" />
            {["-left-2.5 -top-2.5", "-right-2.5 -top-2.5", "-left-2.5 -bottom-2.5", "-right-2.5 -bottom-2.5"].map((c) => (
              <span key={c} className={`absolute h-3 w-3 rounded-sm border-2 border-primary bg-background ${c}`} />
            ))}
          </div>
          <div className="flex items-center gap-2 font-display text-sm font-bold">
            <span className="text-foreground">{it.label}</span>
            <span className="rounded-full bg-gradient-primary px-2.5 py-0.5 text-xs text-primary-foreground">{it.size}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Four stick-figure poses, drawn as one SVG each so the loop can step frame by frame. */
const gifPose = (arms: string, legs: string) => (
  <svg viewBox="0 0 64 80" className="h-full w-full" aria-hidden>
    <circle cx="32" cy="15" r="9" className="fill-primary" />
    <path d="M32 24 L32 50" className="stroke-primary" strokeWidth="5" strokeLinecap="round" />
    <path d={arms} className="fill-none stroke-primary" strokeWidth="4" strokeLinecap="round" />
    <path d={legs} className="fill-none stroke-primary" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const GIF_POSES = [
  gifPose("M32 31 L18 19 M32 31 L46 19", "M32 50 L21 70 M32 50 L43 70"),
  gifPose("M32 31 L15 31 M32 31 L49 31", "M32 50 L27 71 M32 50 L37 71"),
  gifPose("M32 31 L20 44 M32 31 L44 44", "M32 50 L20 66 M32 50 L44 66"),
  gifPose("M32 31 L16 23 M32 31 L48 23", "M32 50 L24 62 M32 50 L40 62"),
];

/** A stat pill whose value slides from the "before" number to the "after" number. */
function GifStat({ from, to, hero }: { from: string; to: string; hero?: boolean }) {
  return (
    <span
      className={`grid place-items-center rounded-full px-3 py-1 font-display text-xs font-bold shadow-soft ${
        hero ? "bg-gradient-primary text-primary-foreground" : "border bg-card text-muted-foreground"
      }`}
    >
      <span className="col-start-1 row-start-1 whitespace-nowrap" style={a("gc-val-out 9s linear infinite")}>{from}</span>
      <span className="col-start-1 row-start-1 whitespace-nowrap opacity-0" style={a("gc-val-in 9s linear infinite")}>{to}</span>
    </span>
  );
}

/** A looping character: four frames, then a sweep drops it to two and the file shrinks. */
function GifSqueeze() {
  const loop = (poses: ReactNode[], steps: number, cls: string, anim: string) => (
    <div className={`absolute inset-x-0 bottom-0 flex justify-center ${cls}`} style={a(anim)}>
      <div className="h-24 w-16 overflow-hidden">
        <div className="flex w-max" style={a(`gc-step${steps} 1.5s steps(${steps}) infinite`)}>
          {poses.map((p, i) => <div key={i} className="h-24 w-16 shrink-0">{p}</div>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="gc-stage flex flex-col items-center gap-4">
      <div className="relative h-32 w-56 overflow-hidden rounded-2xl border bg-card shadow-soft">
        {loop(GIF_POSES, 4, "opacity-100", "gc-rich 9s linear infinite")}
        {loop([GIF_POSES[0], GIF_POSES[2]], 2, "opacity-0", "gc-thin 9s linear infinite")}
        <div className="absolute bottom-3 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-lavender" />
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0" style={a("gc-scan 9s ease-in-out infinite")} />
        <span className="absolute left-3 top-3 rounded-full bg-background px-2 py-0.5 text-[11px] font-bold text-primary shadow-soft">GIF ∞</span>
        <span className="absolute right-3 top-3 rounded-md border-2 border-primary bg-background px-1.5 py-0.5 font-display text-[11px] font-extrabold text-primary opacity-0" style={a("gc-stamp 9s ease-out infinite")}>−81%</span>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="relative h-10 w-8 overflow-hidden rounded border bg-card"
            style={a(`${i % 2 ? "gc-frame-out" : "gc-frame-keep"} 9s ease-in-out ${i * 0.05}s infinite`)}>
            <div className="flex h-full items-center justify-center">
              <div className={`h-5 w-5 rounded-sm ${i % 2 ? "bg-lavender" : "bg-gradient-primary"}`} />
            </div>
            {i % 2 ? (
              <span className="absolute inset-0 grid place-items-center font-display text-sm font-extrabold text-destructive opacity-0" style={a("gc-cross 9s linear infinite")}>×</span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <GifStat from="24 fps" to="10 fps" />
        <GifStat from="256 colours" to="32 colours" />
        <GifStat from="4.8 MB" to="0.9 MB" hero />
      </div>
    </div>
  );
}
