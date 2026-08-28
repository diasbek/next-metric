import type { DbSiteSettings } from "@/lib/cms/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/cms/settings";
import { PROJECT_BRIEF_PHONE_PLACEHOLDER } from "@/data/project-brief";
import { SITE_CONFIG } from "@/utils/consts";

const TELEGRAM_API = "https://api.telegram.org";

function botApi(token: string, method: string) {
  return `${TELEGRAM_API}/bot${token}/${method}`;
}

export async function telegramApi<T = unknown>(
  token: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; result?: T; description?: string }> {
  const response = await fetch(botApi(token, method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return (await response.json()) as {
    ok: boolean;
    result?: T;
    description?: string;
  };
}

export function buildWebhookUrl(secret: string) {
  const base = SITE_CONFIG.url.replace(/\/$/, "");
  return `${base}/api/telegram/webhook/?secret=${encodeURIComponent(secret)}`;
}

export async function registerTelegramWebhook(settings: DbSiteSettings) {
  const token = settings.telegram_bot_token.trim();
  if (!token) throw new Error("Telegram bot token is empty");

  let secret = settings.telegram_webhook_secret.trim();
  if (!secret) {
    secret = crypto.randomUUID().replace(/-/g, "");
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("metric_site_settings")
      .update({ telegram_webhook_secret: secret })
      .eq("id", 1);
  }

  const url = buildWebhookUrl(secret);
  const result = await telegramApi(token, "setWebhook", {
    url,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });

  if (!result.ok) {
    throw new Error(result.description ?? "setWebhook failed");
  }

  return { url, secret };
}

export async function removeTelegramWebhook(token: string) {
  return telegramApi(token, "deleteWebhook", { drop_pending_updates: true });
}

export async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
) {
  return telegramApi(token, "sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  });
}

export type LeadNotifyPayload = {
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  locale?: string | null;
  /** Attachments live in a private bucket — never send a raw URL here. */
  hasAttachment?: boolean;
};

export async function notifyLeadViaTelegram(lead: LeadNotifyPayload) {
  const settings = await getSiteSettings();
  if (!settings?.telegram_notify_enabled) return;
  const token = settings.telegram_bot_token.trim();
  const chats = (settings.telegram_chat_ids ?? []).map((c) => c.trim()).filter(Boolean);
  if (!token || chats.length === 0) return;

  const text = [
    "🆕 New METRIC lead",
    `Name: ${lead.name}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.phone && lead.phone !== PROJECT_BRIEF_PHONE_PLACEHOLDER
      ? `Phone: ${lead.phone}`
      : null,
    lead.locale ? `Locale: ${lead.locale}` : null,
    lead.message ? `Message:\n${lead.message}` : null,
    lead.hasAttachment ? "📎 Attachment — open in admin" : null,
  ]
    .filter(Boolean)
    .join("\n");

  await Promise.allSettled(
    chats.map((chatId) => sendTelegramMessage(token, chatId, text)),
  );
}

export async function addTelegramChatId(chatId: string) {
  const settings = await getSiteSettings();
  if (!settings) return;
  const existing = new Set(settings.telegram_chat_ids ?? []);
  if (existing.has(chatId)) return;
  existing.add(chatId);
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("metric_site_settings")
    .update({ telegram_chat_ids: Array.from(existing) })
    .eq("id", 1);
}
