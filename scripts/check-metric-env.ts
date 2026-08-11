#!/usr/bin/env tsx
/**
 * Validate local Metric CMS env and print a setup checklist.
 *
 *   npx tsx scripts/check-metric-env.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

type Check = { ok: boolean; label: string; detail?: string };

function present(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

async function main() {
  const checks: Check[] = [];

  const url = present("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const anon = present(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
  const secret = present(
    "SUPABASE_SECRET_KEY",
    "SUPABASE_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  );
  const bootstrap = present("CMS_BOOTSTRAP_SECRET", "SETUP_SECRET");

  checks.push({
    ok: Boolean(url),
    label: "Supabase URL",
    detail: url || "missing NEXT_PUBLIC_SUPABASE_URL",
  });
  checks.push({
    ok: Boolean(anon),
    label: "Publishable / anon key",
    detail: anon ? "set" : "missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  });
  checks.push({
    ok: Boolean(secret),
    label: "Service role secret",
    detail: secret
      ? "set"
      : "PASTE from Dashboard → Settings → API → service_role",
  });
  checks.push({
    ok: Boolean(bootstrap),
    label: "CMS_BOOTSTRAP_SECRET",
    detail: bootstrap ? "set (needed for /admin/setup/)" : "missing",
  });

  const adminEmail = present("CMS_ADMIN_EMAIL");
  const adminPassword = present("CMS_ADMIN_PASSWORD");
  checks.push({
    ok: Boolean(adminEmail && adminPassword),
    label: "CMS_ADMIN_EMAIL / PASSWORD",
    detail:
      adminEmail && adminPassword
        ? `${adminEmail} (postbuild create:cms-admin)`
        : "set on Hostinger so postbuild can create the owner",
  });

  if (url && anon) {
    const pub = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await pub
      .from("metric_home")
      .select("status")
      .eq("id", 1)
      .maybeSingle();
    checks.push({
      ok: !error && data?.status === "published",
      label: "Public read metric_home",
      detail: error?.message ?? data?.status ?? "empty",
    });

    const faq = await pub
      .from("metric_faq_items")
      .select("id", { count: "exact", head: true });
    checks.push({
      ok: !faq.error && (faq.count ?? 0) > 0,
      label: "Public read metric_faq_items",
      detail: faq.error?.message ?? `count=${faq.count ?? 0}`,
    });
  }

  if (url && secret) {
    const admin = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { count, error } = await admin
      .from("metric_admin_users")
      .select("user_id", { count: "exact", head: true });
    checks.push({
      ok: !error,
      label: "Admin client (service role)",
      detail: error
        ? error.message
        : `metric_admin_users=${count ?? 0} (0 → use /admin/setup/)`,
    });
  }

  console.log("\nMetric CMS env checklist\n");
  for (const check of checks) {
    console.log(`${check.ok ? "✓" : "✗"} ${check.label}`);
    if (check.detail) console.log(`  ${check.detail}`);
  }

  const failed = checks.filter((c) => !c.ok);
  console.log("");
  if (failed.length) {
    console.log("Next steps:");
    console.log(
      "1. Open https://supabase.com/dashboard/project/ginhgueucvaqxhphplmy/settings/api-keys",
    );
    console.log("2. Reveal Secret / service_role → SUPABASE_SECRET_KEY (+ SUPABASE_API_KEY)");
    console.log("3. Apply metric migrations in SQL Editor (or DATABASE_URL + npm run db:migrate)");
    console.log("4. Set CMS_ADMIN_EMAIL + CMS_ADMIN_PASSWORD; npm run create:cms-admin");
    console.log("5. Login at /admin/login/ (server-side — no browser → supabase.co)");
    process.exitCode = 1;
    return;
  }

  console.log("All checks passed.");
  console.log("Login: /admin/login/  |  Setup: /admin/setup/  |  Home: /admin/home/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
