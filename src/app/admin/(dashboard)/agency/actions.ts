"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";

export async function saveAgencyAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();

  await supabase.from("agency_content").upsert({
    id: 1,
    founded_year: String(formData.get("founded_year") ?? "2019"),
  });

  for (const locale of ["en", "de"] as const) {
    const line1 = String(formData.get(`${locale}_title_line_1`) ?? "").trim();
    const line2 = String(formData.get(`${locale}_title_line_2`) ?? "").trim();
    // Public /agency uses titleLines as H1 — keep `title` in sync for SEO/admin
    const title =
      String(formData.get(`${locale}_title`) ?? "").trim() ||
      [line1, line2].filter(Boolean).join(" ");

    const statsRaw = String(formData.get(`${locale}_stats`) ?? "");
    const stats = statsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [value, ...rest] = line.split("|");
        return { value: (value ?? "").trim(), label: rest.join("|").trim() };
      });

    const { error } = await supabase.from("agency_translations").upsert({
      locale,
      title,
      title_line_1: line1,
      title_line_2: line2,
      paragraphs: String(formData.get(`${locale}_paragraphs`) ?? "")
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
      stats,
    });
    if (error) return adminFail(error.message);
  }

  revalidateCms(["cms", "agency"]);
  return adminRedirect("/admin/agency/?saved=1");
}
