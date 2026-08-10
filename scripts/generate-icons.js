#!/usr/bin/env node
/**
 * Regenerates METRIC favicons + PWA icons from a vector T mark.
 * Usage: node scripts/generate-icons.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const ICONS = path.join(PUB, "icons");
const APP = path.join(ROOT, "src", "app");

const BLUE = "#2600FF";
const WHITE = "#FFFFFF";

/** Full-bleed T for small favicons / browser tabs. */
function svgAny(size) {
  const pad = size * 0.14;
  const barH = size * 0.158;
  const stemW = size * 0.202;
  const x0 = pad;
  const x1 = size - pad;
  const y0 = pad;
  const barBottom = y0 + barH;
  const stemLeft = (size - stemW) / 2;
  const stemRight = stemLeft + stemW;
  const y1 = size - pad;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BLUE}"/>
  <path fill="${WHITE}" d="M${x0} ${y0}H${x1}V${barBottom}H${stemRight}V${y1}H${stemLeft}V${barBottom}H${x0}Z"/>
</svg>`);
}

/** Maskable: keep mark inside ~80% safe zone (Android adaptive icons). */
function svgMaskable(size) {
  const pad = size * 0.22;
  const barH = size * 0.12;
  const stemW = size * 0.16;
  const x0 = pad;
  const x1 = size - pad;
  const y0 = pad;
  const barBottom = y0 + barH;
  const stemLeft = (size - stemW) / 2;
  const stemRight = stemLeft + stemW;
  const y1 = size - pad;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BLUE}"/>
  <path fill="${WHITE}" d="M${x0} ${y0}H${x1}V${barBottom}H${stemRight}V${y1}H${stemLeft}V${barBottom}H${x0}Z"/>
</svg>`);
}

function pngsToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const buf of pngBuffers) {
    const w = (buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19];
    const h = (buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23];
    entries.push({ w: w >= 256 ? 0 : w, h: h >= 256 ? 0 : h, buf, offset });
    offset += buf.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  let entryAt = 6;
  for (const e of entries) {
    out[entryAt] = e.w;
    out[entryAt + 1] = e.h;
    out[entryAt + 2] = 0;
    out[entryAt + 3] = 0;
    out.writeUInt16LE(1, entryAt + 4);
    out.writeUInt16LE(32, entryAt + 6);
    out.writeUInt32LE(e.buf.length, entryAt + 8);
    out.writeUInt32LE(e.offset, entryAt + 12);
    entryAt += 16;
  }
  for (const e of entries) e.buf.copy(out, e.offset);
  return out;
}

async function writePng(svg, outPath) {
  await sharp(svg).png({ compressionLevel: 9 }).toFile(outPath);
}

async function main() {
  fs.mkdirSync(ICONS, { recursive: true });
  fs.mkdirSync(path.join(PUB, "images"), { recursive: true });

  const sizes = [16, 32, 48, 180, 192, 512];
  for (const size of sizes) {
    await writePng(svgAny(size), path.join(ICONS, `icon-${size}.png`));
  }

  await writePng(svgMaskable(512), path.join(ICONS, "icon-maskable-512.png"));
  fs.writeFileSync(path.join(ICONS, "icon.svg"), svgAny(512));

  const icoPngs = await Promise.all(
    [16, 32, 48].map((size) => sharp(svgAny(size)).png().toBuffer()),
  );
  const ico = pngsToIco(icoPngs);
  fs.writeFileSync(path.join(PUB, "favicon.ico"), ico);
  fs.writeFileSync(path.join(APP, "favicon.ico"), ico);

  await writePng(svgAny(180), path.join(PUB, "apple-icon.png"));
  await writePng(svgAny(180), path.join(APP, "apple-icon.png"));
  await writePng(svgAny(32), path.join(PUB, "images", "favicon-32.png"));
  // Next.js App Router file convention (served as /icon.png)
  await writePng(svgAny(32), path.join(APP, "icon.png"));

  console.log("Generated icons in public/icons, favicon.ico, apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
