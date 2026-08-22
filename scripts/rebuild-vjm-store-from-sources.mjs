/**
 * Sync VJM-STORE case frames from portfolio source sheets (1–10).
 * Copies originals byte-for-byte — no recompression or cropping.
 *
 *   node scripts/rebuild-vjm-store-from-sources.mjs
 */
import { copyFile, mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(
  process.env.HOME || "",
  ".cursor/projects/Users-dias-WebstormProjects-next-metric/assets",
);
const OUT_DIR = path.join(ROOT, "public/images/metric/case-detail/vjm-store");

/** @type {Record<number, string>} */
const SOURCE_BY_NUM = {
  1: "1-5ef6cc2a-548d-4b34-881b-3de729f4eb54.jpg",
  2: "2-8c86f950-e245-4f91-a57c-45d5c46cdaec.jpg",
  3: "3-b8552cac-4cbb-490b-998c-df818292174b.jpg",
  4: "4-817d9ad8-36be-4479-be38-659bd39e7267.jpg",
  5: "5-e9160dec-f51c-4159-b80f-ba8cafeacc39.jpg",
  6: "6-4f2203f4-dc6a-4bac-a232-7cffea32030c.jpg",
  7: "7-08b2dc22-3f27-4ade-8a38-c5627aac29d5.jpg",
  8: "8-f8960a5f-8fad-4160-ba30-19d32432fea8.jpg",
  9: "9-6542f29b-fad9-452d-bcbc-e4a866f321f1.jpg",
  10: "10-618e00ea-d086-46e7-9b0c-a5791717bd7d.jpg",
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (let num = 1; num <= 10; num += 1) {
    const sourceName = SOURCE_BY_NUM[num];
    if (!sourceName) throw new Error(`Missing source for frame ${num}`);
    const src = path.join(ASSETS, sourceName);
    const dest = path.join(OUT_DIR, `${num}.jpg`);
    await copyFile(src, dest);
    console.log(`ok  ${num}.jpg  <=  ${sourceName}`);
  }

  for (const name of await readdir(OUT_DIR)) {
    if (/^(0[1-9]|1[0-2])-/.test(name)) {
      await unlink(path.join(OUT_DIR, name));
      console.log(`del ${name}`);
    }
  }

  console.log(`\nSynced 10 frames to ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
