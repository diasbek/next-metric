import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import { getAllPublishedSlugsFromCms } from "@/lib/cms/projects";

async function fetchSiteSettingsUpdatedAt(): Promise<string | null> {
  if (!hasSupabaseAdminConfig()) return null;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("metric_site_settings")
      .select("updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data?.updated_at) return null;
    return data.updated_at as string;
  } catch {
    return null;
  }
}

const getCachedSettingsUpdatedAt = unstable_cache(
  fetchSiteSettingsUpdatedAt,
  ["cms-site-settings-updated-at"],
  { tags: ["cms", "settings"], revalidate: false },
);

/** Latest CMS content timestamp for sitemap lastmod / og:updated_time. */
export async function getContentFreshnessDate(): Promise<Date> {
  const [projectEntries, settingsUpdatedAt] = await Promise.all([
    getAllPublishedSlugsFromCms(),
    getCachedSettingsUpdatedAt(),
  ]);

  const timestamps = [
    ...projectEntries.map((item) => Date.parse(item.updated_at)),
    settingsUpdatedAt ? Date.parse(settingsUpdatedAt) : Number.NaN,
  ].filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) return new Date();
  return new Date(Math.max(...timestamps));
}
