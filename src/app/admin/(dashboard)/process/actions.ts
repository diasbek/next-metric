"use server";

import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";
import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveProcessStepAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");

  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const stepNumber =
    String(formData.get("step_number") ?? "").trim() || String(sortOrder);

  await supabase
    .from("process_steps")
    .update({
      step_number: stepNumber,
      sort_order: sortOrder,
      status: String(formData.get("status") ?? "published"),
    })
    .eq("id", id);

  for (const locale of ["ru", "uz", "en"] as const) {
    await supabase.from("process_step_translations").upsert({
      step_id: id,
      locale,
      title: String(formData.get(`${locale}_title`) ?? ""),
      description: String(formData.get(`${locale}_description`) ?? ""),
    });
  }

  revalidateCms(["cms", "process"]);
  return adminRedirect(`/admin/home/?section=process&edit=${id}`);
}

export async function createProcessStepAction() {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("process_steps")
    .insert({ step_number: "99", sort_order: 99, status: "draft" })
    .select("id")
    .single();
  if (error || !data) return adminFail(error?.message ?? "Create failed");

  await supabase.from("process_step_translations").insert(
    (["ru", "uz", "en"] as const).map((locale) => ({
      step_id: data.id,
      locale,
      title: "New step",
      description: "",
    })),
  );

  revalidateCms(["cms", "process"]);
  return adminRedirect(`/admin/home/?section=process&edit=${data.id}`);
}

export async function deleteProcessStepAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  await supabase.from("process_steps").delete().eq("id", String(formData.get("id")));
  revalidateCms(["cms", "process"]);
  return adminRedirect("/admin/home/?section=process");
}
