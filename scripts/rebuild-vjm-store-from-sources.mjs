/**
 * Rebuild VJM-STORE case frames from portfolio source sheets.
 * Crops individual Amazon creatives (full-bleed) instead of stacked mockup pages.
 *
 *   node scripts/rebuild-vjm-store-from-sources.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(
  process.env.HOME || "",
  ".cursor/projects/Users-dias-WebstormProjects-next-metric/assets",
);
const OUT_DIR = path.join(ROOT, "public/images/metric/case-detail/vjm-store");
const META_PATH = path.join(ROOT, "src/data/case-image-meta.ts");

const JPEG = {
  quality: 92,
  mozjpeg: true,
  progressive: true,
  chromaSubsampling: "4:4:4",
};

/** @type {Record<number, string>} */
const SOURCE_BY_NUM = {
  1: "1-7c7304a9-86f1-4a4c-92d4-e89a9023b8fb.jpg",
  2: "2-1a7bc703-86b8-40d8-8c52-5177ef93b4c5.jpg",
  3: "3-edcffa9a-cd98-4bb0-b75a-9a3d60b7a1db.jpg",
  4: "4-3456af73-f0af-4e0e-9f53-3f43a4368e81.jpg",
  5: "5-04f65723-08a2-4526-8605-ebd0f0bdb2e3.jpg",
  6: "6-5c816fb1-21ad-4a9c-8bcd-28b3ea0a9ca9.jpg",
  7: "7-6fda28ad-5e44-4657-88f8-198c5064ab2d.jpg",
  8: "8-5b6d2d81-eecc-41a4-aca6-a1f20d010afd.jpg",
  9: "9-72461b90-dbb6-439f-bf0e-453154c46b90.jpg",
  10: "10-62aee9f2-8e50-4fa4-b05f-f704e4e7858f.jpg",
};

/**
 * Output frames in display order.
 * Each entry: output filename + crop on source sheet (1024×963 coords).
 */
const FRAMES = [
  { file: "01-phone-listing.jpg", src: 1, crop: null },
  { file: "02-project-intro.jpg", src: 2, crop: null },
  { file: "03-workshop-hero.jpg", src: 3, crop: { left: 0, top: 0, width: 1024, height: 520 } },
  {
    file: "04-complete-set.jpg",
    src: 4,
    crop: { left: 468, top: 418, width: 556, height: 545 },
  },
  {
    file: "05-bristle-recovery.jpg",
    src: 5,
    crop: { left: 24, top: 28, width: 520, height: 470 },
  },
  {
    file: "06-multi-surface.jpg",
    src: 5,
    crop: { left: 430, top: 360, width: 580, height: 590 },
  },
  {
    file: "07-extended-reach.jpg",
    src: 6,
    crop: { left: 20, top: 24, width: 540, height: 455 },
  },
  {
    file: "08-performance.jpg",
    src: 6,
    crop: { left: 468, top: 395, width: 556, height: 555 },
  },
  {
    file: "09-lifestyle-trust.jpg",
    src: 7,
    crop: { left: 28, top: 24, width: 520, height: 520 },
  },
  { file: "10-ebc-hero.jpg", src: 8, crop: { left: 0, top: 0, width: 1024, height: 520 } },
  { file: "11-aplus-modules.jpg", src: 9, crop: null, trim: true },
  { file: "12-store-mockup.jpg", src: 10, crop: null },
];

async function sourcePath(num) {
  const name = SOURCE_BY_NUM[num];
  if (!name) throw new Error(`Missing source mapping for ${num}`);
  return path.join(ASSETS, name);
}

async function exportFrame({ file, src, crop, trim }) {
  const input = await sourcePath(src);
  let pipeline = sharp(input, { failOn: "none" }).rotate();

  if (crop) {
    pipeline = pipeline.extract(crop);
  }

  if (trim) {
    pipeline = pipeline.trim({ threshold: 24, background: "#e8b03d" });
  }

  if (crop || trim) {
    pipeline = pipeline.resize({
      width: 1024,
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    });
  }

  const outPath = path.join(OUT_DIR, file);
  await pipeline.jpeg(JPEG).toFile(outPath);

  const meta = await sharp(outPath).metadata();
  const publicPath = `/images/metric/case-detail/vjm-store/${file}`;
  return {
    publicPath,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

async function writeMeta(entries) {
  const existing = await readFile(META_PATH, "utf8");
  const match = existing.match(
    /export const CASE_IMAGE_META[^=]*=\s*(\{[\s\S]*?\})\s*as const;/,
  );
  if (!match) {
    throw new Error(`Could not parse ${META_PATH}`);
  }

  const current = Function(`"use strict"; return (${match[1]});`)();
  for (const { publicPath, width, height } of entries) {
    current[publicPath] = { width, height };
  }

  for (const key of Object.keys(current)) {
    if (/vjm-store\/\d+\.jpg$/.test(key)) {
      delete current[key];
    }
  }

  const mapBody = JSON.stringify(current, null, 2)
    .replace(/"width":/g, "width:")
    .replace(/"height":/g, "height:");

  const body = existing.replace(
    /\/\*\* Intrinsic pixel sizes[\s\S]*$/,
    `/** Intrinsic pixel sizes for public case photos (used by Next/Image). */
export const CASE_IMAGE_META: Record<string, { width: number; height: number }> = ${mapBody} as const;

export function getCaseImageMeta(src: string) {
  return CASE_IMAGE_META[src] ?? { width: 1920, height: 1502 };
}

/** Rendered width for full-bleed galleries inside \`.page-container\`. */
export const CASE_GALLERY_SIZES =
  "(max-width: 1512px) 100vw, (max-width: 3840px) 90vw, 3840px";

/** Smaller srcset for the progressive preview pass. */
export const CASE_GALLERY_PREVIEW_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1512px) 50vw, 960px";
`,
  );

  await writeFile(META_PATH, body);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const entries = [];
  for (const frame of FRAMES) {
    const result = await exportFrame(frame);
    entries.push(result);
    console.log(`ok  ${frame.file}  ${result.width}x${result.height}`);
  }

  await writeMeta(entries);

  // Remove legacy 1.jpg … 10.jpg if present
  const { readdir, unlink } = await import("node:fs/promises");
  for (const name of await readdir(OUT_DIR)) {
    if (/^[0-9]+\.jpg$/.test(name)) {
      await unlink(path.join(OUT_DIR, name));
      console.log(`del legacy ${name}`);
    }
  }

  console.log(`\nWrote ${entries.length} frames + ${path.relative(ROOT, META_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
