#!/usr/bin/env tsx
/**
 * Move case assets from public/images → metric-media Storage and rewrite CMS URLs.
 *
 * Idempotent: skips URLs that already point at Storage.
 *
 *   npx tsx scripts/migrate-case-images-to-storage.ts
 *   npx tsx scripts/migrate-case-images-to-storage.ts --dry-run
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const MEDIA_BUCKET = "metric-media";
const MAX_EDGE = 2800;
const WEBP_QUALITY = 90;
const COVER_MAX_EDGE = 1920;
const COVER_QUALITY = 85;

const ROOT = path.join(import.meta.dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");

const dryRun = process.argv.includes("--dry-run");

function requireEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  throw new Error(`Missing env: ${keys.join(" | ")}`);
}

function admin() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY", "SUPABASE_API_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function isStorageUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${MEDIA_BUCKET}/`);
}

function isLocalPublicImage(url: string): boolean {
  return url.startsWith("/images/");
}

function publicPathFromUrl(url: string): string {
  return path.join(PUBLIC_DIR, url.replace(/^\//, ""));
}

function sanitizeFilename(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 80);
}

async function optimizeBuffer(
  buffer: Buffer,
  maxEdge: number,
  quality: number,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? maxEdge;
  const height = meta.height ?? maxEdge;
  const needsResize = width > maxEdge || height > maxEdge;

  let pipeline = image;
  if (needsResize) {
    pipeline = pipeline.resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const webp = await pipeline.webp({ quality, effort: 4 }).toBuffer();
  const out = await sharp(webp).metadata();
  return {
    buffer: webp,
    width: out.width ?? width,
    height: out.height ?? height,
  };
}

async function uploadOptimized(
  supabase: ReturnType<typeof admin>,
  localFile: string,
  storagePath: string,
  maxEdge: number,
  quality: number,
): Promise<{ publicUrl: string; width: number; height: number }> {
  const raw = await readFile(localFile);
  const optimized = await optimizeBuffer(raw, maxEdge, quality);

  if (dryRun) {
    const size = (await stat(localFile)).size;
    console.log(
      `  [dry-run] ${localFile} (${(size / 1024).toFixed(0)}KB) → ${storagePath} ${optimized.width}×${optimized.height}`,
    );
    const base = requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL").replace(
      /\/$/,
      "",
    );
    return {
      publicUrl: `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`,
      width: optimized.width,
      height: optimized.height,
    };
  }

  const body = new Uint8Array(optimized.buffer);
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, body, {
    contentType: "image/webp",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`upload ${storagePath}: ${error.message}`);

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  return {
    publicUrl: data.publicUrl,
    width: optimized.width,
    height: optimized.height,
  };
}

async function migrateUrl(
  supabase: ReturnType<typeof admin>,
  url: string,
  folder: string,
  hint: string,
  quality: "case" | "cover",
): Promise<{ publicUrl: string; width: number; height: number } | null> {
  if (!url || isStorageUrl(url)) return null;
  if (!isLocalPublicImage(url)) {
    console.warn(`  skip non-local URL: ${url}`);
    return null;
  }

  const localFile = publicPathFromUrl(url);
  if (!existsSync(localFile)) {
    console.warn(`  missing file: ${localFile}`);
    return null;
  }

  const base = sanitizeFilename(hint || path.basename(url, path.extname(url)));
  const storagePath = `${folder}/${Date.now()}-${base}.webp`;
  const maxEdge = quality === "case" ? MAX_EDGE : COVER_MAX_EDGE;
  const q = quality === "case" ? WEBP_QUALITY : COVER_QUALITY;

  return uploadOptimized(supabase, localFile, storagePath, maxEdge, q);
}

async function main() {
  const supabase = admin();

  const { data: projects, error } = await supabase
    .from("metric_projects")
    .select("id, slug, cover_image, og_image");
  if (error) throw new Error(error.message);

  let migrated = 0;
  let skipped = 0;

  for (const project of projects ?? []) {
    console.log(`\n${project.slug} (${project.id})`);

    // Cover
    if (project.cover_image && isLocalPublicImage(project.cover_image)) {
      const result = await migrateUrl(
        supabase,
        project.cover_image,
        `projects/${project.id}/cover`,
        "cover",
        "cover",
      );
      if (result) {
        if (!dryRun) {
          await supabase
            .from("metric_projects")
            .update({ cover_image: result.publicUrl })
            .eq("id", project.id);
        }
        console.log(`  cover → ${result.publicUrl}`);
        migrated++;
      }
    } else {
      skipped++;
    }

    // OG
    if (project.og_image && isLocalPublicImage(project.og_image)) {
      const result = await migrateUrl(
        supabase,
        project.og_image,
        `projects/${project.id}/og`,
        "og",
        "cover",
      );
      if (result) {
        if (!dryRun) {
          await supabase
            .from("metric_projects")
            .update({ og_image: result.publicUrl })
            .eq("id", project.id);
        }
        console.log(`  og → ${result.publicUrl}`);
        migrated++;
      }
    }

    const { data: media, error: mediaError } = await supabase
      .from("metric_project_media")
      .select("id, kind, url, sort_order")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true });
    if (mediaError) throw new Error(mediaError.message);

    for (const row of media ?? []) {
      if (!row.url || isStorageUrl(row.url)) {
        skipped++;
        continue;
      }
      if (!isLocalPublicImage(row.url)) {
        console.warn(`  skip media ${row.id}: ${row.url}`);
        skipped++;
        continue;
      }

      const useCase =
        row.kind === "gallery" ||
        row.kind === "before" ||
        row.kind === "after" ||
        row.kind === "hero";

      const result = await migrateUrl(
        supabase,
        row.url,
        `projects/${project.id}/${row.kind}`,
        `${row.kind}-${row.sort_order}`,
        useCase ? "case" : "cover",
      );
      if (!result) {
        skipped++;
        continue;
      }

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from("metric_project_media")
          .update({
            url: result.publicUrl,
            width: result.width,
            height: result.height,
          })
          .eq("id", row.id);
        if (updateError) throw new Error(updateError.message);
      }
      console.log(
        `  ${row.kind} ${row.id.slice(0, 8)} → ${result.width}×${result.height}`,
      );
      migrated++;
    }
  }

  console.log(
    `\nDone. migrated=${migrated} skipped=${skipped}${dryRun ? " (dry-run)" : ""}`,
  );
  if (!dryRun && migrated > 0) {
    console.log(
      "Note: restart Next.js (or revalidate cms/projects tags) so public pages pick up Storage URLs.",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
