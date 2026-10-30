import { ArrowUpRight } from "lucide-react";
import { MARVEDGE_URL } from "@/lib/tools";

export function MarvedgeCTA({ context }: { context?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-band p-10 text-primary-foreground shadow-elegant md:p-16">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-primary-foreground/10" style={{ animation: "spin-slow 30s linear infinite" }} />
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">The next chapter</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-extrabold md:text-5xl">Want to enjoy the full potential?</h2>
        <p className="mt-4 max-w-xl text-lg opacity-85">
          {context ?? "These tools are just the opening scene."} Marvedge turns your product into interactive demos that sell, onboard and explain — while you sleep.
        </p>
        <a href={MARVEDGE_URL} className="btn-light mt-8">Unlock the full Marvedge experience <ArrowUpRight className="h-5 w-5" /></a>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} Marvedge. Free tools, made with care.</p>
        <a href={MARVEDGE_URL} className="font-semibold text-primary hover:underline">Visit marvedge.com →</a>
      </div>
    </footer>
  );
}
