import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets-logo-source.png");
const PUBLIC = path.join(ROOT, "public");
const APP = path.join(ROOT, "app");

async function cutoutBackground() {
  const img = sharp(SRC).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const bg = new Uint8Array(width * height);
  const brightnessOf = (i) => {
    const o = i * channels;
    return Math.max(data[o], data[o + 1], data[o + 2]);
  };

  const FLOOD_T = 34;
  const stack = [];
  const idx = (x, y) => y * width + x;

  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const i = idx(x, y);
      if (!bg[i] && brightnessOf(i) <= FLOOD_T) {
        bg[i] = 1;
        stack.push([x, y]);
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (const x of [0, width - 1]) {
      const i = idx(x, y);
      if (!bg[i] && brightnessOf(i) <= FLOOD_T) {
        bg[i] = 1;
        stack.push([x, y]);
      }
    }
  }

  while (stack.length) {
    const [x, y] = stack.pop();
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = idx(nx, ny);
      if (bg[ni]) continue;
      if (brightnessOf(ni) <= FLOOD_T) {
        bg[ni] = 1;
        stack.push([nx, ny]);
      }
    }
  }

  // Soften edges: foreground pixels touching background get partial alpha
  // based on brightness, so the cutout doesn't look jagged.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y);
      const o = i * channels;
      if (bg[i]) {
        data[o + 3] = 0;
        continue;
      }
      let nearBg = false;
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
        [x + 1, y + 1],
        [x - 1, y - 1],
        [x + 1, y - 1],
        [x - 1, y + 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (bg[idx(nx, ny)]) {
          nearBg = true;
          break;
        }
      }
      if (nearBg) {
        const b = brightnessOf(i);
        const alpha = Math.max(0, Math.min(255, Math.round(((b - FLOOD_T) / (100 - FLOOD_T)) * 255)));
        data[o + 3] = alpha;
      }
    }
  }

  return sharp(data, { raw: { width, height, channels } }).png();
}

async function main() {
  fs.mkdirSync(PUBLIC, { recursive: true });

  const cutout = await cutoutBackground();
  const buf = await cutout.toBuffer();

  // Full lockup (icon + wordmark), trimmed of transparent padding.
  await sharp(buf)
    .trim({ threshold: 10 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC, "logo.png"));

  // Icon-only crop (left symbol) for favicons — crop the left portion,
  // then trim transparent padding to tightly bound the mark.
  const meta = await sharp(buf).metadata();
  const iconRegionWidth = Math.round(meta.width * 0.31);
  const roughCrop = await sharp(buf)
    .extract({ left: 0, top: 0, width: iconRegionWidth, height: meta.height })
    .png()
    .toBuffer();
  const iconBuf = await sharp(roughCrop)
    .trim({ threshold: 10, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const iconMeta = await sharp(iconBuf).metadata();
  const side = Math.max(iconMeta.width, iconMeta.height);
  const pad = Math.round(side * 0.08);
  const canvas = side + pad * 2;

  const squared = await sharp(iconBuf)
    .resize({
      width: canvas - pad * 2,
      height: canvas - pad * 2,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(squared).resize(512, 512).png().toFile(path.join(PUBLIC, "icon-mark.png"));
  await sharp(squared).resize(32, 32).png().toFile(path.join(APP, "icon.png"));
  await sharp(squared)
    .resize(180, 180)
    .flatten({ background: "#0A0A0A" })
    .png()
    .toFile(path.join(APP, "apple-icon.png"));

  console.log("Logo processed:", {
    fullLogo: "public/logo.png",
    iconMark: "public/icon-mark.png",
    favicon: "app/icon.png",
    appleIcon: "app/apple-icon.png",
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
