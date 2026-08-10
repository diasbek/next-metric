import { unstable_cache } from "next/cache";
import {
  getMetricHome,
  type MetricHomeContent,
} from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import { createSupabasePublicClient, hasSupabasePublicConfig } from "@/lib/supabase/public";

type ProjectEnrichment = {
  cover_image: string | null;
  title: string | null;
};

function isPresentSection(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

/** Merge CMS payload over static defaults; empty arrays/objects/strings do not wipe. */
export function mergeMetricHome(
  base: MetricHomeContent,
  payload: Partial<MetricHomeContent>,
): MetricHomeContent {
  const next = { ...base };
  for (const key of Object.keys(base) as Array<keyof MetricHomeContent>) {
    const candidate = payload[key];
    if (isPresentSection(candidate)) {
      (next as Record<string, unknown>)[key] = candidate;
    }
  }
  return next;
}

/**
 * Soft-enrich case study cards from published `metric_projects`.
 * Keeps quote/author/role from the home payload; only fills cover/title when present.
 */
export async function enrichCaseStudiesFromProjects(
  content: MetricHomeContent,
  locale: Locale,
): Promise<MetricHomeContent> {
  const items = [...content.caseStudies.items];
  if (!hasSupabasePublicConfig()) return content;

  const slugs = [
    ...new Set(
      items
        .map((item) => (typeof item?.slug === "string" ? item.slug.trim() : ""))
        .filter(Boolean),
    ),
  ];
  if (slugs.length === 0) return content;

  try {
    const supabase = createSupabasePublicClient();
    if (!supabase) return content;
    const { data, error } = await supabase
      .from("metric_projects")
      .select(
        "slug, cover_image, metric_project_translations ( locale, title )",
      )
      .eq("status", "published")
      .in("slug", slugs);

    if (error || !data?.length) return content;

    const bySlug = new Map<string, ProjectEnrichment>();
    for (const row of data) {
      const slug = typeof row.slug === "string" ? row.slug : "";
      if (!slug) continue;
      const translations = Array.isArray(row.metric_project_translations)
        ? row.metric_project_translations
        : [];
      const match =
        translations.find(
          (tr: { locale?: string; title?: string }) => tr.locale === locale,
        ) ??
        translations.find(
          (tr: { locale?: string; title?: string }) => tr.locale === "en",
        );
      bySlug.set(slug, {
        cover_image:
          typeof row.cover_image === "string" && row.cover_image.trim()
            ? row.cover_image.trim()
            : null,
        title:
          typeof match?.title === "string" && match.title.trim()
            ? match.title.trim()
            : null,
      });
    }

    if (bySlug.size === 0) return content;

    const enrichedItems = items.map((item) => {
      const project = bySlug.get(item.slug);
      if (!project) return item;
      return {
        ...item,
        image: project.cover_image ?? item.image,
        ...(project.title ? { title: project.title } : {}),
      };
    });

    return {
      ...content,
      caseStudies: {
        ...content.caseStudies,
        items: enrichedItems as unknown as MetricHomeContent["caseStudies"]["items"],
      },
    };
  } catch {
    return content;
  }
}

async function loadMetricHomePayload(
  locale: Locale,
): Promise<Partial<MetricHomeContent> | null> {
  if (!hasSupabasePublicConfig()) return null;

  try {
    const supabase = createSupabasePublicClient();
    if (!supabase) return null;
    const [homeRes, trRes] = await Promise.all([
      supabase.from("metric_home").select("status").eq("id", 1).maybeSingle(),
      supabase
        .from("metric_home_translations")
        .select("payload")
        .eq("locale", locale)
        .maybeSingle(),
    ]);

    if (homeRes.error || trRes.error) return null;
    if (!homeRes.data || homeRes.data.status !== "published") return null;

    const payload = trRes.data?.payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return null;
    }
    if (Object.keys(payload as object).length === 0) return null;

    return payload as Partial<MetricHomeContent>;
  } catch {
    return null;
  }
}

async function resolveMetricHome(locale: Locale): Promise<MetricHomeContent> {
  const base = getMetricHome(locale);
  const payload = await loadMetricHomePayload(locale);
  const merged = payload ? mergeMetricHome(base, payload) : base;
  return enrichCaseStudiesFromProjects(merged, locale);
}

/** Public homepage copy: static defaults merged with published CMS payload. */
export function getMetricHomeResolved(locale: Locale) {
  return unstable_cache(() => resolveMetricHome(locale), [`metric-home-${locale}`], {
    tags: ["cms", "metric-home", "home", "projects"],
    revalidate: false,
  })();
}
