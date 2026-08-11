import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminUser } from "@/lib/cms/auth";

export type AuditAction =
  | "user.invite"
  | "user.role_change"
  | "user.revoke"
  | "user.reset_password"
  | "settings.update"
  | "settings.telegram_webhook"
  | "lead.status"
  | "content.update";

export async function writeAuditLog(options: {
  actor: AdminUser;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("metric_admin_audit_log").insert({
      actor_id: options.actor.id,
      actor_email: options.actor.email,
      action: options.action,
      entity_type: options.entityType ?? null,
      entity_id: options.entityId ?? null,
      meta: options.meta ?? {},
    });
  } catch {
    // non-blocking; table may be missing before migration
  }
}
