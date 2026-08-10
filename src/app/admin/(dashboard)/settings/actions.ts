"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requireOwner } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildWebhookUrl,
  notifyLeadViaTelegram,
  registerTelegramWebhook,
  removeTelegramWebhook,
  sendTelegramMessage,
} from "@/lib/cms/telegram";
import { getSiteSettings } from "@/lib/cms/settings";
import type { CaptchaProvider } from "@/lib/cms/types";
import { parseSiteVerificationToken, parseYandexMetrikaId } from "@/lib/cms/verification";
import { resolveSecretUpdate } from "@/lib/security/secrets";
import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";

function parseChatIds(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function saveSettingsAction(formData: FormData) {
  const actor = await requireOwner();
  const supabase = createSupabaseAdminClient();
  const current = await getSiteSettings();

  const captchaProvider = String(
    formData.get("captcha_provider") ?? "none",
  ) as CaptchaProvider;

  await supabase.from("site_settings").upsert({
    id: 1,
    // Contacts live on /admin/contacts/ — preserve when saving settings
    phone: current?.phone ?? "",
    email: current?.email ?? "",
    telegram_url: current?.telegram_url ?? "",
    instagram_url: current?.instagram_url ?? "",
    presentation_url: current?.presentation_url ?? "",
    brief_url: current?.brief_url ?? "",
    address_lines: current?.address_lines ?? [],
    telegram_bot_token: resolveSecretUpdate(
      String(formData.get("telegram_bot_token") ?? ""),
      current?.telegram_bot_token,
    ),
    telegram_chat_ids: parseChatIds(String(formData.get("telegram_chat_ids") ?? "")),
    telegram_notify_enabled: formData.get("telegram_notify_enabled") === "on",
    telegram_webhook_secret: resolveSecretUpdate(
      String(formData.get("telegram_webhook_secret") ?? ""),
      current?.telegram_webhook_secret,
    ),
    captcha_provider: captchaProvider,
    captcha_site_key: String(formData.get("captcha_site_key") ?? ""),
    captcha_secret_key: resolveSecretUpdate(
      String(formData.get("captcha_secret_key") ?? ""),
      current?.captcha_secret_key,
    ),
    yandex_metrika_id: parseYandexMetrikaId(
      String(formData.get("yandex_metrika_id") ?? ""),
    ),
    yandex_webmaster_verification: parseSiteVerificationToken(
      String(formData.get("yandex_webmaster_verification") ?? ""),
    ),
    google_analytics_id: String(formData.get("google_analytics_id") ?? "").trim(),
    google_tag_manager_id: String(formData.get("google_tag_manager_id") ?? "").trim(),
    google_site_verification: parseSiteVerificationToken(
      String(formData.get("google_site_verification") ?? ""),
    ),
  });

  for (const locale of ["en", "de"] as const) {
    for (const pageKey of ["home", "agency", "works", "services", "contacts"] as const) {
      await supabase.from("page_seo").upsert({
        locale,
        page_key: pageKey,
        title: String(formData.get(`${locale}_${pageKey}_title`) ?? ""),
        description: String(formData.get(`${locale}_${pageKey}_description`) ?? ""),
        keywords: String(formData.get(`${locale}_${pageKey}_keywords`) ?? ""),
      });
    }
  }

  await writeAuditLog({
    actor,
    action: "settings.update",
    entityType: "site_settings",
    entityId: "1",
  });

  revalidateCms(["cms", "site_settings", "page_seo"]);
  return adminRedirect("/admin/settings/?saved=1");
}

export async function registerTelegramWebhookAction() {
  const actor = await requireOwner();
  const settings = await getSiteSettings();
  if (!settings) return adminFail("Settings not found");
  await registerTelegramWebhook(settings);
  await writeAuditLog({
    actor,
    action: "settings.telegram_webhook",
    meta: { op: "register", path: "/api/telegram/webhook/" },
  });
  revalidateCms(["cms", "site_settings"]);
  return adminRedirect("/admin/settings/?webhook=ok");
}

export async function deleteTelegramWebhookAction() {
  const actor = await requireOwner();
  const settings = await getSiteSettings();
  if (!settings?.telegram_bot_token) {
    return adminRedirect("/admin/settings/?error=no-token");
  }
  await removeTelegramWebhook(settings.telegram_bot_token);
  await writeAuditLog({
    actor,
    action: "settings.telegram_webhook",
    meta: { op: "remove" },
  });
  return adminRedirect("/admin/settings/?webhook=removed");
}

export async function testTelegramNotifyAction() {
  await requireOwner();
  await notifyLeadViaTelegram({
    name: "Test METRIC",
    phone: "+998 00 000 00 00",
    message: "Test notification from admin settings",
    locale: "en",
  });

  const settings = await getSiteSettings();
  if (
    settings?.telegram_bot_token &&
    (settings.telegram_chat_ids?.length ?? 0) === 0
  ) {
    return adminRedirect("/admin/settings/?error=no-chats");
  }

  return adminRedirect("/admin/settings/?test=1");
}

export async function pingTelegramChatAction(formData: FormData) {
  await requireOwner();
  const settings = await getSiteSettings();
  const chatId = String(formData.get("chat_id") ?? "").trim();
  if (!settings?.telegram_bot_token || !chatId) {
    return adminRedirect("/admin/settings/?error=ping");
  }
  await sendTelegramMessage(
    settings.telegram_bot_token,
    chatId,
    `METRIC ping OK\nWebhook: ${
      settings.telegram_webhook_secret
        ? buildWebhookUrl(settings.telegram_webhook_secret)
        : "not registered"
    }`,
  );
  return adminRedirect("/admin/settings/?ping=1");
}
