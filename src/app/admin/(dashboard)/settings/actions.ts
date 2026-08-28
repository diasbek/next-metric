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
import { uploadOgPngBuffer } from "@/lib/cms/storage";
import { SITE_CONFIG } from "@/utils/consts";
import { buildPageOgProps } from "@/utils/og/build";
import { OG_GENERATED_FILENAME, type OgPageKey } from "@/utils/og/paths";
import { ogPngBufferToDataUrl, renderOgPngBuffer } from "@/utils/og/render";

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

  const { error: settingsError } = await supabase.from("metric_site_settings").upsert({
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

  if (settingsError) {
    return adminFail(settingsError.message);
  }

  for (const locale of ["en", "de"] as const) {
    for (const pageKey of ["home", "works"] as const) {
      await supabase.from("metric_page_seo").upsert({
        locale,
        page_key: pageKey,
        title: String(formData.get(`${locale}_${pageKey}_title`) ?? ""),
        description: String(formData.get(`${locale}_${pageKey}_description`) ?? ""),
        keywords: String(formData.get(`${locale}_${pageKey}_keywords`) ?? ""),
        og_image: String(formData.get(`${locale}_${pageKey}_og_image`) ?? "").trim(),
        noindex: formData.get(`${locale}_${pageKey}_noindex`) === "on",
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

export type PageOgActionResult =
  | { ok: true; dataUrl?: string; ogImageUrl?: string; message?: string }
  | { ok: false; error: string };

export async function previewPageOgAction(input: {
  pageKey: string;
  locale: "en" | "de";
  title: string;
  description: string;
}): Promise<PageOgActionResult> {
  await requireOwner();
  const pageKey = String(input.pageKey ?? "").trim();
  if (pageKey !== "home" && pageKey !== "works") {
    return { ok: false, error: "Invalid page" };
  }
  try {
    const props = await buildPageOgProps({
      pageKey: pageKey as OgPageKey,
      title: input.title,
      description: input.description,
      locale: input.locale,
      siteUrl: SITE_CONFIG.url,
    });
    const buffer = await renderOgPngBuffer(props);
    return { ok: true, dataUrl: ogPngBufferToDataUrl(buffer) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "OG preview failed",
    };
  }
}

export async function generatePageOgAction(input: {
  pageKey: string;
  locale: "en" | "de";
  title: string;
  description: string;
}): Promise<PageOgActionResult> {
  const actor = await requireOwner();
  const pageKey = String(input.pageKey ?? "").trim();
  const locale = input.locale;
  if (pageKey !== "home" && pageKey !== "works") {
    return { ok: false, error: "Invalid page" };
  }

  try {
    const props = await buildPageOgProps({
      pageKey: pageKey as OgPageKey,
      title: input.title,
      description: input.description,
      locale,
      siteUrl: SITE_CONFIG.url,
    });
    const buffer = await renderOgPngBuffer(props);
    const uploaded = await uploadOgPngBuffer(buffer, {
      folder: `seo/${locale}/${pageKey}`,
      filename: OG_GENERATED_FILENAME,
    });

    const supabase = createSupabaseAdminClient();
    const { data: existing } = await supabase
      .from("metric_page_seo")
      .select("title, description, keywords, noindex")
      .eq("locale", locale)
      .eq("page_key", pageKey)
      .maybeSingle();

    const { error } = await supabase.from("metric_page_seo").upsert({
      locale,
      page_key: pageKey,
      title: existing?.title ?? input.title,
      description: existing?.description ?? input.description,
      keywords: existing?.keywords ?? "",
      noindex: existing?.noindex ?? false,
      og_image: uploaded.publicUrl,
    });

    if (error) return { ok: false, error: error.message };

    await writeAuditLog({
      actor,
      action: "settings.update",
      entityType: "page_seo",
      entityId: `${locale}:${pageKey}`,
      meta: { op: "og_generate" },
    });

    revalidateCms(["cms", "page_seo"]);
    return { ok: true, ogImageUrl: uploaded.publicUrl, message: "OG image generated" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "OG generate failed",
    };
  }
}

export async function clearPageOgAction(input: {
  pageKey: string;
  locale: "en" | "de";
}): Promise<PageOgActionResult> {
  const actor = await requireOwner();
  const pageKey = String(input.pageKey ?? "").trim();
  const locale = input.locale;
  if (pageKey !== "home" && pageKey !== "works") {
    return { ok: false, error: "Invalid page" };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("metric_page_seo")
    .update({ og_image: "" })
    .eq("locale", locale)
    .eq("page_key", pageKey);

  if (error) return { ok: false, error: error.message };

  await writeAuditLog({
    actor,
    action: "settings.update",
    entityType: "page_seo",
    entityId: `${locale}:${pageKey}`,
    meta: { op: "og_clear" },
  });

  revalidateCms(["cms", "page_seo"]);
  return { ok: true, ogImageUrl: "", message: "Using auto OG" };
}
