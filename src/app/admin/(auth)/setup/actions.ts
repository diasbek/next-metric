"use server";

import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { safeEqual } from "@/lib/security/secrets";
import { getEnv } from "@/utils/env";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

function bootstrapSecretConfigured(): string {
  return getEnv("CMS_BOOTSTRAP_SECRET", "SETUP_SECRET");
}

export async function canBootstrapAdmin(): Promise<boolean> {
  if (!hasSupabaseAdminConfig()) return false;
  if (!bootstrapSecretConfigured()) return false;
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("metric_admin_users")
    .select("user_id", { count: "exact", head: true });
  if (error) return false;
  return (count ?? 0) === 0;
}

export async function bootstrapAdminAction(formData: FormData) {
  const t = getAdminMessages(await getAdminUiLocale());

  if (!(await canBootstrapAdmin())) {
    return adminFail(t.auth.setupUnavailable);
  }

  const expected = bootstrapSecretConfigured();
  const provided = String(formData.get("bootstrap_secret") ?? "");
  if (!safeEqual(provided, expected)) {
    return adminFail(t.auth.invalidBootstrapSecret);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8) {
    throw new Error("Email and password (min 8 chars) are required");
  }
  if (password.length > 128) {
    return adminFail("Password too long");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    return adminFail(error?.message ?? "Failed to create auth user");
  }

  const { error: adminError } = await supabase.from("metric_admin_users").insert({
    user_id: data.user.id,
    email,
    role: "owner",
  });
  if (adminError) {
    return adminFail(adminError.message);
  }

  return adminRedirect("/admin/login/");
}
