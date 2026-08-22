import { PROJECT_BRIEF_PHONE_PLACEHOLDER } from "@/data/project-brief";
import type { LeadNotifyPayload } from "@/lib/cms/telegram";

const BRAND = {
  accent: "#ff3c82",
  dark: "#111111",
  muted: "#6b7280",
  surface: "#f4f4f5",
  border: "#e5e7eb",
  white: "#ffffff",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseMessageFields(message: string) {
  const fields: Array<{ label: string; value: string }> = [];
  const bodyLines: string[] = [];

  for (const line of message.split("\n")) {
    const match = line.match(/^([^:\n]{2,32}):\s*(.+)$/);
    if (match && !line.startsWith("http")) {
      fields.push({ label: match[1].trim(), value: match[2].trim() });
    } else if (line.trim()) {
      bodyLines.push(line);
    }
  }

  return {
    fields,
    body: bodyLines.join("\n").trim(),
  };
}

function leadFields(lead: LeadNotifyPayload) {
  const parsed = parseMessageFields(lead.message);
  const rows: Array<{ label: string; value: string; href?: string }> = [
    { label: "Name", value: lead.name },
  ];

  if (lead.email) rows.push({ label: "Email", value: lead.email, href: `mailto:${lead.email}` });
  if (lead.phone && lead.phone !== PROJECT_BRIEF_PHONE_PLACEHOLDER) {
    rows.push({ label: "Phone", value: lead.phone, href: `tel:${lead.phone}` });
  }
  if (lead.locale) rows.push({ label: "Language", value: lead.locale.toUpperCase() });
  if (lead.hasAttachment) rows.push({ label: "Attachment", value: "Yes — see admin panel" });

  for (const field of parsed.fields) {
    const exists = rows.some(
      (row) => row.label.toLowerCase() === field.label.toLowerCase(),
    );
    if (!exists) {
      const href =
        field.label.toLowerCase() === "email"
          ? `mailto:${field.value}`
          : field.label.toLowerCase() === "link"
            ? field.value
            : undefined;
      rows.push({ label: field.label, value: field.value, href });
    }
  }

  return { rows, body: parsed.body || (parsed.fields.length ? "" : lead.message.trim()) };
}

function fieldRows(
  rows: Array<{ label: string; value: string; href?: string }>,
) {
  return rows
    .map(({ label, value, href }) => {
      const cell = href
        ? `<a href="${escapeHtml(href)}" style="color:${BRAND.accent};text-decoration:none;font-weight:600">${escapeHtml(value)}</a>`
        : `<span style="color:${BRAND.dark};font-weight:600">${escapeHtml(value)}</span>`;

      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};width:34%;vertical-align:top;font:13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.muted}">${escapeHtml(label)}</td>
        <td style="padding:12px 0 12px 16px;border-bottom:1px solid ${BRAND.border};vertical-align:top;font:15px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">${cell}</td>
      </tr>`;
    })
    .join("");
}

function messageBlock(body: string, title = "Message") {
  if (!body.trim()) return "";

  return `<div style="margin-top:24px;padding:20px 22px;background:${BRAND.surface};border-radius:14px;border:1px solid ${BRAND.border}">
    <p style="margin:0 0 10px;font:12px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};font-weight:700">${escapeHtml(title)}</p>
    <p style="margin:0;font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.dark};white-space:pre-wrap">${escapeHtml(body)}</p>
  </div>`;
}

function emailShell(options: {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
}) {
  const cta = options.cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 0">
        <tr>
          <td style="border-radius:999px;background:${BRAND.accent}">
            <a href="${escapeHtml(options.cta.href)}" style="display:inline-block;padding:14px 28px;font:15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-weight:700;color:${BRAND.white};text-decoration:none">${escapeHtml(options.cta.label)}</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.surface};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(options.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.surface};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:${BRAND.white};border-radius:20px;overflow:hidden;border:1px solid ${BRAND.border};">
          <tr>
            <td style="padding:28px 32px 24px;background:${BRAND.dark};">
              <p style="margin:0;font:28px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-weight:800;letter-spacing:-0.04em;color:${BRAND.white}">METRIC</p>
              <p style="margin:10px 0 0;font:13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#d1d5db">${escapeHtml(options.eyebrow)}</p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${BRAND.accent};font-size:0;line-height:0">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font:28px/1.15 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-weight:800;letter-spacing:-0.03em;color:${BRAND.dark}">${escapeHtml(options.title)}</h1>
              <p style="margin:0;font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.muted}">${escapeHtml(options.intro)}</p>
              ${options.bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${BRAND.border};background:#fafafa;">
              <p style="margin:0;font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.muted}">
                METRIC · Amazon listing images &amp; A+ Content<br />
                <a href="https://metric.graphics" style="color:${BRAND.accent};text-decoration:none;font-weight:600">metric.graphics</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildTeamLeadEmail(lead: LeadNotifyPayload) {
  const { rows, body } = leadFields(lead);

  const bodyHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px">${fieldRows(rows)}</table>${messageBlock(body)}`;

  const textLines = [
    "New METRIC inquiry",
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`),
    body ? `\nMessage:\n${body}` : "",
  ].filter(Boolean);

  return {
    subject: `New inquiry — ${lead.name}`,
    text: textLines.join("\n"),
    html: emailShell({
      preheader: `New inquiry from ${lead.name}`,
      eyebrow: "New client inquiry",
      title: `${lead.name} submitted a request`,
      intro:
        "A new lead just came in from metric.graphics. Reply directly to the client email if one was provided.",
      bodyHtml,
      cta: { label: "Open admin panel", href: "https://metric.graphics/admin/leads/" },
    }),
  };
}

export function buildVisitorLeadEmail(lead: LeadNotifyPayload) {
  const de = lead.locale?.toLowerCase().startsWith("de");
  const { rows, body } = leadFields(lead);
  const summaryRows = rows.filter((row) => row.label !== "Attachment");

  const copy = de
    ? {
        subject: "Wir haben Ihre Anfrage erhalten",
        eyebrow: "Projektanfrage bestätigt",
        title: "Danke — wir sind dran",
        intro:
          "Ihre Anfrage ist bei uns eingegangen. Unser Account Manager prüft die Details und meldet sich in der Regel innerhalb eines Werktags.",
        messageTitle: "Ihre Angaben",
        cta: "METRIC entdecken",
      }
    : {
        subject: "We received your METRIC inquiry",
        eyebrow: "Project brief received",
        title: "Thanks — we've got it",
        intro:
          "Your inquiry is in good hands. Our account manager will review the details and get back to you within one business day.",
        messageTitle: "Your submission",
        cta: "Explore METRIC",
      };

  const bodyHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px">${fieldRows(summaryRows)}</table>${messageBlock(body, copy.messageTitle)}`;

  const textLines = [
    copy.intro,
    "",
    ...summaryRows.map((row) => `${row.label}: ${row.value}`),
    body ? `\n${copy.messageTitle}:\n${body}` : "",
    "",
    "— METRIC",
    "https://metric.graphics",
  ].filter(Boolean);

  return {
    subject: copy.subject,
    text: textLines.join("\n"),
    html: emailShell({
      preheader: copy.intro,
      eyebrow: copy.eyebrow,
      title: copy.title,
      intro: copy.intro,
      bodyHtml,
      cta: { label: copy.cta, href: "https://metric.graphics" },
    }),
  };
}
