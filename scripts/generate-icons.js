#!/usr/bin/env node
/**
 * Regenerates METRIC favicons + PWA icons from the pink M mark.
 * Usage: node scripts/generate-icons.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const ICONS = path.join(PUB, "icons");
const APP = path.join(ROOT, "src", "app");

const PINK = "#FF3C82";
const WHITE = "#FFFFFF";

/** Brand M path from Figma logo (original viewBox ~0 0 53.26 42). */
const M_PATH =
  "M53.2564 1.06299V40.3547C53.2564 40.9286 52.7973 41.3877 52.2234 41.3877H41.6257C41.0518 41.3877 40.5927 40.9286 40.5927 40.3547V27.7676C40.5927 26.8876 39.5597 26.3903 38.9093 26.9642L28.6942 35.3428L21.578 41.1582C20.8894 41.732 19.8946 41.2347 19.8946 40.3547V28.418C19.8946 27.8441 19.4355 27.385 18.8616 27.385C18.6321 27.385 18.4025 27.4615 18.2112 27.6146C18.173 27.6146 18.173 27.6528 18.173 27.6528L7.88133 36.108L1.68339 41.1582C0.994734 41.732 0 41.2347 0 40.3547V35.3428V26.6964C0 26.3903 0.153036 26.0842 0.382589 25.8929L18.2495 11.2398C18.9381 10.6659 19.9329 11.1633 19.9329 12.0433V23.98C19.9329 24.5539 20.392 25.013 20.9659 25.013C21.1954 25.013 21.425 24.9364 21.578 24.8217C21.6163 24.8217 21.6163 24.7834 21.6545 24.7452L40.6309 9.21211L51.573 0.221301C52.2234 -0.314322 53.2564 0.183041 53.2564 1.06299Z";

/** Full-bleed M for small favicons / browser tabs. */
function svgAny(size) {
  const pad = size * 0.18;
  const inner = size - pad * 2;
  const scale = Math.min(inner / 53.2564, inner / 42);
  const tw = 53.2564 * scale;
  const th = 42 * scale;
  const tx = (size - tw) / 2;
  const ty = (size - th) / 2;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PINK}"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">
    <path fill="${WHITE}" d="${M_PATH}"/>
  </g>
</svg>`);
}

/** Maskable: keep mark inside ~80% safe zone (Android adaptive icons). */
function svgMaskable(size) {
  const pad = size * 0.22;
  const inner = size - pad * 2;
  const scale = Math.min(inner / 53.2564, inner / 42);
  const tw = 53.2564 * scale;
  const th = 42 * scale;
  const tx = (size - tw) / 2;
  const ty = (size - th) / 2;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PINK}"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">
    <path fill="${WHITE}" d="${M_PATH}"/>
  </g>
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
  fs.mkdirSync(path.join(PUB, "images", "logo"), { recursive: true });

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

  console.log("Generated Metric icons in public/icons, favicon.ico, apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
