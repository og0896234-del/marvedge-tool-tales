import { describe, expect, it } from "vitest";
import { tools, MARVEDGE_URL } from "@/lib/tools";

describe("tools", () => {
  it("has 19 tools: 11 free and 8 AI", () => {
    expect(tools).toHaveLength(19);
    expect(tools.filter((t) => t.category === "AI tool")).toHaveLength(8);
  });
  it("related links point to real tools", () => {
    const slugs = new Set(tools.map((t) => t.slug));
    tools.forEach((t) => t.related.forEach((r) => expect(slugs.has(r)).toBe(true)));
  });
  it("redirects to marvedge.com", () => expect(MARVEDGE_URL).toBe("https://marvedge.com/"));
});
