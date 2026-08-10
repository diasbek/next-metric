import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/cms/settings";
import { sendTelegramMessage } from "@/lib/cms/telegram";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { safeEqual } from "@/lib/security/secrets";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: { id?: number; type?: string; title?: string; username?: string };
    from?: { first_name?: string; username?: string };
  };
};

const MAX_BODY_BYTES = 65_536;

/**
 * Telegram webhook — authenticated by shared secret only.
 * Chat subscriptions are managed exclusively in Admin → Settings
 * (self-subscribe would expose lead PII to anyone who found the webhook URL).
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limit = rateLimit({
    key: `tg-webhook:${ip}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }

  const settings = await getSiteSettings();
  if (!settings?.telegram_bot_token || !settings.telegram_webhook_secret) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const secret = request.nextUrl.searchParams.get("secret") ?? "";
  if (!safeEqual(secret, settings.telegram_webhook_secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  const update = (() => {
    try {
      return JSON.parse(raw) as TelegramUpdate;
    } catch {
      return null;
    }
  })();

  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = (message?.text ?? "").trim();

  if (!chatId) {
    return NextResponse.json({ ok: true });
  }

  const chatIdStr = String(chatId);
  const token = settings.telegram_bot_token;
  const allowed = new Set(
    (settings.telegram_chat_ids ?? []).map((id) => String(id).trim()),
  );

  if (text === "/start" || text === "/id" || text === "/subscribe") {
    const listed = allowed.has(chatIdStr);
    await sendTelegramMessage(
      token,
      chatIdStr,
      [
        "METRIC bot.",
        `Your chat id: ${chatIdStr}`,
        listed
          ? "This chat is already on the notification list."
          : "To receive leads, an owner must add this chat id in Admin → Settings.",
        "",
        "Commands: /id",
      ].join("\n"),
    );
  } else if (text === "/unsubscribe") {
    // Do not mutate settings from the open webhook — owners manage chat IDs in admin UI.
    await sendTelegramMessage(
      token,
      chatIdStr,
      "Ask an owner to remove this chat id in Admin → Settings.",
    );
  }

  return NextResponse.json({ ok: true });
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
