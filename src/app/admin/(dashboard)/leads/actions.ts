"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  adminFail,
  adminOk,
  runAdminAction,
  type AdminActionResult,
} from "@/lib/cms/admin-redirect";
import type { LeadStatus } from "@/lib/cms/types";

const STATUSES: LeadStatus[] = ["new", "read", "archived"];

function parseStatus(value: string): LeadStatus | null {
  return STATUSES.includes(value as LeadStatus) ? (value as LeadStatus) : null;
}

/** Optimistic Kanban drop — no redirect. */
export async function setLeadStatusAction(
  id: string,
  status: LeadStatus,
): Promise<AdminActionResult> {
  return runAdminAction(async () => {
    const actor = await requirePermission("leads");
    const next = parseStatus(status);
    if (!id.trim() || !next) return adminFail("Некорректные данные заявки");

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("metric_leads")
      .update({ status: next })
      .eq("id", id);
    if (error) return adminFail(error.message);

    await writeAuditLog({
      actor,
      action: "lead.status",
      entityType: "leads",
      entityId: id,
      meta: { status: next },
    });
    revalidateCms(["cms", "leads"]);
    return adminOk("Статус обновлён");
  });
}

/** Form fallback (detail panel buttons). */
export async function updateLeadStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = parseStatus(String(formData.get("status") ?? ""));
  if (!status) return adminFail("Некорректный статус");
  return setLeadStatusAction(id, status);
}
