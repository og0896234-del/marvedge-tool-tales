import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Lock } from "lucide-react";
import { getTool, MARVEDGE_URL, type Tool } from "@/lib/tools";
import { ToolAnimation } from "./ToolAnimation";
import { ToolWorkspace } from "./tools/registry";
import { ToolInsights } from "./ToolInsights";

export function ToolPage({ tool }: { tool: Tool }) {
  return (
    <div className="bg-hero">
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="animate-fade-up">
            <span className="inline-flex rounded-full border bg-card px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              {tool.category === "AI tool" ? "AI-powered · free" : "100% free · runs in your browser"}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              {tool.name} <span className="text-gradient">— {tool.headline[1].toLowerCase()}</span>
            </h1>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">{tool.story[0]} {tool.story[1]}</p>
          </div>
          <div className="hidden scale-90 lg:block"><ToolAnimation slug={tool.slug} /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10">
        <ToolWorkspace slug={tool.slug} />
      </section>

      <ToolInsights tool={tool} />

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-10">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[2rem] bg-band p-8 text-primary-foreground shadow-elegant md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">{tool.story[2]}</p>
            <h2 className="mt-2 text-3xl font-extrabold">Want to enjoy the full potential?</h2>
            <p className="mt-2 max-w-xl opacity-85">Turn your product into interactive demos that sell, onboard and explain — with Marvedge.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={MARVEDGE_URL} className="btn-light">Explore Marvedge <ArrowUpRight className="h-5 w-5" /></a>
            <a href={MARVEDGE_URL} className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-5 py-3 font-semibold hover:bg-primary-foreground/10"><Lock className="h-4 w-4" /> Log in</a>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-muted-foreground">Try next:</span>
          {tool.related.map((slug) => {
            const r = getTool(slug);
            return <Link key={slug} to="/$slug" params={{ slug }} className="rounded-full border bg-card px-4 py-2 font-semibold hover:border-lavender hover:text-primary">{r.name} →</Link>;
          })}
        </div>
      </section>
    </div>
  );
}
