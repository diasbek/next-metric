/**
 * One-shot compressor for public marketing photos.
 * Resizes oversized masters to a retina-safe max edge and re-encodes
 * with sharp so Next/Image has a smaller source to work from.
 *
 *   node scripts/optimize-metric-images.mjs
 */
import { readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = path.join(ROOT, "public/images/metric");

/** Longest edge — covers 1392px case-detail @ 2x with headroom. */
const MAX_EDGE = 2400;
const JPEG_QUALITY = 86;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return null;

  const before = (await stat(file)).size;
  const image = sharp(file, { failOn: "none" });
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) return null;

  const longest = Math.max(width, height);
  const pipeline = image.rotate();
  if (longest > MAX_EDGE) {
    pipeline.resize({
      width: width >= height ? MAX_EDGE : undefined,
      height: height > width ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const tmp = `${file}.opt`;
  if (ext === ".png") {
    // Keep alpha PNGs as PNG. Palette dithering is too lossy for
    // illustrations with gradients (workflow cards).
    await pipeline
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toFile(tmp);
  } else {
    await pipeline
      .jpeg({
        quality: JPEG_QUALITY,
        mozjpeg: true,
        progressive: true,
        chromaSubsampling: "4:4:4",
      })
      .toFile(tmp);
  }

  const after = (await stat(tmp)).size;
  if (after >= before * 0.97) {
    await rm(tmp, { force: true });
    return { file, skipped: true, before, after: before };
  }

  await rename(tmp, file);
  return { file, skipped: false, before, after };
}

const files = await walk(TARGET);
let saved = 0;
let touched = 0;

for (const file of files) {
  const result = await optimize(file);
  if (!result) continue;
  const rel = path.relative(ROOT, result.file);
  if (result.skipped) {
    console.log(`skip  ${rel} (${formatKb(result.before)})`);
    continue;
  }
  touched += 1;
  saved += result.before - result.after;
  console.log(
    `ok    ${rel}  ${formatKb(result.before)} → ${formatKb(result.after)}`,
  );
}

console.log(
  `\ndone  ${touched} files rewritten, saved ${formatKb(saved)}`,
);
