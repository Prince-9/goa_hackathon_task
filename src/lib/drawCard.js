import { THEME, FONT_DISPLAY, FONT_MONO, pickBuilderTitle } from "./theme";
import { drawCoverImage, roundRectPath, drawWaveBand, popText } from "./canvasEngine";

export const CARD_W = 1080;
// Initial/fallback height before the first real draw resizes the canvas to
// fit its actual content — see computeContentBottom() below.
export const CARD_H = 760;

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

const HEADER_H = 190;
const PHOTO_SIZE = 380;
const PHOTO_GAP = 36; // header bottom -> photo top
const PAD = 64;
const ROLE_FONT = `700 30px ${FONT_MONO}`;
const TITLE_FONT = `italic 500 34px ${FONT_MONO}`;

/**
 * Mirrors the vertical layout flow below (without drawing) so the canvas
 * can be sized to the actual content instead of leaving dead space when a
 * name/role/title is short.
 */
function computeContentBottom(ctx, { name, role, title }) {
  const W = CARD_W;
  const photoY = HEADER_H + PHOTO_GAP;
  let y = photoY + PHOTO_SIZE + 56;

  y += 46; // name

  if (role && role.trim()) {
    ctx.font = ROLE_FONT;
    y += 52 + 30; // pill height + gap
  } else {
    y += 14;
  }

  const displayName = (name || "Builder").trim() || "Builder";
  const finalTitle = title && title.trim() ? title.trim() : pickBuilderTitle(displayName + (role || ""));
  ctx.font = TITLE_FONT;
  const lines = wrapText(ctx, `"${finalTitle}"`, W - PAD * 2);
  const titleBottom = y + Math.max(0, lines.length - 1) * 42;

  const footerY = titleBottom + 52;
  return footerY + 34; // bottom padding under the footer line
}

/**
 * Renders the Builder ID Card: photo + name + role + a generated builder
 * title, laid out like an event badge for sharing (not printing). Matches
 * the real hhgoa.com palette: deep green, sunflower yellow, hot pink, hard
 * black poster outlines. The canvas is resized to fit the content snugly.
 */
export function drawCard(ctx, { img, transform, name, role, title }) {
  const W = CARD_W;
  const H = Math.max(700, Math.round(computeContentBottom(ctx, { name, role, title })));
  if (ctx.canvas.height !== H) ctx.canvas.height = H;
  if (ctx.canvas.width !== W) ctx.canvas.width = W;
  const pad = PAD;

  ctx.clearRect(0, 0, W, H);

  // Background panel
  ctx.save();
  roundRectPath(ctx, 0, 0, W, H, 48);
  ctx.clip();
  ctx.fillStyle = THEME.green;
  ctx.fillRect(0, 0, W, H);

  // Decorative wave near the header, echoing the beach illustration on
  // hhgoa.com
  drawWaveBand(ctx, 0, HEADER_H - 20, W, 40, THEME.greenDark, 10, 90);

  ctx.restore();

  // Header text — yellow display wordmark with a pink accent word, hard
  // black poster shadow, like the real site's logo treatment.
  ctx.save();
  ctx.textBaseline = "alphabetic";
  popText(ctx, "HH GOA 2026", pad, 86, {
    font: `800 50px ${FONT_DISPLAY}`,
    fillColor: THEME.yellow,
    align: "left",
    shadowOffset: 3,
  });
  ctx.font = `600 22px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(255,251,232,0.85)";
  ctx.fillText("BUILDER PASS", pad, 120);
  popText(ctx, "#FrameInGoa", W - pad, 86, {
    font: `700 22px ${FONT_MONO}`,
    fillColor: THEME.pink,
    shadowColor: "rgba(0,0,0,0.5)",
    align: "right",
    shadowOffset: 2,
  });
  ctx.restore();

  // Photo slot
  const photoSize = PHOTO_SIZE;
  const photoX = (W - photoSize) / 2;
  const photoY = HEADER_H + PHOTO_GAP;

  ctx.save();
  roundRectPath(ctx, photoX - 8, photoY - 8, photoSize + 16, photoSize + 16, 32);
  ctx.fillStyle = THEME.yellow;
  ctx.fill();
  ctx.strokeStyle = THEME.black;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  if (img) {
    drawCoverImage(ctx, img, photoX, photoY, photoSize, photoSize, transform, 24);
  } else {
    ctx.save();
    roundRectPath(ctx, photoX, photoY, photoSize, photoSize, 24);
    ctx.fillStyle = "rgba(255,251,232,0.1)";
    ctx.fill();
    ctx.fillStyle = "rgba(255,251,232,0.45)";
    ctx.font = `600 28px ${FONT_MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("your photo", photoX + photoSize / 2, photoY + photoSize / 2);
    ctx.restore();
  }

  let y = photoY + photoSize + 56;

  // Name — bold yellow display type with black poster shadow
  const displayName = (name || "Builder").trim() || "Builder";
  popText(ctx, displayName, W / 2, y, {
    font: `800 58px ${FONT_DISPLAY}`,
    fillColor: THEME.yellow,
    shadowOffset: 3,
  });

  y += 46;

  // Role pill — pink outline, monospace, hacker-badge look
  if (role && role.trim()) {
    ctx.save();
    ctx.font = ROLE_FONT;
    const text = role.trim();
    const textW = ctx.measureText(text).width;
    const pillW = textW + 64;
    const pillH = 52;
    const pillX = W / 2 - pillW / 2;
    roundRectPath(ctx, pillX, y, pillW, pillH, pillH / 2);
    ctx.fillStyle = "rgba(255,0,128,0.12)";
    ctx.fill();
    ctx.strokeStyle = THEME.pink;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = THEME.pink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, W / 2, y + pillH / 2 + 2);
    ctx.restore();
    y += pillH + 30;
  } else {
    y += 14;
  }

  // Builder title — italic monospace, cream, terminal-quote feel
  const finalTitle = title && title.trim() ? title.trim() : pickBuilderTitle(displayName + (role || ""));
  ctx.save();
  ctx.font = TITLE_FONT;
  ctx.fillStyle = "rgba(255,251,232,0.9)";
  ctx.textAlign = "center";
  const lines = wrapText(ctx, `"${finalTitle}"`, W - pad * 2);
  lines.forEach((line, i) => ctx.fillText(line, W / 2, y + i * 42));
  const titleBottom = y + Math.max(0, lines.length - 1) * 42;
  ctx.restore();

  // Footer — anchored just below the content, not the canvas edge, so
  // short names/roles/titles don't leave a big empty gap.
  ctx.save();
  ctx.font = `600 22px ${FONT_MONO}`;
  ctx.fillStyle = "rgba(255,251,232,0.55)";
  ctx.textAlign = "center";
  ctx.fillText("GOA · BUILDERS · 2026", W / 2, titleBottom + 52);
  ctx.restore();

  // Outer border — hard black poster outline
  ctx.save();
  roundRectPath(ctx, 4, 4, W - 8, H - 8, 44);
  ctx.strokeStyle = THEME.black;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
}
