declare module "gifenc" {
  type Palette = number[][];
  function GIFEncoder(): {
    writeFrame(index: Uint8Array, w: number, h: number, opts?: { palette?: Palette; delay?: number }): void;
    finish(): void;
    bytes(): Uint8Array<ArrayBuffer>;
  };
  function quantize(rgba: Uint8ClampedArray, maxColors: number): Palette;
  function applyPalette(rgba: Uint8ClampedArray, palette: Palette): Uint8Array;
  const gifenc: { GIFEncoder: typeof GIFEncoder; quantize: typeof quantize; applyPalette: typeof applyPalette };
  export default gifenc;
}
