import type { LeadStatus } from "@/lib/cms/types";

/** Extensible inbox item — today mostly leads, later system events etc. */
export type AdminNotificationKind = "lead" | "system";

export type AdminNotificationItem = {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  /** Lead status when kind === "lead" */
  meta?: {
    status?: LeadStatus;
    phone?: string;
  };
};

export function leadToNotification(lead: {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: LeadStatus;
  created_at: string;
}): AdminNotificationItem {
  const body =
    lead.message.trim() ||
    lead.phone.trim() ||
    "";
  return {
    id: `lead:${lead.id}`,
    kind: "lead",
    title: lead.name.trim() || lead.phone.trim() || "—",
    body: body.slice(0, 120),
    href:
      lead.status === "new"
        ? "/admin/leads/?status=new"
        : "/admin/leads/",
    createdAt: lead.created_at,
    meta: {
      status: lead.status,
      phone: lead.phone,
    },
  };
}
