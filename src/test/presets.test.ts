import { describe, expect, it } from "vitest";
import { COUNTRY_SHAPES } from "@/lib/country-shapes";
import { PRESET_GROUPS, allPresets } from "@/lib/presets";

const find = (id: string) => PRESET_GROUPS.find((g) => g.id === id)!;
const item = (title: string) => allPresets().find((p) => p.title === title)!;


describe("resizer preset cards", () => {
  it("has seven groups, four of them drawn from a real map outline", () => {
    expect(PRESET_GROUPS.map((g) => g.id)).toEqual(["india", "usa", "europe", "mideast", "job", "social", "shop"]);
    const shaped = PRESET_GROUPS.filter((g) => g.shape);
    expect(shaped.map((g) => g.id)).toEqual(["india", "usa", "europe", "mideast"]);
    for (const g of shaped) {
      const d = COUNTRY_SHAPES[g.shape!];
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
    const photos = find("india").categories[0].items;
    const signatures = find("india").categories[1].items;
    expect(photos).toHaveLength(6);
    expect(signatures).toHaveLength(4);
    expect(item("Passport / Passport Seva")).toMatchObject({ w: 413, h: 531, kb: 100 });
    expect(item("SSC / Govt exam signature")).toMatchObject({ w: 400, h: 200, kb: 20 });
    expect(item("PAN card signature")).toMatchObject({ w: 213, h: 100, kb: 50 });

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
    expect(allPresets()).toHaveLength(37);
  });
});
