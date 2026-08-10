"use server";

import {
  adminFail,
  adminOk,
  runAdminAction,
  type AdminActionResult,
} from "@/lib/cms/admin-redirect";
import { revalidateCms, type CmsTag } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ReorderTable =
  | "faq_items"
  | "testimonials"
  | "services"
  | "projects"
  | "team_members";

/** Persist 0-based sort_order for a list of ids. Used by admin DnD grids. */
export async function reorderCmsRows(options: {
  table: ReorderTable;
  orderedIds: string[];
  tags: CmsTag[];
  successMessage: string;
}): Promise<AdminActionResult> {
  return runAdminAction(async () => {
    await requirePermission("content");
    const ids = options.orderedIds.map(String).filter(Boolean);
    if (ids.length === 0) return adminFail("Пустой список для сортировки");

    const supabase = createSupabaseAdminClient();
    const results = await Promise.all(
      ids.map((id, index) =>
        supabase.from(options.table).update({ sort_order: index }).eq("id", id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) return adminFail(failed.error.message);

    revalidateCms(options.tags);
    return adminOk(options.successMessage);
  });
}
