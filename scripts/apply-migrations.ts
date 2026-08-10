#!/usr/bin/env tsx
/**
 * Bundle or apply SQL migrations from supabase/migrations/
 *
 *   npm run db:migrations:bundle   → writes supabase/snapshots/full_schema.sql
 *   npm run db:migrate             → applies via psql if DATABASE_URL / SUPABASE_DB_URL set
 *   npm run db:migrate -- --dry-run
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationsDir = path.join(root, "supabase", "migrations");
const snapshotDir = path.join(root, "supabase", "snapshots");
const snapshotFile = path.join(snapshotDir, "full_schema.sql");

function listMigrations(): string[] {
  if (!existsSync(migrationsDir)) {
    throw new Error(`Missing ${migrationsDir}`);
  }
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => path.join(migrationsDir, name));
}

function bundle(): string {
  const files = listMigrations();
  const parts = [
    "-- AUTO-GENERATED — do not edit by hand",
    `-- Source: supabase/migrations/*.sql (${files.length} files)`,
    `-- Generated: ${new Date().toISOString()}`,
    "",
  ];

  for (const file of files) {
    const name = path.basename(file);
    parts.push(`-- ============================================================================`);
    parts.push(`-- >>> ${name}`);
    parts.push(`-- ============================================================================`);
    parts.push(readFileSync(file, "utf8").trimEnd());
    parts.push("");
  }

  const sql = parts.join("\n");
  mkdirSync(snapshotDir, { recursive: true });
  writeFileSync(snapshotFile, sql + "\n", "utf8");
  return sql;
}

function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ""
  );
}

function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const bundleOnly =
    args.has("--bundle") || process.env.npm_lifecycle_event === "db:migrations:bundle";

  const files = listMigrations();
  console.log("Migrations:");
  for (const file of files) {
    console.log(`  - ${path.basename(file)}`);
  }

  const sql = bundle();
  console.log(`\nBundled → ${path.relative(root, snapshotFile)} (${sql.length} bytes)`);

  if (bundleOnly) {
    return;
  }

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.log(`
No DATABASE_URL / SUPABASE_DB_URL set.

To apply on a new project:
  1) Paste supabase/snapshots/full_schema.sql into Supabase SQL Editor, or
  2) export DATABASE_URL='postgresql://...' && npm run db:migrate
`);
    return;
  }

  if (dryRun) {
    console.log("Dry run — skipping psql apply.");
    return;
  }

  const psql = spawnSync(
    "psql",
    [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", snapshotFile],
    { stdio: "inherit" },
  );

  if (psql.error) {
    throw new Error(
      `psql not available (${psql.error.message}). Paste ${path.relative(root, snapshotFile)} in SQL Editor instead.`,
    );
  }
  if (psql.status !== 0) {
    process.exit(psql.status ?? 1);
  }
  console.log("Migrations applied.");
}

main();
