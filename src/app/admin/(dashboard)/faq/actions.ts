"use server";

import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";
import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveFaqAction(formData: FormData) {
  const actor = await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");

  let faqId = id;
  if (!faqId) {
    const { data, error } = await supabase
      .from("metric_faq_items")
      .insert({
        sort_order: Number(formData.get("sort_order") ?? 0),
        status: String(formData.get("status") ?? "published"),
      })
      .select("id")
      .single();
    if (error || !data) return adminFail(error?.message ?? "Create failed");
    faqId = data.id;
  } else {
    const { error } = await supabase
      .from("metric_faq_items")
      .update({
        sort_order: Number(formData.get("sort_order") ?? 0),
        status: String(formData.get("status") ?? "published"),
      })
      .eq("id", faqId);
    if (error) return adminFail(error.message);
  }

  for (const locale of ["en", "de"] as const) {
    const { error: trError } = await supabase.from("metric_faq_translations").upsert({
      faq_id: faqId,
      locale,
      question: String(formData.get(`${locale}_question`) ?? ""),
      answer: String(formData.get(`${locale}_answer`) ?? ""),
    });
    if (trError) return adminFail(`${locale}: ${trError.message}`);
  }

  await writeAuditLog({
    actor,
    action: "content.update",
    entityType: "faq",
    entityId: faqId,
  });

  revalidateCms(["cms", "faq"]);
  return adminRedirect(`/admin/home/?section=faq&edit=${faqId}`);
}

export async function createFaqAction() {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("metric_faq_items")
    .insert({ sort_order: 99, status: "draft" })
    .select("id")
    .single();
  if (error || !data) return adminFail(error?.message ?? "Create failed");

  await supabase.from("metric_faq_translations").insert(
    (["en", "de"] as const).map((locale) => ({
      faq_id: data.id,
      locale,
      question: "New question",
      answer: "",
    })),
  );

  revalidateCms(["cms", "faq"]);
  return adminRedirect(`/admin/home/?section=faq&edit=${data.id}`);
}

export async function deleteFaqAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  await supabase.from("metric_faq_items").delete().eq("id", String(formData.get("id")));
  revalidateCms(["cms", "faq"]);
  return adminRedirect("/admin/home/?section=faq");
}

export async function reorderFaqAction(orderedIds: string[]) {
  const { reorderCmsRows } = await import("@/lib/cms/reorder");
  const { T } = await import("@/lib/cms/tables");
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const t = getAdminMessages(await getAdminUiLocale());
  return reorderCmsRows({
    table: T.faqItems,
    orderedIds,
    tags: ["cms", "faq"],
    successMessage: t.common.orderSaved,
  });
}
