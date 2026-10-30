import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, AudioLines, Clapperboard, FileText, Frame, Maximize2, Palette, Quote, Repeat2, ScanQrCode, ShoppingBag, Sparkles, ListOrdered, Type, type LucideIcon } from "lucide-react";
import { toolInsights, type InsightArt } from "@/lib/tool-insights";
import type { Tool } from "@/lib/tools";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

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
  const [api, setApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!api) return;
    const update = () => setActive(api.selectedScrollSnap());
    update();
    api.on("select", update);
    return () => { api.off("select", update); };
  }, [api]);

  useEffect(() => {
    if (!api || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) api.scrollNext();
    }, 4500);
    return () => window.clearInterval(timer);
  }, [api, paused, reducedMotion, active]);

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
        <Carousel setApi={setApi} opts={{ loop: true, duration: reducedMotion ? 0 : 45 }} aria-label={`${tool.name} facts and quotes`}>
          <CarouselContent>
          {insights.map((insight, index) => (
            <CarouselItem key={insight.title} aria-hidden={active !== index} aria-label={`${index + 1} of ${insights.length}`}>
            <article className={`group relative flex min-h-96 flex-col justify-center gap-4 overflow-hidden rounded-lg border p-6 md:min-h-72 md:flex-row md:items-center md:gap-10 md:p-10 ${insight.kind === "quote" ? "bg-secondary" : "bg-card"}`}>
              <div className="flex shrink-0 items-center justify-center">
                <InsightVector art={insight.art} quote={insight.kind === "quote"} />
              </div>
              <span className="absolute right-6 top-6 font-display text-sm font-bold text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 max-w-2xl flex-1">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{insight.kind === "fact" ? "Did you know?" : "A Marvedge one-liner"}</p>
                <h3 className="text-xl font-bold md:text-2xl">{insight.title}</h3>
                {insight.kind === "quote" ? <blockquote className="mt-3 font-display text-xl font-semibold leading-relaxed md:text-2xl">“{insight.text}”</blockquote> : <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{insight.text}</p>}
              </div>
            </article>
            </CarouselItem>
          ))}
          </CarouselContent>
          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-sm font-medium tabular-nums text-muted-foreground">{String(active + 1).padStart(2, "0")} / {String(insights.length).padStart(2, "0")}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Previous fact" title="Previous fact" onClick={() => api?.scrollPrev()}><ArrowLeft /></Button>
              <Button variant="outline" size="icon" aria-label={paused || reducedMotion ? "Play facts" : "Pause facts"} title={paused || reducedMotion ? "Play facts" : "Pause facts"} disabled={reducedMotion} onClick={() => setPaused(!paused)}>{paused || reducedMotion ? <Play /> : <Pause />}</Button>
              <Button variant="outline" size="icon" aria-label="Next fact" title="Next fact" onClick={() => api?.scrollNext()}><ArrowRight /></Button>
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
}