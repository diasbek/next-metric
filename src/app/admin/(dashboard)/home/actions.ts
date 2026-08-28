"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
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

/** Persist case-study lineup as slug-only — card copy lives on the project. */
function normalizeHomePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const caseStudies = payload.caseStudies;
  if (!caseStudies || typeof caseStudies !== "object" || Array.isArray(caseStudies)) {
    return payload;
  }
  const section = caseStudies as Record<string, unknown>;
  const rawItems = Array.isArray(section.items) ? section.items : [];
  const items = rawItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const slug = String((item as { slug?: unknown }).slug ?? "").trim();
      return slug ? { slug } : null;
    })
    .filter((row): row is { slug: string } => row != null);

  return {
    ...payload,
    caseStudies: {
      ...section,
      items,
    },
  };
}

export async function saveMetricHomeAction(formData: FormData) {
  return runAdminAction(async () => {
    const actor = await requirePermission("content");
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
        payload: normalizeHomePayload(payload),
        updated_at: new Date().toISOString(),
      });
      if (error) return adminFail(error.message);
    }

    const section = String(formData.get("section") ?? "hero").trim() || "hero";

    await writeAuditLog({
      actor,
      action: "content.update",
      entityType: "home",
      entityId: "1",
      meta: { status, section },
    });

    revalidateCms(["cms", "home", "metric-home"]);
    return adminRedirect(
      `/admin/home/?section=${encodeURIComponent(section)}&saved=1`,
      t.common.saved,
    );
  });
}
