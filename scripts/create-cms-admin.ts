import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

function requireEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  throw new Error(`Missing env: ${keys.join(" | ")}`);
}

async function main() {
  const email = process.env.CMS_ADMIN_EMAIL?.trim();
  const password = process.env.CMS_ADMIN_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("Set CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD in the environment");
  }

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY", "SUPABASE_API_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

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
