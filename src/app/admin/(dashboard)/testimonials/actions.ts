"use server";

import { adminFail, adminOk, adminRedirect } from "@/lib/cms/admin-redirect";
import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isFileUpload, uploadMediaFile } from "@/lib/cms/storage";

export async function saveTestimonialAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  const logoRoundedRaw = String(formData.get("logo_rounded") ?? "");
  const logoRounded =
    logoRoundedRaw === "full" || logoRoundedRaw === "lg" ? logoRoundedRaw : null;

  let personImage = String(formData.get("person_image") ?? "");
  let logoImage = String(formData.get("logo_image") ?? "");

  const personFile = formData.get("person_image_file");
  if (isFileUpload(personFile)) {
    const uploaded = await uploadMediaFile(personFile, {
      folder: `testimonials/${id}/person`,
      filenameHint: "person",
      maxEdge: 480,
    });
    personImage = uploaded.publicUrl;
  }

  const logoFile = formData.get("logo_image_file");
  if (isFileUpload(logoFile)) {
    const uploaded = await uploadMediaFile(logoFile, {
      folder: `testimonials/${id}/logo`,
      filenameHint: "logo",
      maxEdge: 800,
    });
    logoImage = uploaded.publicUrl;
  }

  await supabase
    .from("metric_testimonials")
    .update({
      sort_order: Number(formData.get("sort_order") ?? 0),
      person_image: personImage,
      person_object_position:
        String(formData.get("person_object_position") ?? "") || null,
      logo_image: logoImage,
      logo_rounded: logoRounded,
      status: String(formData.get("status") ?? "published"),
    })
    .eq("id", id);

  for (const locale of ["en", "de"] as const) {
    await supabase.from("metric_testimonial_translations").upsert({
      testimonial_id: id,
      locale,
      role: String(formData.get(`${locale}_role`) ?? ""),
      quote: String(formData.get(`${locale}_quote`) ?? ""),
    });
  }

  revalidateCms(["cms", "testimonials"]);
  return adminOk("Saved");
}

export async function createTestimonialAction() {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("metric_testimonials")
    .insert({ sort_order: 99, status: "draft" })
    .select("id")
    .single();
  if (error || !data) return adminFail(error?.message ?? "Create failed");

  await supabase.from("metric_testimonial_translations").insert(
    (["en", "de"] as const).map((locale) => ({
      testimonial_id: data.id,
      locale,
      role: "",
      quote: "New quote",
    })),
  );

  revalidateCms(["cms", "testimonials"]);
  return adminRedirect(`/admin/testimonials/?edit=${data.id}`);
}

export async function deleteTestimonialAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  await supabase.from("metric_testimonials").delete().eq("id", String(formData.get("id")));
  revalidateCms(["cms", "testimonials"]);
  return adminRedirect("/admin/testimonials/");
}

export async function reorderTestimonialsAction(orderedIds: string[]) {
  const { reorderCmsRows } = await import("@/lib/cms/reorder");
  const { T } = await import("@/lib/cms/tables");
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const t = getAdminMessages(await getAdminUiLocale());
  return reorderCmsRows({
    table: T.testimonials,
    orderedIds,
    tags: ["cms", "testimonials"],
    successMessage: t.common.orderSaved,
  });
}
