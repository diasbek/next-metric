import { Resend } from "resend";
import {
  buildTeamLeadEmail,
  buildVisitorLeadEmail,
} from "@/lib/cms/lead-email-templates";
import type { LeadNotifyPayload } from "@/lib/cms/telegram";
import { getEnv } from "@/utils/env";

const FROM_DEFAULT = "METRIC <no-reply@metric.graphics>";
/** Account manager inbox — all incoming leads land here. */
const TEAM_INBOX_DEFAULT = "heyfarkhod@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function notifyLeadViaResend(lead: LeadNotifyPayload) {
  const apiKey = getEnv("RESEND_API_KEY");
  if (!apiKey) return;

  const from = getEnv("RESEND_FROM") || FROM_DEFAULT;
  const teamTo = getEnv("RESEND_NOTIFY_TO") || TEAM_INBOX_DEFAULT;
  const visitor =
    lead.email && EMAIL_RE.test(lead.email) ? lead.email.trim() : "";

  const resend = new Resend(apiKey);
  const teamEmail = buildTeamLeadEmail(lead);
  const visitorEmail = buildVisitorLeadEmail(lead);

  const payloads = [
    {
      from,
      to: [teamTo],
      replyTo: visitor || undefined,
      subject: teamEmail.subject,
      text: teamEmail.text,
      html: teamEmail.html,
    },
    visitor && visitor.toLowerCase() !== teamTo.toLowerCase()
      ? {
          from,
          to: [visitor],
          subject: visitorEmail.subject,
          text: visitorEmail.text,
          html: visitorEmail.html,
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
