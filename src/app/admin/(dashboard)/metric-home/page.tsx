import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMetricHome, toMetricHomePayload } from "@/data/metric-home";
import { MetricHomeAdmin } from "@/components/admin/page-shell/MetricHomeAdmin";

export default async function AdminMetricHomePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePermission("content");
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();

  const [{ data: home }, { data: translations }] = await Promise.all([
    supabase.from("metric_home").select("status").eq("id", 1).maybeSingle(),
    supabase.from("metric_home_translations").select("locale, payload"),
  ]);

  const byLocale = Object.fromEntries(
    (translations ?? []).map((row) => [row.locale, row.payload]),
  ) as Record<string, unknown>;

  const enPayload =
    byLocale.en && typeof byLocale.en === "object"
      ? (byLocale.en as Record<string, unknown>)
      : toMetricHomePayload(getMetricHome("en"));
  const dePayload =
    byLocale.de && typeof byLocale.de === "object"
      ? (byLocale.de as Record<string, unknown>)
      : toMetricHomePayload(getMetricHome("de"));

  return (
    <MetricHomeAdmin
      status={(home?.status as "draft" | "published") ?? "published"}
      payloads={{ en: enPayload, de: dePayload }}
      saved={Boolean(params.saved)}
    />
  );
}
