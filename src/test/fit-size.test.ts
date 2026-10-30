import { describe, expect, it } from "vitest";
import { fitToTarget } from "@/lib/fit-size";

// Fake encoder with a JPEG-ish size model: higher quality and bigger pixels mean a bigger file.
const model = (base: number) => (q: number, scale: number) =>
  Promise.resolve({ size: Math.round(base * q * scale * scale) });
const sizeOf = (base: number, q: number, scale: number) => Math.round(base * q * scale * scale);

describe("fitToTarget", () => {
  it("keeps full size and picks the sharpest quality that still fits", async () => {
    const r = await fitToTarget(model(200_000), 100_000);
    expect(r.hits).toBe(true);
    expect(r.scale).toBe(1);
    expect(r.q).toBeGreaterThan(0.45);
    expect(r.q).toBeLessThanOrEqual(0.5);
    const size = sizeOf(200_000, r.q, r.scale);
    expect(size).toBeLessThanOrEqual(100_000);
    expect(size).toBeGreaterThan(90_000); // aims close to the limit, not far under it
  });

  it("shrinks the image when quality alone cannot reach the target", async () => {
    const r = await fitToTarget(model(200_000), 5_000);
    expect(r.hits).toBe(true);
    expect(r.scale).toBeLessThan(1);
    expect(r.scale).toBe(0.7);
    const size = sizeOf(200_000, r.q, r.scale);
    expect(size).toBeLessThanOrEqual(5_000);
    expect(size).toBeGreaterThan(4_400);
  });

  it("reports honestly when the target cannot be reached", async () => {
    const r = await fitToTarget(model(200_000), 100);
    expect(r.hits).toBe(false);
    expect(r.q).toBe(0.05);
    expect(r.scale).toBe(0.3); // the smallest attempt is what it offers back
    expect(sizeOf(200_000, r.q, r.scale)).toBe(900);
  });
});
