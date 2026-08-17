import { Resend } from "resend";
import { PROJECT_BRIEF_PHONE_PLACEHOLDER } from "@/data/project-brief";
import { getEnv } from "@/utils/env";
import type { LeadNotifyPayload } from "@/lib/cms/telegram";

const FROM_DEFAULT = "METRIC <no-reply@metric.graphics>";
const TEAM_INBOX_DEFAULT = "minimdesigngroup@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textBlock(lead: LeadNotifyPayload) {
  return [
    `Name: ${lead.name}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.phone && lead.phone !== PROJECT_BRIEF_PHONE_PLACEHOLDER
      ? `Phone: ${lead.phone}`
      : null,
    lead.locale ? `Locale: ${lead.locale}` : null,
    lead.hasAttachment ? "Attachment: yes (see admin)" : null,
    lead.message ? `\n${lead.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function htmlBlock(lead: LeadNotifyPayload) {
  const rows: Array<[string, string]> = [["Name", lead.name]];
  if (lead.email) rows.push(["Email", lead.email]);
  if (lead.phone && lead.phone !== PROJECT_BRIEF_PHONE_PLACEHOLDER) {
    rows.push(["Phone", lead.phone]);
  }
  if (lead.locale) rows.push(["Locale", lead.locale]);
  if (lead.hasAttachment) rows.push(["Attachment", "Yes — open in admin"]);

  const meta = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0;color:#111">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const message = lead.message
    ? `<pre style="margin:16px 0 0;font:14px/1.45 ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(lead.message)}</pre>`
    : "";

  return `<table style="border-collapse:collapse">${meta}</table>${message}`;
}

function visitorCopy(locale: string | null | undefined) {
  const de = locale?.toLowerCase().startsWith("de");
  if (de) {
    return {
      subject: "Wir haben Ihre Anfrage bei METRIC erhalten",
      intro:
        "Vielen Dank — wir haben Ihre Angaben erhalten und melden uns in der Regel innerhalb eines Werktags.",
    };
  }
  return {
    subject: "We received your METRIC project brief",
    intro:
      "Thank you — we’ve received your details and will get back to you within one business day.",
  };
}

export async function notifyLeadViaResend(lead: LeadNotifyPayload) {
  const apiKey = getEnv("RESEND_API_KEY");
  if (!apiKey) return;

  const from = getEnv("RESEND_FROM") || FROM_DEFAULT;
  const teamTo = getEnv("RESEND_NOTIFY_TO") || TEAM_INBOX_DEFAULT;
  const visitor =
    lead.email && EMAIL_RE.test(lead.email) ? lead.email.trim() : "";

  const resend = new Resend(apiKey);
  const summaryText = textBlock(lead);
  const summaryHtml = htmlBlock(lead);
  const visitorMsg = visitorCopy(lead.locale);

  const payloads = [
    {
      from,
      to: [teamTo],
      replyTo: visitor || undefined,
      subject: `New METRIC inquiry — ${lead.name}`,
      text: `New website inquiry\n\n${summaryText}`,
      html: `<p style="font:15px/1.45 ui-sans-serif,system-ui,sans-serif;color:#111">New website inquiry</p>${summaryHtml}`,
    },
    visitor && visitor.toLowerCase() !== teamTo.toLowerCase()
      ? {
          from,
          to: [visitor],
          subject: visitorMsg.subject,
          text: `${visitorMsg.intro}\n\n${summaryText}\n\n— METRIC\nhttps://metric.graphics`,
          html: `<p style="font:15px/1.45 ui-sans-serif,system-ui,sans-serif;color:#111">${escapeHtml(visitorMsg.intro)}</p>${summaryHtml}<p style="margin-top:24px;font:13px/1.4 ui-sans-serif,system-ui,sans-serif;color:#666">METRIC · <a href="https://metric.graphics" style="color:#ff3c82">metric.graphics</a></p>`,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  try {
    await Promise.all(
      payloads.map(async (payload) => {
        const { error } = await resend.emails.send(payload);
        if (error) {
          console.error("[resend] lead email failed", error);
        }
      }),
    );
  } catch (error) {
    console.error("[resend] lead email failed", error);
  }
}
