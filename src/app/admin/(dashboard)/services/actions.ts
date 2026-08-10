"use server";

import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";
import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveServiceAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");

  await supabase
    .from("metric_services")
    .update({
      service_key: String(formData.get("service_key") ?? ""),
      sort_order: Number(formData.get("sort_order") ?? 0),
      status: String(formData.get("status") ?? "published"),
    })
    .eq("id", id);

  for (const locale of ["en", "de"] as const) {
    await supabase.from("metric_service_translations").upsert({
      service_id: id,
      locale,
      title: String(formData.get(`${locale}_title`) ?? ""),
      short_description: String(formData.get(`${locale}_short`) ?? ""),
      full_description: String(formData.get(`${locale}_full`) ?? ""),
      price: String(formData.get(`${locale}_price`) ?? ""),
      duration: String(formData.get(`${locale}_duration`) ?? ""),
    });
  }

  revalidateCms(["cms", "services"]);
  return adminRedirect(`/admin/services/?edit=${id}`);
}

export async function createServiceAction() {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("metric_services")
    .insert({
      service_key: `service-${Date.now()}`,
      sort_order: 99,
      status: "draft",
    })
    .select("id")
    .single();
  if (error || !data) return adminFail(error?.message ?? "Create failed");

  await supabase.from("metric_service_translations").insert(
    (["en", "de"] as const).map((locale) => ({
      service_id: data.id,
      locale,
      title: "New service",
      short_description: "",
      full_description: "",
      price: "",
      duration: "",
    })),
  );

  revalidateCms(["cms", "services"]);
  return adminRedirect(`/admin/services/?edit=${data.id}`);
}

export async function deleteServiceAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  await supabase.from("metric_services").delete().eq("id", String(formData.get("id")));
  revalidateCms(["cms", "services"]);
  return adminRedirect("/admin/services/");
}

export async function reorderServicesAction(orderedIds: string[]) {
  const { reorderCmsRows } = await import("@/lib/cms/reorder");
  return reorderCmsRows({
    table: "services",
    orderedIds,
    tags: ["cms", "services"],
    successMessage: "Порядок услуг сохранён",
  });
}
