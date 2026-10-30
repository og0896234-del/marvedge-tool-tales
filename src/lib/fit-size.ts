// Shared "land under the portal's file-size limit" search, used by the image resizer.
// encode() is injected so the search itself can be tested without a canvas.

export type Fit = { q: number; scale: number; hits: boolean };

/**
 * Find the sharpest (quality, scale) whose encoded size is <= targetBytes.
 * Quality is tuned first; pixels only shrink when the lowest quality still overshoots.
 * `hits` is false when even the smallest attempt overshoots, in which case the
 * closest (smallest) result is returned.
 */
export async function fitToTarget(
  encode: (q: number, scale: number) => Promise<{ size: number }>,
  targetBytes: number,
  { minScale = 0.25, qualityLow = 0.05, qualityHigh = 0.95, steps = 7 } = {},
): Promise<Fit> {
  let closest: { q: number; scale: number; size: number } | null = null;

  for (let scale = 1; scale >= minScale; scale = Math.round((scale - 0.1) * 100) / 100) {
    const low = await encode(qualityLow, scale);
    if (!closest || low.size < closest.size) closest = { q: qualityLow, scale, size: low.size };
    if (low.size > targetBytes) continue;

    // The floor fits here, so search upward for the sharpest quality that still fits.
    let lo = qualityLow, hi = qualityHigh, best = qualityLow;
    for (let i = 0; i < steps; i++) {
      const mid = (lo + hi) / 2;
      const b = await encode(mid, scale);
      if (b.size <= targetBytes) { best = mid; lo = mid; } else { hi = mid; }
    }
    // Round down: a floored quality can only be smaller, so the target still holds.
    return { q: Math.floor(best * 100) / 100, scale, hits: true };
  }

  return { q: closest!.q, scale: closest!.scale, hits: false };
}
