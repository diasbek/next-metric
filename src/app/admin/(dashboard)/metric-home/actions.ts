"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminFail, adminRedirect, runAdminAction } from "@/lib/cms/admin-redirect";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

function parsePayload(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function saveMetricHomeAction(formData: FormData) {
  return runAdminAction(async () => {
    await requirePermission("content");
    const supabase = createSupabaseAdminClient();
    const localeUi = await getAdminUiLocale();
    const t = getAdminMessages(localeUi);

    const statusRaw = String(formData.get("status") ?? "published").trim();
    const status = statusRaw === "draft" ? "draft" : "published";

    const { error: homeError } = await supabase.from("metric_home").upsert({
      id: 1,
      status,
      updated_at: new Date().toISOString(),
    });
    if (homeError) return adminFail(homeError.message);

    for (const locale of ["en", "de"] as const) {
      const raw = String(formData.get(`${locale}_payload`) ?? "").trim();
      const payload = parsePayload(raw);
      if (!payload) {
        return adminFail(`Invalid ${locale.toUpperCase()} JSON payload`);
      }

      const { error } = await supabase.from("metric_home_translations").upsert({
        locale,
        payload,
        updated_at: new Date().toISOString(),
      });
      if (error) return adminFail(error.message);
    }

    const section = String(formData.get("section") ?? "hero").trim() || "hero";

    revalidateCms(["cms", "home", "metric-home"]);
    return adminRedirect(
      `/admin/metric-home/?section=${encodeURIComponent(section)}&saved=1`,
      t.common.saved,
    );
  });
}
