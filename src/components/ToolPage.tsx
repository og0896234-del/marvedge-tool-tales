import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Lock } from "lucide-react";
import { getTool, MARVEDGE_URL, type Tool } from "@/lib/tools";
import { ToolAnimation } from "./ToolAnimation";
import { MarvedgeCTA } from "./MarvedgeCTA";

const chapters = ["The problem", "The moment", "The payoff"];

export function ToolPage({ tool }: { tool: Tool }) {
  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              {tool.category} · {tool.name}
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] md:text-6xl">
              {tool.headline[0]}<br /><span className="text-gradient">{tool.headline[1]}</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">{tool.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={MARVEDGE_URL} className="btn-primary">Start free <ArrowRight className="h-4 w-4" /></a>
              <a href={MARVEDGE_URL} className="btn-ghost"><Lock className="h-4 w-4" /> Log in</a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Built for {tool.audience.toLowerCase()}.</p>
          </div>
          <div className="animate-fade-up [animation-delay:150ms]"><ToolAnimation slug={tool.slug} /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-3xl font-extrabold md:text-4xl">A short story about <span className="text-gradient">{tool.tagline.toLowerCase()}</span></h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {tool.story.map((s, i) => (
            <div key={i} className="group relative rounded-3xl border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <span className="font-display text-6xl font-extrabold text-lavender transition-colors group-hover:text-primary-glow">0{i + 1}</span>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-primary">{chapters[i]}</p>
              <p className="mt-3 text-lg font-medium leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/60 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold md:text-4xl">Everything you need. <br />Nothing you don't.</h2>
            <p className="mt-4 text-muted-foreground">Fast, private and free to start. Log in to save your work and pick up where you left off.</p>
            <a href={MARVEDGE_URL} className="btn-ghost mt-6"><Lock className="h-4 w-4" /> Log in to save</a>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {tool.features.map((f) => (
              <li key={f} className="flex items-center gap-3 rounded-2xl border bg-card p-4 font-semibold shadow-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"><Check className="h-4 w-4" /></span>{f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <MarvedgeCTA context={`${tool.name} solves one moment.`} />

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <h3 className="text-xl font-bold">Keep the story going</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {tool.related.map((slug) => {
            const r = getTool(slug);
            return (
              <Link key={slug} to={r.path} className="group flex items-center justify-between rounded-2xl border bg-card p-5 transition-all hover:border-lavender hover:shadow-soft">
                <div><p className="font-display font-bold">{r.name}</p><p className="text-sm text-muted-foreground">{r.tagline}</p></div>
                <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
