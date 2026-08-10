#!/usr/bin/env tsx
/**
 * Copy CMS rows (+ optional storage) from SOURCE Supabase → TARGET Supabase.
 *
 *   SOURCE_SUPABASE_URL=... SOURCE_SUPABASE_SECRET_KEY=... \
 *   TARGET_SUPABASE_URL=... TARGET_SUPABASE_SECRET_KEY=... \
 *   npx tsx scripts/cms-migrate-content.ts
 *
 * Flags:
 *   --with-leads     also copy leads
 *   --with-storage   copy media + site-files objects
 *   --dry-run        print counts only
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const CMS_TABLES = [
  "site_settings",
  "page_seo",
  "projects",
  "project_translations",
  "project_media",
  "services",
  "service_translations",
  "faq_items",
  "faq_translations",
  "process_steps",
  "process_step_translations",
  "benefits",
  "benefit_translations",
  "team_members",
  "team_member_translations",
  "testimonials",
  "testimonial_translations",
  "agency_content",
  "agency_translations",
] as const;

const STORAGE_BUCKETS = ["media", "site-files"] as const;

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function client(urlEnv: string, keyEnv: string): SupabaseClient {
  return createClient(requireEnv(urlEnv), requireEnv(keyEnv), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function copyTable(
  source: SupabaseClient,
  target: SupabaseClient,
  table: string,
  dryRun: boolean,
): Promise<number> {
  const { data, error } = await source.from(table).select("*");
  if (error) throw new Error(`${table} select: ${error.message}`);
  const rows = data ?? [];
  console.log(`  ${table}: ${rows.length} row(s)`);
  if (dryRun || rows.length === 0) return rows.length;

  const { error: upsertError } = await target.from(table).upsert(rows);
  if (upsertError) throw new Error(`${table} upsert: ${upsertError.message}`);
  return rows.length;
}

async function listAllPaths(
  sb: SupabaseClient,
  bucket: string,
  prefix = "",
): Promise<string[]> {
  const out: string[] = [];
  const { data, error } = await sb.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw new Error(`${bucket} list ${prefix}: ${error.message}`);
  for (const entry of data ?? []) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      out.push(...(await listAllPaths(sb, bucket, path)));
    } else {
      out.push(path);
    }
  }
  return out;
}

async function copyBucket(
  source: SupabaseClient,
  target: SupabaseClient,
  bucket: string,
  dryRun: boolean,
): Promise<number> {
  const paths = await listAllPaths(source, bucket);
  console.log(`  storage/${bucket}: ${paths.length} object(s)`);
  if (dryRun) return paths.length;

  for (const path of paths) {
    const { data, error } = await source.storage.from(bucket).download(path);
    if (error || !data) {
      console.warn(`    skip download ${path}: ${error?.message}`);
      continue;
    }
    const { error: upErr } = await target.storage
      .from(bucket)
      .upload(path, data, { upsert: true, contentType: data.type || undefined });
    if (upErr) console.warn(`    skip upload ${path}: ${upErr.message}`);
  }
  return paths.length;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const withLeads = args.has("--with-leads");
  const withStorage = args.has("--with-storage");

  const source = client("SOURCE_SUPABASE_URL", "SOURCE_SUPABASE_SECRET_KEY");
  const target = client("TARGET_SUPABASE_URL", "TARGET_SUPABASE_SECRET_KEY");

  console.log(dryRun ? "Dry run\n" : "Migrating CMS…\n");

  const tables = withLeads ? [...CMS_TABLES, "leads"] : [...CMS_TABLES];
  for (const table of tables) {
    await copyTable(source, target, table, dryRun);
  }

  if (withStorage) {
    console.log("\nStorage:");
    for (const bucket of STORAGE_BUCKETS) {
      await copyBucket(source, target, bucket, dryRun);
    }
  }

  console.log("\nDone.");
  if (!dryRun) {
    console.log(
      "Reminder: rewrite any absolute source-storage URLs in CMS text to the target host if needed.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
