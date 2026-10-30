import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("dummy sample files", () => {
  const samplesSrc = read("src/lib/samples.ts");
  const assets = [...samplesSrc.matchAll(/from "@\/assets\/samples\/([^"]+)"/g)].map((m) => m[1] ?? "");

  it("bundles every sample asset the loader imports, non-empty", () => {
    // photo, portrait, logo, clip, gif, narration + 3 mock screens
    expect(assets.sort()).toEqual([
      "animation.gif", "clip.webm", "logo.png", "narration.mp3",
      "photo.jpg", "portrait.jpg", "screen-1.png", "screen-2.png", "screen-3.png",
    ]);
    for (const a of assets) {
      const p = resolve(root, "src/assets/samples", a);
      expect(existsSync(p), `missing sample asset ${a}`).toBe(true);
      expect(statSync(p).size, `${a} looks empty`).toBeGreaterThan(1024);
    }
  });

  it("offers a dummy file on every upload area", () => {
    const dir = resolve(root, "src/components/tools");
    let dropzones = 0;
    let withSample = 0;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".tsx"))) {
      const code = readFileSync(resolve(dir, f), "utf8");
      dropzones += (code.match(/<Dropzone/g) ?? []).length;
      withSample += (code.match(/sample=\{\{/g) ?? []).length;
    }
    expect(dropzones).toBe(11);
    expect(withSample).toBe(dropzones);
  });
});
