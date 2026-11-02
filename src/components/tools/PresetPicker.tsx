import { useState } from "react";
import { Briefcase, Check, FileText, Smartphone, ShoppingCart } from "lucide-react";
import { COUNTRY_SHAPES } from "@/lib/country-shapes";
import { PRESET_GROUPS, type Preset, type PresetGroup } from "@/lib/presets";

const fmtKB = (kb: number) => (kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`);

function GroupMark({ group }: { group: PresetGroup }) {
  if (group.shape) {
    return (
      <svg viewBox="0 0 100 100" className="h-10 w-10" aria-hidden="true">
        <path d={COUNTRY_SHAPES[group.shape]} className="fill-current" stroke="var(--background)" strokeWidth="1.2" />
      </svg>
    );
  }
  if (group.icon === "phone") return <Smartphone className="h-8 w-8" aria-hidden="true" />;
  if (group.icon === "file") return <FileText className="h-8 w-8" aria-hidden="true" />;
  if (group.icon === "cart") return <ShoppingCart className="h-8 w-8" aria-hidden="true" />;
  return <Briefcase className="h-8 w-8" aria-hidden="true" />;
}

/** Country/category cards + preset tiles. A preset reads as applied while the
 *  width, height and KB limit still match it — so typing over it clears the mark. */
export function PresetPicker({
  onPick,
  w,
  h,
  kb,
}: {
  onPick: (p: Preset) => void;
  w: number;
  h: number;
  kb: number | "";
}) {
  const [groupId, setGroupId] = useState(PRESET_GROUPS[0]!.id);
  const [catIndex, setCatIndex] = useState(0);
  const group = PRESET_GROUPS.find((g) => g.id === groupId) ?? PRESET_GROUPS[0]!;
  const cat = Math.min(catIndex, group.categories.length - 1);
  const active = group.categories[cat] ?? group.categories[0]!;

  const applied = (p: Preset) => p.w === w && p.h === h && (p.kb ?? "") === kb;

  const chooseGroup = (g: PresetGroup) => {
    setGroupId(g.id);
    setCatIndex(0);
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-bold">Size presets — pick a country or a job</p>
        <p className="text-xs text-muted-foreground">Common official sizes; always confirm on the portal you upload to.</p>
      </div>

      <div role="group" aria-label="Country or category" className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-6">
        {PRESET_GROUPS.map((g) => {
          const on = g.id === groupId;
          const count = g.categories.reduce((n, c) => n + c.items.length, 0);
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              onClick={() => chooseGroup(g)}
              className={`group grid gap-1 rounded-2xl border p-3 text-left transition-all duration-200 ${
                on
                  ? "border-primary bg-secondary shadow-soft -translate-y-0.5"
                  : "border-lavender hover:-translate-y-0.5 hover:bg-muted"
              }`}
            >
              <span className={`flex h-11 items-center justify-center transition-colors ${on ? "text-primary" : "text-primary/55 group-hover:text-primary"}`}>
                <GroupMark group={g} />
              </span>
              <span className="flex items-center gap-1 text-sm font-bold leading-tight">
                {g.flag && <span aria-hidden="true">{g.flag}</span>}
                {g.name}
              </span>
              <span className="text-xs leading-snug text-muted-foreground">
                {count} sizes · {g.blurb}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 rounded-2xl border border-lavender bg-muted/40 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {group.categories.length > 1 &&
              group.categories.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={i === cat}
                  onClick={() => setCatIndex(i)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    i === cat ? "bg-gradient-primary text-primary-foreground" : "border border-lavender bg-background hover:bg-secondary"
                  }`}
                >
                  {c.name} · {c.items.length}
                </button>
              ))}
          </div>
          <p className="text-xs font-semibold text-primary">
            {group.name} — {active.name.toLowerCase()} {active.items.length}
          </p>
        </div>

        <div key={`${group.id}-${cat}`} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {active.items.map((p, i) => {
            const on = applied(p);
            return (
              <button
                key={p.title}
                type="button"
                aria-pressed={on}
                onClick={() => onPick(p)}
                style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
                className={`preset-in rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                  on ? "border-primary bg-secondary shadow-soft" : "border-lavender bg-background hover:bg-secondary/60"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{p.title}</span>
                  {on && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {p.w}×{p.h} px{p.mm ? ` · ${p.mm}` : ""}
                </span>
                {p.note && <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{p.note}</span>}
                {p.kb != null && (
                  <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    ≤ {fmtKB(p.kb)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
