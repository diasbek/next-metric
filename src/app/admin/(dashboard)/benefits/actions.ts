"use server";

import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";
import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveBenefitAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");

  await supabase
    .from("benefits")
    .update({
      sort_order: Number(formData.get("sort_order") ?? 0),
      status: String(formData.get("status") ?? "published"),
    })
    .eq("id", id);

  for (const locale of ["ru", "uz", "en"] as const) {
    await supabase.from("benefit_translations").upsert({
      benefit_id: id,
      locale,
      label: String(formData.get(`${locale}_label`) ?? ""),
    });
  }

  revalidateCms(["cms", "benefits"]);
  return adminRedirect(`/admin/home/?section=benefits&edit=${id}`);
}

export async function createBenefitAction() {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("benefits")
    .insert({ sort_order: 99, status: "draft" })
    .select("id")
    .single();
  if (error || !data) return adminFail(error?.message ?? "Create failed");

  await supabase.from("benefit_translations").insert(
    (["ru", "uz", "en"] as const).map((locale) => ({
      benefit_id: data.id,
      locale,
      label: "New benefit",
    })),
  );

  revalidateCms(["cms", "benefits"]);
  return adminRedirect(`/admin/home/?section=benefits&edit=${data.id}`);
}

export async function deleteBenefitAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  await supabase.from("benefits").delete().eq("id", String(formData.get("id")));
  revalidateCms(["cms", "benefits"]);
  return adminRedirect("/admin/home/?section=benefits");
}
