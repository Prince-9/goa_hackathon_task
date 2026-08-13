import { THEME, FONT_DISPLAY, FONT_MONO } from "./theme";
import { drawCoverImage, circlePath, popText } from "./canvasEngine";

export const FRAME_SIZE = 1080;

function drawArcPopText(ctx, text, cx, cy, radius, startAngleDeg, opts = {}) {
  const {
    font = `700 40px ${FONT_DISPLAY}`,
    color = THEME.yellow,
    shadowColor = THEME.black,
    shadowOffset = 2.5,
    letterSpacing = 0.055,
    flip = false,
  } = opts;
  ctx.save();
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  const chars = text.split("");
  const widths = chars.map((c) => ctx.measureText(c).width);
  const anglePerChar = widths.map((w) => w / radius + letterSpacing);
  const totalAngle = anglePerChar.reduce((a, b) => a + b, 0);
  const center = (startAngleDeg * Math.PI) / 180;

  // `flip` keeps text upright when it sits on the bottom half of the ring —
  // characters progress the opposite way around and rotate relative to PI
  // so the banner reads left-to-right the normal way instead of mirrored.
  let angle = flip ? center + totalAngle / 2 : center - totalAngle / 2;

  chars.forEach((c, i) => {
    const step = flip ? -anglePerChar[i] : anglePerChar[i];
    angle += step / 2;
    const x = cx + radius * Math.sin(angle);
    const y = cy - radius * Math.cos(angle);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(flip ? angle - Math.PI : angle);
    ctx.fillStyle = shadowColor;
    ctx.fillText(c, shadowOffset, shadowOffset);
    ctx.fillStyle = color;
    ctx.fillText(c, 0, 0);
    ctx.restore();
    angle += step / 2;
  });
  ctx.restore();
}

function drawPalmGlyph(ctx, x, y, scale = 1, color = THEME.cream) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.quadraticCurveTo(3, -10, 0, -34);
  ctx.stroke();
  const fronds = [
    [-40, -38, -6, -20],
    [40, -38, 6, -20],
    [-34, -22, -4, -10],
    [34, -22, 4, -10],
    [0, -46, 0, -18],
  ];
  fronds.forEach(([tx, ty, cx1, cy1]) => {
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.quadraticCurveTo(cx1, cy1 - 8, tx, ty);
    ctx.quadraticCurveTo(cx1 * 0.6, cy1, 0, -20);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

/** A small sun-with-rays glyph, echoing the beach illustration on hhgoa.com. */
function drawSunGlyph(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = THEME.yellow;
  ctx.strokeStyle = THEME.black;
  ctx.lineWidth = 2;
  circlePath(ctx, 0, 0, 16);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = THEME.yellow;
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 22, Math.sin(a) * 22);
    ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Renders the full PFP frame: a thick brand-green ring with the "HH GOA
 * 2026" wordmark wrapping the uploaded photo, sized square for direct use
 * as an X profile picture. Matches the real hhgoa.com palette: deep green,
 * sunflower yellow, hot pink, hard black poster outlines.
 */
export function drawFrame(ctx, { img, transform }) {
  const S = FRAME_SIZE;
  const cx = S / 2;
  const cy = S / 2;
  const outerR = S / 2;
  const ringWidth = 74;
  const photoR = outerR - ringWidth;

  ctx.clearRect(0, 0, S, S);

  // Outer green ring
  ctx.save();
  circlePath(ctx, cx, cy, outerR - 4);
  ctx.fillStyle = THEME.green;
  ctx.fill();
  ctx.restore();

  // Photo
  if (img) {
    drawCoverImage(
      ctx,
      img,
      cx - photoR,
      cy - photoR,
      photoR * 2,
      photoR * 2,
      transform,
      "circle"
    );
  } else {
    ctx.save();
    circlePath(ctx, cx, cy, photoR);
    ctx.fillStyle = THEME.greenDark;
    ctx.fill();
    ctx.fillStyle = "rgba(255,251,232,0.4)";
    ctx.font = `600 34px ${FONT_MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("your photo", cx, cy);
    ctx.restore();
  }

  // Thick yellow hairline separating photo from ring
  ctx.save();
  circlePath(ctx, cx, cy, photoR + 5);
  ctx.strokeStyle = THEME.yellow;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.restore();

  // Wordmark arcing around the top of the ring
  drawArcPopText(ctx, "HH GOA 2026", cx, cy, outerR - ringWidth / 2, 0, {
    font: `800 46px ${FONT_DISPLAY}`,
    color: THEME.yellow,
  });

  // Hashtag arcing around the bottom of the ring, upright, pink accent
  drawArcPopText(ctx, "#FRAMEINGOA", cx, cy, outerR - ringWidth / 2, 180, {
    font: `700 27px ${FONT_MONO}`,
    color: THEME.pink,
    shadowColor: "rgba(0,0,0,0.55)",
    flip: true,
  });

  // Small sun + palm accents flanking the ring
  drawSunGlyph(ctx, cx - (outerR - ringWidth / 2) * 0.7, cy + (outerR - ringWidth / 2) * 0.72, 1);
  drawPalmGlyph(ctx, cx + (outerR - ringWidth / 2) * 0.72, cy + (outerR - ringWidth / 2) * 0.72, 0.55, THEME.cream);

  // Outer rim — hard black poster outline
  ctx.save();
  circlePath(ctx, cx, cy, outerR - 3);
  ctx.lineWidth = 6;
  ctx.strokeStyle = THEME.black;
  ctx.stroke();
  ctx.restore();
}
