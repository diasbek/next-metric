import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { getAdminMessages } from "@/i18n/admin";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";
import { AdminLoginForm } from "./login-form";

function safeNextPath(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value.startsWith("/admin/")) return undefined;
  if (value.startsWith("//") || value.includes("://")) return undefined;
  if (value.startsWith("/admin/login") || value.startsWith("/admin/logout")) {
    return undefined;
  }
  return value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const locale = await getAdminUiLocale();
  const t = getAdminMessages(locale);
  const initialError =
    params.error === "not-admin"
      ? t.auth.notAdmin
      : params.error === "forbidden"
        ? t.auth.forbidden
        : params.error === "setup-locked"
          ? t.auth.setupLocked
          : "";

  return (
    <AdminLoginForm
      supabaseUrl={getSupabaseUrl()}
      supabasePublishableKey={getSupabasePublishableKey()}
      initialError={initialError}
      nextPath={safeNextPath(params.next)}
    />
  );
}
