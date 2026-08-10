import { requireOwner } from "@/lib/cms/auth";
import { parseSiteVerificationToken } from "@/lib/cms/verification";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SettingsEditor } from "@/components/admin/settings/SettingsEditor";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireOwner();
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();
  const [{ data: settings }, { data: seo }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("page_seo").select("*"),
  ]);

  return (
    <SettingsEditor
      settings={{
        phone: settings?.phone ?? "",
        email: settings?.email ?? "",
        telegram_url: settings?.telegram_url ?? "",
        instagram_url: settings?.instagram_url ?? "",
        presentation_url: settings?.presentation_url ?? "",
        brief_url: settings?.brief_url ?? "",
        address_lines: (settings?.address_lines ?? []).join("\n"),
        telegram_notify_enabled: Boolean(settings?.telegram_notify_enabled),
        telegram_chat_ids: (settings?.telegram_chat_ids ?? []).join("\n"),
        captcha_provider: settings?.captcha_provider ?? "none",
        captcha_site_key: settings?.captcha_site_key ?? "",
        yandex_metrika_id: settings?.yandex_metrika_id ?? "",
        yandex_webmaster_verification: parseSiteVerificationToken(
          settings?.yandex_webmaster_verification,
        ),
        google_analytics_id: settings?.google_analytics_id ?? "",
        google_tag_manager_id: settings?.google_tag_manager_id ?? "",
        google_site_verification: parseSiteVerificationToken(
          settings?.google_site_verification,
        ),
        botTokenConfigured: Boolean(settings?.telegram_bot_token?.trim()),
        captchaSecretConfigured: Boolean(settings?.captcha_secret_key?.trim()),
        webhookSecretConfigured: Boolean(settings?.telegram_webhook_secret?.trim()),
        webhookSecretPresent: Boolean(settings?.telegram_webhook_secret),
      }}
      seo={(seo ?? []).map((row) => ({
        locale: row.locale,
        page_key: row.page_key,
        title: row.title ?? "",
        description: row.description ?? "",
        keywords: row.keywords ?? "",
      }))}
      flash={{
        saved: Boolean(params.saved),
        webhook: params.webhook,
        test: Boolean(params.test),
        ping: Boolean(params.ping),
        error: params.error,
      }}
    />
  );
}
