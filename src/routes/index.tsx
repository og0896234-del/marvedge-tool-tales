import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { tools, MARVEDGE_URL } from "@/lib/tools";
import { ToolAnimation } from "@/components/ToolAnimation";
import { MarvedgeCTA } from "@/components/MarvedgeCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marvedge Tools — 20 free video, image, link & AI tools" },
      { name: "description", content: "Free browser tools and AI helpers for creators and SaaS teams: MP4 to GIF, compressors, QR codes, subtitles, demo scripts and more." },
      { property: "og:title", content: "Marvedge Tools — 20 free video, image, link & AI tools" },
      { property: "og:description", content: "Free browser utilities and AI tools for creators, marketers and SaaS teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-fade-up">
            <span className="rounded-full border bg-card px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">19 tools · free to start</span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] md:text-7xl">
              Small tools.<br /><span className="text-gradient">Big moments.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Every great product story is built from tiny wins — a crisp GIF, a lighter image, a script that lands. Start with one. Then let Marvedge tell the whole story.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#tools" className="btn-primary">Explore the tools <ArrowRight className="h-4 w-4" /></a>
              <a href={MARVEDGE_URL} className="btn-ghost"><Lock className="h-4 w-4" /> Log in</a>
            </div>
          </div>
          <div className="animate-float"><ToolAnimation slug="demo-script-generator" /></div>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-5 py-20">
        {(["Free utility", "AI tool"] as const).map((cat) => (
          <div key={cat} className="mb-16">
            <h2 className="text-3xl font-extrabold md:text-4xl">{cat === "AI tool" ? "AI tools that think with you" : "Free utilities that just work"}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.filter((t) => t.category === cat).map((t, i) => (
                <Link key={t.slug} to="/$slug" params={{ slug: t.slug }} style={{ animationDelay: `${i * 50}ms` }}
                  className="group animate-fade-up rounded-3xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-lavender hover:shadow-elegant">
                  <div className="flex items-start justify-between">
                    <span className="font-display text-sm font-bold text-lavender group-hover:text-primary-glow">{String(tools.indexOf(t) + 1).padStart(2, "0")}</span>
                    <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{t.name}</h3>
                  <p className="mt-1 text-muted-foreground">{t.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <MarvedgeCTA />
    </>
  );
}
