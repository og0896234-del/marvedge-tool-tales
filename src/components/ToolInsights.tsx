import { AudioLines, Clapperboard, FileText, Frame, Maximize2, Palette, Quote, Repeat2, ScanQrCode, ShoppingBag, Sparkles, ListOrdered, Type, type LucideIcon } from "lucide-react";
import { toolInsights, type InsightArt } from "@/lib/tool-insights";
import type { Tool } from "@/lib/tools";

const artIcons: Record<InsightArt, LucideIcon> = {
  loop: Repeat2, palette: Palette, resize: Maximize2, scan: ScanQrCode,
  film: Clapperboard, file: FileText, spark: Sparkles, voice: AudioLines,
  text: Type, steps: ListOrdered, shop: ShoppingBag, frame: Frame,
};

function InsightVector({ art, quote }: { art: InsightArt; quote: boolean }) {
  const Icon = artIcons[art];
  return (
    <svg viewBox="0 0 160 112" className="h-28 w-40 shrink-0 text-primary" aria-hidden="true">
      <path d="M22 83h116M34 91h92" stroke="currentColor" strokeWidth="2" opacity=".12" />
      <g className="insight-vector-float">
        <rect x="43" y="18" width="72" height="68" rx="8" className="fill-secondary stroke-lavender" strokeWidth="2" transform="rotate(-8 79 52)" />
        <rect x="47" y="15" width="72" height="68" rx="8" className="fill-background" stroke="currentColor" strokeWidth="2" transform="rotate(5 83 49)" />
        <Icon x="63" y="30" width="40" height="40" strokeWidth="1.6" />
      </g>
      <path d="M24 28v12m-6-6h12M133 63v12m-6-6h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m128 17 3 6 6 3-6 3-3 6-3-6-6-3 6-3z" className="fill-lavender" />
      {quote ? <Quote x="19" y="61" width="21" height="21" className="fill-lavender stroke-primary" /> : <path d="m24 67 5 5 9-11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export function ToolInsights({ tool }: { tool: Tool }) {
  const insights = toolInsights[tool.slug];
  if (!insights) return null;
  return (
    <section aria-labelledby="tool-insights-heading" className="border-y bg-muted/60">
      <div className="mx-auto max-w-7xl px-5 py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Small facts. Big personality.</p>
            <h2 id="tool-insights-heading" className="text-3xl font-extrabold">A little {tool.category === "AI tool" ? "AI" : "file"} lore, a little laughter.</h2>
          </div>
          <span className="text-sm text-muted-foreground">The {tool.name} edition</span>
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          {insights.map((insight, index) => (
            <article key={insight.title} className={`group overflow-hidden rounded-lg border p-6 ${insight.kind === "quote" ? "bg-secondary md:col-span-3" : "bg-card md:col-span-2"}`}>
              <div className="flex items-start justify-between gap-2">
                <InsightVector art={insight.art} quote={insight.kind === "quote"} />
                <span className="pt-2 font-display text-sm font-bold text-muted-foreground">0{index + 1}</span>
              </div>
              <p className="mb-2 mt-3 text-xs font-bold uppercase tracking-widest text-primary">{insight.kind === "fact" ? "Did you know?" : "A Marvedge one-liner"}</p>
              <h3 className="text-lg font-bold">{insight.title}</h3>
              {insight.kind === "quote" ? <blockquote className="mt-3 font-display text-xl font-semibold leading-relaxed">“{insight.text}”</blockquote> : <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{insight.text}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}