import { Suspense } from "react";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DbLead } from "@/lib/cms/types";
import { LeadsBoard } from "@/components/admin/leads/LeadsBoard";

export default async function AdminLeadsPage() {
  await requirePermission("leads");
  const supabase = createSupabaseAdminClient();

  const { data } = await supabase
    .from("metric_leads")
    .select(
      "id, name, phone, message, attachment_path, status, locale, created_at, consent_at",
    )
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <Suspense fallback={null}>
      <LeadsBoard leads={(data ?? []) as DbLead[]} />
    </Suspense>
  );
}
