"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { getSiteSettings } from "@/lib/cms/settings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";
import { isFileUpload, uploadSiteDocument } from "@/lib/cms/storage";

function linesFromForm(formData: FormData, key: string) {
  return String(formData.get(key) ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

async function resolveDocUrl(
  formData: FormData,
  locale: "ru" | "uz" | "en",
  kind: "presentation" | "brief",
): Promise<string> {
  const fileKey = `${locale}_${kind}_file`;
  const urlKey = `${locale}_${kind}_url`;
  const existing = String(formData.get(urlKey) ?? "").trim();
  const file = formData.get(fileKey);

  if (isFileUpload(file)) {
    const uploaded = await uploadSiteDocument(file, {
      folder: `contacts/${locale}`,
      filenameHint: kind,
    });
    return uploaded.publicUrl;
  }

  return existing;
}

export async function saveContactsAction(formData: FormData) {
  const actor = await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const current = await getSiteSettings();

  let urls: Record<"ru" | "uz" | "en", { presentation: string; brief: string }>;
  try {
    const [ruP, ruB, uzP, uzB, enP, enB] = await Promise.all([
      resolveDocUrl(formData, "ru", "presentation"),
      resolveDocUrl(formData, "ru", "brief"),
      resolveDocUrl(formData, "uz", "presentation"),
      resolveDocUrl(formData, "uz", "brief"),
      resolveDocUrl(formData, "en", "presentation"),
      resolveDocUrl(formData, "en", "brief"),
    ]);
    urls = {
      ru: { presentation: ruP, brief: ruB },
      uz: { presentation: uzP, brief: uzB },
      en: { presentation: enP, brief: enB },
    };
  } catch (err) {
    return adminFail(err instanceof Error ? err.message : "Upload failed");
  }

  const ruAddress = linesFromForm(formData, "ru_address_lines");

  const { error: settingsError } = await supabase.from("site_settings").upsert({
    id: 1,
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    telegram_url: String(formData.get("telegram_url") ?? ""),
    instagram_url: String(formData.get("instagram_url") ?? ""),
    presentation_url: urls.ru.presentation,
    brief_url: urls.ru.brief,
    address_lines: ruAddress,
    telegram_bot_token: current?.telegram_bot_token ?? null,
    telegram_chat_ids: current?.telegram_chat_ids ?? [],
    telegram_notify_enabled: current?.telegram_notify_enabled ?? false,
    telegram_webhook_secret: current?.telegram_webhook_secret ?? null,
    captcha_provider: current?.captcha_provider ?? "none",
    captcha_site_key: current?.captcha_site_key ?? "",
    captcha_secret_key: current?.captcha_secret_key ?? null,
    yandex_metrika_id: current?.yandex_metrika_id ?? "",
    yandex_webmaster_verification: current?.yandex_webmaster_verification ?? "",
    google_analytics_id: current?.google_analytics_id ?? "",
    google_tag_manager_id: current?.google_tag_manager_id ?? "",
    google_site_verification: current?.google_site_verification ?? "",
  });
  if (settingsError) return adminFail(settingsError.message);

  for (const locale of ["ru", "uz", "en"] as const) {
    const { error } = await supabase.from("site_settings_translations").upsert({
      locale,
      address_lines: linesFromForm(formData, `${locale}_address_lines`),
      presentation_url: urls[locale].presentation,
      brief_url: urls[locale].brief,
      updated_at: new Date().toISOString(),
    });
    if (error) return adminFail(error.message);
  }

  await writeAuditLog({
    actor,
    action: "settings.update",
    entityType: "site_settings",
    entityId: "1",
  });

  revalidateCms(["cms", "site_settings"]);
  return adminRedirect("/admin/contacts/?saved=1");
}
