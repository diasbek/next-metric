import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";

function requireEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  throw new Error(`Missing env: ${keys.join(" | ")}`);
}

function softMode() {
  return (
    process.argv.includes("--soft") ||
    process.env.CREATE_CMS_ADMIN_SOFT === "1"
  );
}

async function main() {
  const email = process.env.CMS_ADMIN_EMAIL?.trim();
  const password = process.env.CMS_ADMIN_PASSWORD?.trim();
  const secret =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_API_KEY?.trim();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();

  if (!email || !password || !secret || !url) {
    const missing = [
      !url && "NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL",
      !secret && "SUPABASE_SECRET_KEY|SUPABASE_API_KEY",
      !email && "CMS_ADMIN_EMAIL",
      !password && "CMS_ADMIN_PASSWORD",
    ].filter(Boolean);
    const msg = `create:cms-admin skipped — missing ${missing.join(", ")}`;
    if (softMode()) {
      console.warn(msg);
      return;
    }
    throw new Error(
      `Set ${missing.join(", ")} (or run with --soft to skip during postbuild)`,
    );
  }

  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) throw listError;

  let user = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("Failed to create auth user");
    user = data.user;
    console.log("Created auth user", user.id);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log("Updated existing auth user", user.id);
  }

  const { error: adminError } = await supabase.from("admin_users").upsert({
    user_id: user.id,
    email,
    role: "owner",
  });
  if (adminError) throw adminError;

  console.log(`Admin ready: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
