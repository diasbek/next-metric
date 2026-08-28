import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

/** Ordered project slugs shown in Home → Case studies (EN payload, fallback DE). */
export async function getHomeCaseStudySlugs(): Promise<string[]> {
  if (!hasSupabaseAdminConfig()) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("metric_home_translations")
    .select("locale, payload")
    .in("locale", ["en", "de"]);
  if (error || !data?.length) return [];

  const byLocale = new Map(
    data.map((row) => [row.locale as string, row.payload as unknown]),
  );

  const fromPayload = (payload: unknown): string[] => {
    if (!payload || typeof payload !== "object") return [];
    const caseStudies = (payload as { caseStudies?: unknown }).caseStudies;
    if (!caseStudies || typeof caseStudies !== "object") return [];
    const items = (caseStudies as { items?: unknown }).items;
    if (!Array.isArray(items)) return [];
    const slugs: string[] = [];
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const slug = String((item as { slug?: unknown }).slug ?? "").trim();
      if (slug && !slugs.includes(slug)) slugs.push(slug);
    }
    return slugs;
  };

  const en = fromPayload(byLocale.get("en"));
  if (en.length) return en;
  return fromPayload(byLocale.get("de"));
}

export async function getHomeCaseStudySlugSet(): Promise<Set<string>> {
  return new Set(await getHomeCaseStudySlugs());
}
