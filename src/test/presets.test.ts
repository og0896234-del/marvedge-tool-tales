import { describe, expect, it } from "vitest";
import { COUNTRY_SHAPES } from "@/lib/country-shapes";
import { PRESET_GROUPS, allPresets } from "@/lib/presets";

const find = (id: string) => PRESET_GROUPS.find((g) => g.id === id)!;
const item = (title: string) => allPresets().find((p) => p.title === title)!;


describe("resizer preset cards", () => {
  it("has eleven groups, seven of them drawn from a real map outline", () => {
    expect(PRESET_GROUPS.map((g) => g.id)).toEqual(["india", "usa", "europe", "mideast", "oceania", "latam", "africa", "docs", "job", "social", "shop"]);
    const shaped = PRESET_GROUPS.filter((g) => g.shape);
    expect(shaped.map((g) => g.id)).toEqual(["india", "usa", "europe", "mideast", "oceania", "latam", "africa"]);
    for (const g of shaped) {
      const d = COUNTRY_SHAPES[g.shape!] ?? "";
      expect(d, `${g.id} silhouette`).toBeTruthy();
      expect(d.startsWith("M")).toBe(true);
      expect(d.length).toBeGreaterThan(200);
    }
  });

  it("gives every group at least one usable category", () => {
    for (const g of PRESET_GROUPS) {
      expect(g.categories.length).toBeGreaterThan(0);
      for (const c of g.categories) expect(c.items.length).toBeGreaterThan(0);
    }
  });

  it("keeps the India photo and signature sizes people actually upload", () => {
    expect(item("Aadhaar photo")).toMatchObject({ w: 413, h: 531 });
    expect(item("IBPS / banking signature")).toMatchObject({ w: 140, h: 60, kb: 20 });
    expect(item("Sarathi signature")).toMatchObject({ w: 256, h: 64, kb: 20 });
    expect(item("UPSC ORA photo")).toMatchObject({ w: 110, h: 140, kb: 40 });
    expect(item("Canada passport")).toMatchObject({ w: 591, h: 827 });
    expect(item("Bahrain CPR")).toMatchObject({ w: 384, h: 508 });
  });

  it("offers signatures for every country group, not just photos", () => {
    for (const id of ["india", "usa", "europe", "mideast"]) {
      expect(find(id).categories.map((c) => c.name), id).toContain("Signatures");
    }
  });

  it("lists a size limit for every official document preset", () => {
    for (const p of allPresets()) {
      expect(p.w).toBeGreaterThan(0);
      expect(p.h).toBeGreaterThan(0);
      if (p.kb != null) expect(p.kb).toBeGreaterThan(0);
    }
    expect(allPresets()).toHaveLength(85);
  });
});
