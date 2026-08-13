// Shared canvas helpers for both the PFP Frame and the Builder ID Card.

/** Load a File/Blob into an HTMLImageElement, converting HEIC first if needed. */
export async function loadImageFromFile(file) {
  let blob = file;
  const isHeic =
    /heic|heif/i.test(file.type) || /\.heic$|\.heif$/i.test(file.name || "");
  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    blob = Array.isArray(converted) ? converted[0] : converted;
  }
  const url = URL.createObjectURL(blob);
  const img = await new Promise((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = url;
  });
  return { img, url };
}

/**
 * Draw `img` into the rect (dx,dy,dw,dh) using "cover" behavior, adjustable
 * with a user pan (offsetX/offsetY in [-1,1] relative to slack space) and a
 * zoom multiplier (>=1) on top of the base cover scale. This is what lets an
 * off-center or oddly-cropped photo still fill the frame nicely.
 */
export function coverSlack(img, dw, dh, zoom = 1) {
  const baseScale = Math.max(dw / img.width, dh / img.height);
  const scale = baseScale * zoom;
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  return {
    scale,
    drawW,
    drawH,
    slackX: Math.max(0, (drawW - dw) / 2),
    slackY: Math.max(0, (drawH - dh) / 2),
  };
}

export function drawCoverImage(ctx, img, dx, dy, dw, dh, transform, clip) {
  const { zoom = 1, panX = 0, panY = 0 } = transform || {};
  const { drawW, drawH } = coverSlack(img, dw, dh, zoom);

  const cx = dx + (dw - drawW) / 2 + panX;
  const cy = dy + (dh - drawH) / 2 + panY;

  ctx.save();
  if (clip === "circle") {
    circlePath(ctx, dx + dw / 2, dy + dh / 2, Math.min(dw, dh) / 2);
  } else if (typeof clip === "number") {
    roundRectPath(ctx, dx, dy, dw, dh, clip);
  } else {
    roundRectPath(ctx, dx, dy, dw, dh, 0);
  }
  ctx.clip();
  ctx.drawImage(img, cx, cy, drawW, drawH);
  ctx.restore();
}

export function clampPan(panX, panY, slackX, slackY) {
  return {
    panX: Math.max(-slackX, Math.min(slackX, panX)),
    panY: Math.max(-slackY, Math.min(slackY, panY)),
  };
}

export function roundRectPath(ctx, x, y, w, h, r) {
  const radius = typeof r === "number" ? r : 0;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function circlePath(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
}

/** Simple deterministic "wave" motif used across both templates. */
export function drawWaveBand(ctx, x, y, w, h, color, amplitude = 10, wavelength = 60) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + amplitude);
  for (let px = 0; px <= w; px += 2) {
    const py = y + amplitude + Math.sin((px / wavelength) * Math.PI * 2) * amplitude;
    ctx.lineTo(x + px, py);
  }
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * The layered "poster" text look used across the real HH Goa site — bold
 * flat color with a hard black offset behind it, rather than a soft blur
 * shadow. `align`/`baseline` are forwarded to canvas text settings.
 */
export function popText(ctx, text, x, y, opts = {}) {
  const {
    font,
    fillColor,
    shadowColor = "#000000",
    shadowOffset = 4,
    align = "center",
    baseline = "alphabetic",
    maxWidth,
  } = opts;
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = shadowColor;
  ctx.fillText(text, x + shadowOffset, y + shadowOffset, maxWidth);
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

export async function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
