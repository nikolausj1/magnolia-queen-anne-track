// Slice the five black-on-white track event icons out of
// inbox/trackEventIcons.png and save each as a transparent-background
// PNG suitable for CSS-mask tinting.
//
// Strategy:
// 1. Load the source PNG into raw RGBA pixels.
// 2. Project darkness onto the X axis to find the columns where each
//    icon lives. Group consecutive "dark" columns into icon ranges.
// 3. For each range, also find its tight Y bounds.
// 4. Crop, convert white → transparent (alpha = darkness), pad slightly,
//    and write to public/icons/{name}.png.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "inbox/trackEventIcons.png";
const OUT_DIR = "public/icons";

// Order of icons left-to-right in the source image.
const NAMES = ["running", "javelin", "shot-put", "relay", "long-jump"];

// A pixel counts as "ink" when its luminance is below this threshold (0-255).
const INK_THRESHOLD = 200;
// Padding (px) added around each cropped icon.
const PAD = 8;

const img = sharp(SRC);
const meta = await img.metadata();
const { width, height } = meta;
console.error(`source ${SRC} → ${width}×${height}`);

const { data, info } = await img
  .raw()
  .ensureAlpha()
  .toBuffer({ resolveWithObject: true });
const ch = info.channels; // 4 (RGBA)

function lum(x, y) {
  const i = (y * width + x) * ch;
  // Average of RGB; ignore alpha (fully opaque source).
  return (data[i] + data[i + 1] + data[i + 2]) / 3;
}
function isInk(x, y) {
  return lum(x, y) < INK_THRESHOLD;
}

// Pass 1: per-column "has ink" (any row dark).
const colHasInk = new Array(width).fill(false);
for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    if (isInk(x, y)) {
      colHasInk[x] = true;
      break;
    }
  }
}

// Group consecutive ink columns into ranges. Tolerate small horizontal
// gaps inside a single icon (e.g. relay has a baton gap between figures);
// merge ranges separated by less than MIN_GAP into one icon.
const MIN_GAP = 30; // px — anything smaller is still part of the same icon
const rawRanges = [];
let start = -1;
for (let x = 0; x <= width; x++) {
  if (x < width && colHasInk[x]) {
    if (start === -1) start = x;
  } else {
    if (start !== -1) {
      rawRanges.push([start, x - 1]);
      start = -1;
    }
  }
}

const ranges = [];
for (const r of rawRanges) {
  const last = ranges[ranges.length - 1];
  if (last && r[0] - last[1] < MIN_GAP) {
    last[1] = r[1];
  } else {
    ranges.push([...r]);
  }
}

// Filter out ranges that are too thin (likely label text artifacts).
const ICON_MIN_WIDTH = 60;
const iconRanges = ranges.filter((r) => r[1] - r[0] >= ICON_MIN_WIDTH);

console.error(`found ${iconRanges.length} icon column ranges:`);
for (const [a, b] of iconRanges) console.error(`  x ${a}..${b} (w=${b - a + 1})`);

if (iconRanges.length !== NAMES.length) {
  console.error(
    `⚠ expected ${NAMES.length} icons, got ${iconRanges.length}. Adjust thresholds and re-run.`,
  );
  process.exit(1);
}

// Source PNG has the event names ABOVE each glyph. We only want the
// glyph itself, not the label. Heuristic: find the topmost dark row
// that's contiguous with the rest of the glyph by rejecting the
// top-cluster band if it's significantly shorter than the main body.
function findIconYBounds(x0, x1) {
  // Per-row ink count within this x slice.
  const rowInk = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isInk(x, y)) rowInk[y]++;
    }
  }
  // Find horizontal "bands" of inked rows.
  const bands = [];
  let bs = -1;
  for (let y = 0; y <= height; y++) {
    if (y < height && rowInk[y] > 0) {
      if (bs === -1) bs = y;
    } else {
      if (bs !== -1) {
        bands.push({ start: bs, end: y - 1, height: y - bs });
        bs = -1;
      }
    }
  }
  // Pick the tallest band — that's the glyph (label is a thin band above).
  bands.sort((a, b) => b.height - a.height);
  const main = bands[0];
  return { y0: main.start, y1: main.end };
}

await mkdir(OUT_DIR, { recursive: true });

for (let i = 0; i < iconRanges.length; i++) {
  const [x0, x1] = iconRanges[i];
  const { y0, y1 } = findIconYBounds(x0, x1);

  const cropX = Math.max(0, x0 - PAD);
  const cropY = Math.max(0, y0 - PAD);
  const cropW = Math.min(width - cropX, x1 - x0 + 1 + PAD * 2);
  const cropH = Math.min(height - cropY, y1 - y0 + 1 + PAD * 2);

  console.error(
    `${NAMES[i]}: crop ${cropX},${cropY} ${cropW}×${cropH}  (glyph y ${y0}..${y1})`,
  );

  // Build a transparent-background PNG: alpha = (255 - average RGB),
  // RGB pinned to black so CSS-mask tinting works naturally.
  const cropped = sharp(SRC).extract({
    left: cropX,
    top: cropY,
    width: cropW,
    height: cropH,
  });
  const { data: cdata, info: cinfo } = await cropped
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(cdata.length);
  for (let p = 0; p < cdata.length; p += cinfo.channels) {
    const r = cdata[p];
    const g = cdata[p + 1];
    const b = cdata[p + 2];
    const avg = (r + g + b) / 3;
    const alpha = Math.max(0, Math.round(255 - avg));
    out[p] = 0; // R
    out[p + 1] = 0; // G
    out[p + 2] = 0; // B
    out[p + 3] = alpha; // A
  }

  const outPath = `${OUT_DIR}/event-${NAMES[i]}.png`;
  await sharp(out, {
    raw: { width: cinfo.width, height: cinfo.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.error(`  → ${outPath}`);
}

console.error("done");
