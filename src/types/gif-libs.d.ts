declare module "gifenc" {
  type Palette = number[][];
  function GIFEncoder(): {
    writeFrame(index: Uint8Array, w: number, h: number, opts?: { palette?: Palette; delay?: number; dispose?: number; transparent?: boolean; transparentIndex?: number; repeat?: number }): void;
    finish(): void;
    bytes(): Uint8Array<ArrayBuffer>;
  };
  type Format = "rgb565" | "rgb444" | "rgba4444";
  function quantize(rgba: Uint8ClampedArray, maxColors: number, opts?: { format?: Format; oneBitAlpha?: boolean | number; clearAlpha?: boolean }): Palette;
  function applyPalette(rgba: Uint8ClampedArray, palette: Palette, format?: Format): Uint8Array;
  const gifenc: { GIFEncoder: typeof GIFEncoder; quantize: typeof quantize; applyPalette: typeof applyPalette };
  export default gifenc;
}
