import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { getSiteSettings } from "@/lib/cms/settings";
import { verifyCaptcha } from "@/lib/cms/captcha";
import { notifyLeadViaTelegram } from "@/lib/cms/telegram";
import { notifyLeadViaResend } from "@/lib/cms/resend";
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
import {
  PROJECT_BRIEF_PHONE_PLACEHOLDER,
  PROJECT_BRIEF_SERVICE_IDS,
  PROJECT_BRIEF_SERVICE_LABELS,
  type ProjectBriefServiceId,
} from "@/data/project-brief";

const MAX_NAME = 120;
const MAX_PHONE = 40;
const MAX_EMAIL = 160;
const MAX_COMPANY = 160;
const MAX_URL = 500;
const MAX_MESSAGE = 4000;
const MAX_BODY_BYTES = 32_768;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function allowedOrigins(): string[] {
  const extras = [
    "https://metric.graphics",
    "https://www.metric.graphics",
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

type LeadPayload = {
  source: "contact" | "brief";
  name: string;
  phone: string;
  email: string;
  company: string;
  productUrl: string;
  services: string[];
  message: string;
  locale: string;
  consent: boolean;
  captchaToken: string;
  website: string;
  file: File | null;
};

function parseServices(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

async function parseLeadPayload(request: NextRequest): Promise<LeadPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const fileValue = form.get("file");
    return {
      source: String(form.get("source") ?? "") === "brief" ? "brief" : "contact",
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      productUrl: String(form.get("productUrl") ?? ""),
      services: parseServices(form.getAll("services")),
      message: String(form.get("message") ?? ""),
      locale: String(form.get("locale") ?? ""),
      consent: String(form.get("consent") ?? "") === "true",
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
    source?: string;
    name?: string;
    phone?: string;
    email?: string;
    company?: string;
    productUrl?: string;
    services?: unknown;
    message?: string;
    locale?: string;
    consent?: boolean | string;
    captchaToken?: string;
    website?: string;
  };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }

  return {
    source: body.source === "brief" ? "brief" : "contact",
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    email: String(body.email ?? ""),
    company: String(body.company ?? ""),
    productUrl: String(body.productUrl ?? ""),
    services: parseServices(body.services),
    message: String(body.message ?? ""),
    locale: String(body.locale ?? ""),
    consent: body.consent === true || body.consent === "true",
    captchaToken: String(body.captchaToken ?? ""),
    website: String(body.website ?? ""),
    file: null,
  };
}

function formatBriefMessage(input: {
  email: string;
  company: string;
  productUrl: string;
  services: ProjectBriefServiceId[];
  message: string;
}): string {
  const lines = [
    `Email: ${input.email}`,
    input.company ? `Company: ${input.company}` : null,
    input.productUrl ? `Link: ${input.productUrl}` : null,
    input.services.length
      ? `Help with: ${input.services
          .map((id) => PROJECT_BRIEF_SERVICE_LABELS[id])
          .join(", ")}`
      : null,
    input.message ? `\n${input.message}` : null,
  ].filter((line): line is string => Boolean(line));
  return lines.join("\n");
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
    const email = clampText(payload.email.trim().toLowerCase(), MAX_EMAIL);
    const company = clampText(payload.company.trim(), MAX_COMPANY);
    const productUrl = clampText(payload.productUrl.trim(), MAX_URL);
    const locale = clampText(payload.locale.trim(), 8);
    const allowedServices = new Set<string>(PROJECT_BRIEF_SERVICE_IDS);
    const services = payload.services.filter((id): id is ProjectBriefServiceId =>
      allowedServices.has(id),
    );

    let phone = clampText(payload.phone.trim(), MAX_PHONE);
    let message = clampText(payload.message.trim(), MAX_MESSAGE);

    if (payload.source === "brief") {
      if (!name || !email || !message) {
        return NextResponse.json(
          { error: "Name, email, and project details are required" },
          { status: 400 },
        );
      }
      if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }
      if (!services.length) {
        return NextResponse.json(
          { error: "Select at least one service" },
          { status: 400 },
        );
      }
      phone = phone || PROJECT_BRIEF_PHONE_PLACEHOLDER;
      message = clampText(
        formatBriefMessage({ email, company, productUrl, services, message }),
        MAX_MESSAGE,
      );
    } else if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 },
      );
    }

    if (!payload.consent) {
      return NextResponse.json(
        { error: "Consent to the Privacy Policy is required" },
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

    let attachmentPath: string | null = null;
    if (payload.file) {
      try {
        const uploaded = await uploadLeadAttachment(payload.file);
        attachmentPath = uploaded.path;
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
      attachment_path: attachmentPath,
      consent_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json(
        { error: publicErrorMessage(error, "Could not save lead") },
        { status: 500 },
      );
    }

    const notifyPayload = {
      name,
      phone,
      email: email || null,
      message,
      locale: locale || null,
      hasAttachment: Boolean(attachmentPath),
    };
    void notifyLeadViaTelegram(notifyPayload);
    void notifyLeadViaResend(notifyPayload);

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
