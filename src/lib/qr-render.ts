import QRCode from "qrcode";

export type QrShape = "square" | "rounded" | "dots" | "diamond" | "star" | "classy" | "fluid" | "bars";
export type QrCorner = "square" | "rounded" | "circle" | "leaf";
export type QrFrame = "none" | "border" | "banner" | "badge";

export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

export function drawModule(ctx: CanvasRenderingContext2D, shape: QrShape, x: number, y: number, cell: number, on: (dr: number, dc: number) => boolean) {
  const cx = x + cell / 2, cy = y + cell / 2;
  if (shape === "dots") { ctx.beginPath(); ctx.arc(cx, cy, cell * 0.42, 0, 7); ctx.fill(); }
  else if (shape === "rounded") { rr(ctx, x + cell * 0.08, y + cell * 0.08, cell * 0.84, cell * 0.84, cell * 0.38); ctx.fill(); }
  else if (shape === "diamond") { ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(x + cell, cy); ctx.lineTo(cx, y + cell); ctx.lineTo(x, cy); ctx.closePath(); ctx.fill(); }
  else if (shape === "star") {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? cell * 0.24 : cell * 0.54; ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
    ctx.closePath(); ctx.fill();
  }
  else if (shape === "classy") { ctx.beginPath(); ctx.roundRect(x + cell * 0.04, y + cell * 0.04, cell * 0.92, cell * 0.92, [cell * 0.46, 0, cell * 0.46, 0]); ctx.fill(); }
  else if (shape === "fluid") {
    rr(ctx, x, y, cell, cell, cell * 0.5); ctx.fill();
    if (on(0, 1)) ctx.fillRect(cx, y, cell, cell);
    if (on(1, 0)) ctx.fillRect(x, cy, cell, cell);
  }
  else if (shape === "bars") {
    rr(ctx, x + cell * 0.14, y, cell * 0.72, cell, cell * 0.36); ctx.fill();
    if (on(1, 0)) ctx.fillRect(x + cell * 0.14, cy, cell * 0.72, cell);
  }
  else ctx.fillRect(x, y, cell + 0.5, cell + 0.5);
}

export function cornerRadii(corner: QrCorner, s: number): number | number[] {
  if (corner === "square") return 0;
  if (corner === "circle") return s / 2;
  if (corner === "leaf") return [s * 0.45, 0, s * 0.45, 0];
  return s * 0.25;
}

export function drawQr(canvas: HTMLCanvasElement, value: string, o: { fg: string; bg: string; size: number; level: "L" | "M" | "Q" | "H"; shape: QrShape; corner: QrCorner; frame: QrFrame; logo: HTMLImageElement | null }) {
  const qr = QRCode.create(value, { errorCorrectionLevel: o.logo ? "H" : o.level });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const dpr = 2;
  const pad = o.frame === "none" ? Math.round(o.size * 0.04) : Math.round(o.size * 0.09);
  const bannerH = o.frame === "banner" ? Math.round(o.size * 0.18) : 0;
  const W = o.size + pad * 2;
  const H = o.size + pad * 2 + bannerH;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.aspectRatio = `${W} / ${H}`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = o.bg;
  if (o.frame === "none") ctx.fillRect(0, 0, W, H);
  else { rr(ctx, 0, 0, W, H, Math.round(o.size * 0.06)); ctx.fill(); }
  if (o.frame === "border") {
    ctx.strokeStyle = o.fg; ctx.lineWidth = Math.max(3, o.size * 0.012);
    rr(ctx, ctx.lineWidth, ctx.lineWidth, W - ctx.lineWidth * 2, H - ctx.lineWidth * 2, Math.round(o.size * 0.05)); ctx.stroke();
  }
  if (o.frame === "badge") {
    ctx.strokeStyle = o.fg; ctx.lineWidth = Math.max(4, o.size * 0.016);
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) / 2 - ctx.lineWidth, 0, 7); ctx.stroke();
  }
  const ox = pad, oy = pad, cell = o.size / n;
  const isFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  ctx.fillStyle = o.fg;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!data[r * n + c] || isFinder(r, c)) continue;
    const x = ox + c * cell, y = oy + r * cell;
    drawModule(ctx, o.shape, x, y, cell, (dr, dc) => {
      const rr2 = r + dr, cc = c + dc;
      return rr2 < n && cc < n && !!data[rr2 * n + cc] && !isFinder(rr2, cc);
    });
  }
  const box = (x: number, y: number, s: number) => { ctx.beginPath(); ctx.roundRect(x, y, s, s, cornerRadii(o.corner, s)); ctx.fill(); };
  const finder = (r0: number, c0: number) => {
    const x = ox + c0 * cell, y = oy + r0 * cell, s = cell * 7;
    ctx.fillStyle = o.fg; box(x, y, s);
    ctx.fillStyle = o.bg; box(x + cell, y + cell, s - cell * 2);
    ctx.fillStyle = o.fg; box(x + cell * 2, y + cell * 2, s - cell * 4);
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  if (o.logo) {
    const ls = o.size * 0.22, lx = ox + (o.size - ls) / 2, ly = oy + (o.size - ls) / 2, lp = ls * 0.14;
    ctx.fillStyle = o.bg; rr(ctx, lx - lp, ly - lp, ls + lp * 2, ls + lp * 2, ls * 0.25); ctx.fill();
    const img = o.logo, ir = img.naturalWidth / img.naturalHeight;
    let dw = ls, dh = ls; if (ir > 1) dh = ls / ir; else dw = ls * ir;
    ctx.drawImage(img, lx + (ls - dw) / 2, ly + (ls - dh) / 2, dw, dh);
  }
  if (o.frame === "banner") {
    ctx.fillStyle = o.fg;
    rr(ctx, pad * 0.4, H - bannerH - pad * 0.4, W - pad * 0.8, bannerH, bannerH * 0.3); ctx.fill();
    ctx.fillStyle = o.bg;
    ctx.font = `800 ${Math.round(bannerH * 0.42)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("SCAN ME", W / 2, H - bannerH / 2 - pad * 0.4 + 1);
  }
}
