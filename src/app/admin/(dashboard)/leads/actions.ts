"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  LEAD_ATTACHMENTS_BUCKET,
  getLeadAttachmentSignedUrl,
} from "@/lib/cms/storage";
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

/** Mint a short-lived signed URL for a private lead attachment. */
export async function getLeadAttachmentUrlAction(
  path: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requirePermission("leads");
    if (!path.trim()) return { ok: false, error: "No attachment" };
    const url = await getLeadAttachmentSignedUrl(path);
    return { ok: true, url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not open attachment",
    };
  }
}

/** Deletes a lead and its stored attachment (right to erasure). */
export async function deleteLeadAction(id: string): Promise<AdminActionResult> {
  return runAdminAction(async () => {
    const actor = await requirePermission("leads");
    if (!id.trim()) return adminFail("Некорректные данные заявки");

    const supabase = createSupabaseAdminClient();
    const { data: lead } = await supabase
      .from("metric_leads")
      .select("attachment_path")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("metric_leads").delete().eq("id", id);
    if (error) return adminFail(error.message);

    if (lead?.attachment_path) {
      await supabase.storage
        .from(LEAD_ATTACHMENTS_BUCKET)
        .remove([lead.attachment_path]);
    }

    await writeAuditLog({
      actor,
      action: "lead.delete",
      entityType: "leads",
      entityId: id,
    });
    revalidateCms(["cms", "leads"]);
    return adminOk("Заявка удалена");
  });
}

/** Bulk-purges leads (and their attachments) older than retentionDays. */
export async function purgeStaleLeadsAction(
  retentionDays: number,
): Promise<AdminActionResult> {
  return runAdminAction(async () => {
    const actor = await requirePermission("leads");
    const days = Math.max(1, Math.floor(retentionDays) || 0);
    if (!days) return adminFail("Некорректный срок хранения");

    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
    const supabase = createSupabaseAdminClient();
    const { data: stale, error: selectError } = await supabase
      .from("metric_leads")
      .select("id, attachment_path")
      .lt("created_at", cutoff);

    if (selectError) return adminFail(selectError.message);
    if (!stale || stale.length === 0) {
      return adminOk("Нет заявок для удаления");
    }

    const paths = stale
      .map((lead) => lead.attachment_path)
      .filter((path): path is string => Boolean(path));
    if (paths.length > 0) {
      await supabase.storage.from(LEAD_ATTACHMENTS_BUCKET).remove(paths);
    }

    const ids = stale.map((lead) => lead.id);
    const { error: deleteError } = await supabase
      .from("metric_leads")
      .delete()
      .in("id", ids);
    if (deleteError) return adminFail(deleteError.message);

    await writeAuditLog({
      actor,
      action: "lead.purge",
      entityType: "leads",
      meta: { count: ids.length, retentionDays: days },
    });
    revalidateCms(["cms", "leads"]);
    return adminOk(`Удалено заявок: ${ids.length}`);
  });
}
