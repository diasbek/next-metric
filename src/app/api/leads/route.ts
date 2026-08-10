import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { getSiteSettings } from "@/lib/cms/settings";
import { verifyCaptcha } from "@/lib/cms/captcha";
import { notifyLeadViaTelegram } from "@/lib/cms/telegram";
import type { DbSiteSettings } from "@/lib/cms/types";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import {
  clampText,
  isAllowedOrigin,
  publicErrorMessage,
} from "@/lib/security/request";
import { SITE_CONFIG } from "@/utils/consts";
import {
  isFileUpload,
  uploadLeadAttachment,
} from "@/lib/cms/storage";

const MAX_NAME = 120;
const MAX_PHONE = 40;
const MAX_MESSAGE = 4000;
const MAX_BODY_BYTES = 32_768;

function allowedOrigins(): string[] {
  const extras = [
    "https://metric.agency",
    "https://www.metric.agency",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
  const base = SITE_CONFIG.url.replace(/\/$/, "");
  try {
    const origin = new URL(base).origin;
    return Array.from(new Set([origin, ...extras]));
  } catch {
    return extras;
  }
}

async function parseLeadPayload(request: NextRequest): Promise<{
  name: string;
  phone: string;
  message: string;
  locale: string;
  captchaToken: string;
  website: string;
  file: File | null;
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const fileValue = form.get("file");
    return {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
      locale: String(form.get("locale") ?? ""),
      captchaToken: String(form.get("captchaToken") ?? ""),
      website: String(form.get("website") ?? ""),
      file: isFileUpload(fileValue) ? fileValue : null,
    };
  }

  if (!contentType.includes("application/json")) {
    throw Object.assign(new Error("Unsupported media type"), { status: 415 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    throw Object.assign(new Error("Payload too large"), { status: 413 });
  }

  let body: {
    name?: string;
    phone?: string;
    message?: string;
    locale?: string;
    captchaToken?: string;
    website?: string;
  };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }

  return {
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    message: String(body.message ?? ""),
    locale: String(body.locale ?? ""),
    captchaToken: String(body.captchaToken ?? ""),
    website: String(body.website ?? ""),
    file: null,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!hasSupabaseAdminConfig()) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const ip = clientIp(request);
    const limit = rateLimit({
      key: `leads:${ip}`,
      limit: 8,
      windowMs: 60_000,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSec) },
        },
      );
    }

    if (!isAllowedOrigin(request, allowedOrigins())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let payload: Awaited<ReturnType<typeof parseLeadPayload>>;
    try {
      payload = await parseLeadPayload(request);
    } catch (err) {
      const status =
        typeof err === "object" &&
        err &&
        "status" in err &&
        typeof (err as { status: unknown }).status === "number"
          ? (err as { status: number }).status
          : 400;
      const message = err instanceof Error ? err.message : "Bad request";
      return NextResponse.json({ error: message }, { status });
    }

    const name = clampText(payload.name.trim(), MAX_NAME);
    const phone = clampText(payload.phone.trim(), MAX_PHONE);
    const message = clampText(payload.message.trim(), MAX_MESSAGE);
    const locale = clampText(payload.locale.trim(), 8);

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 },
      );
    }

    const settings = (await getSiteSettings()) as DbSiteSettings | null;
    const captcha = await verifyCaptcha({
      settings,
      token: payload.captchaToken || undefined,
      honeypot: payload.website,
      remoteIp: ip === "unknown" ? null : ip,
    });

    if (!captcha.ok) {
      return NextResponse.json(
        { error: captcha.error ?? "Captcha failed" },
        { status: 400 },
      );
    }

    let attachmentUrl: string | null = null;
    if (payload.file) {
      try {
        const uploaded = await uploadLeadAttachment(payload.file);
        attachmentUrl = uploaded.publicUrl;
      } catch (err) {
        return NextResponse.json(
          {
            error:
              err instanceof Error ? err.message : "Could not upload attachment",
          },
          { status: 400 },
        );
      }
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("metric_leads").insert({
      name,
      phone,
      message,
      locale: locale || null,
      status: "new",
      attachment_url: attachmentUrl,
    });

    if (error) {
      return NextResponse.json(
        { error: publicErrorMessage(error, "Could not save lead") },
        { status: 500 },
      );
    }

    void notifyLeadViaTelegram({
      name,
      phone,
      message,
      locale: locale || null,
      attachmentUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: publicErrorMessage(error, "Something went wrong") },
      { status: 500 },
    );
  }
}

/** Reject other methods explicitly. */
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
