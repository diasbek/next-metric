"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminFail, adminRedirect, runAdminAction } from "@/lib/cms/admin-redirect";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

export async function saveHomeWhyUsAction(formData: FormData) {
  return runAdminAction(async () => {
    await requirePermission("content");
    const supabase = createSupabaseAdminClient();
    const localeUi = await getAdminUiLocale();
    const t = getAdminMessages(localeUi);

    for (const locale of ["en", "de"] as const) {
      const line1 = String(formData.get(`${locale}_why_us_title_line_1`) ?? "").trim();
      const line2 = String(formData.get(`${locale}_why_us_title_line_2`) ?? "").trim();
      const { error } = await supabase.from("home_translations").upsert({
        locale,
        why_us_title_line_1: line1,
        why_us_title_line_2: line2,
        updated_at: new Date().toISOString(),
      });
      if (error) return adminFail(error.message);
    }

    revalidateCms(["cms", "home", "benefits"]);
    return adminRedirect("/admin/home/?section=benefits&saved=1", t.common.saved);
  });
}
