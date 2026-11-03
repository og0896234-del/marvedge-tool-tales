import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Menu, X, Sparkles, Wrench } from "lucide-react";
import { tools, MARVEDGE_URL } from "@/lib/tools";

function ToolList({ onPick }: { onPick?: () => void }) {
  const groups = [
    { label: "Free utilities", icon: Wrench, items: tools.filter((t) => t.category === "Free utility") },
    { label: "AI tools", icon: Sparkles, items: tools.filter((t) => t.category === "AI tool") },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <g.icon className="h-3.5 w-3.5" />{g.label}
          </div>
          <div className="grid gap-0.5">
            {g.items.map((t) => (
              <Link key={t.slug} to="/$slug" params={{ slug: t.slug }} onClick={onPick}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary" }}>
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">M</span>
          Marvedge <span className="text-gradient">Tools</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Link to="/" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-secondary" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>Home</Link>
          <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium hover:bg-secondary">
              All 20 tools <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="absolute left-1/2 top-full w-[620px] -translate-x-1/2 pt-3">
                <div className="animate-fade-up rounded-2xl border bg-popover p-6 shadow-elegant"><ToolList onPick={() => setOpen(false)} /></div>
              </div>
            )}
          </div>
          <a href={MARVEDGE_URL} target="_blank" rel="noopener" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-secondary">Marvedge</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href={MARVEDGE_URL} className="btn-ghost hidden sm:inline-flex">Log in</a>
          <a href={MARVEDGE_URL} className="btn-primary hidden sm:inline-flex">Try Marvedge</a>
          <button className="rounded-full p-2 hover:bg-secondary lg:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu">
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {mobile && (
        <div className="max-h-[75vh] overflow-y-auto border-t bg-background p-5 lg:hidden">
          <ToolList onPick={() => setMobile(false)} />
          <div className="mt-5 flex gap-2">
            <a href={MARVEDGE_URL} className="btn-ghost flex-1">Log in</a>
            <a href={MARVEDGE_URL} className="btn-primary flex-1">Try Marvedge</a>
          </div>
        </div>
      )}
    </header>
  );
}
