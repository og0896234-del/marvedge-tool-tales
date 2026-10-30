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
    case "gif-compressor":
      return (
        <div className="flex flex-col items-center gap-4">
          <div className={`h-36 w-48 ${Box}`} style={a("shrink 3.5s ease-in-out infinite")} />
          <div className="font-display text-sm font-bold text-primary">4.2 MB → 380 KB</div>
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
      return (
        <div className={`relative h-48 w-64 ${Soft}`}>
          <div className="absolute rounded-md border-2 border-dashed border-primary bg-primary/15" style={a("crop 5s ease-in-out infinite")} />
        </div>
      );
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
