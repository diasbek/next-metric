import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  createSupabasePublicClient,
  hasSupabasePublicConfig,
} from "@/lib/supabase/public";
import type { Locale } from "@/i18n/config";
import type { Project } from "@/data/projects";
import {
  mapProjectRow,
  type CmsLocale,
  type ProjectWithRelations,
} from "@/lib/cms/types";

const PROJECT_REVIEW_EMBED = `
  project_reviews:metric_project_reviews (
    id, project_id, sort_order, person_image,
    project_review_translations:metric_project_review_translations (*)
  )
`;

const PROJECT_SELECT = `
  *,
  project_translations:metric_project_translations (*),
  project_media:metric_project_media (*),
  project_blocks:metric_project_blocks (*),
  ${PROJECT_REVIEW_EMBED}
`;

/** Listing/home cards — translations + reviews (first review feeds cards). */
const PROJECT_LISTING_SELECT = `
  *,
  project_translations:metric_project_translations (*),
  ${PROJECT_REVIEW_EMBED}
`;

async function fetchPublishedListingRows(): Promise<ProjectWithRelations[]> {
  if (!hasSupabasePublicConfig()) return [];

  try {
    const supabase = createSupabasePublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("metric_projects")
      .select(PROJECT_LISTING_SELECT)
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data as ProjectWithRelations[];
  } catch {
    return [];
  }
}

async function fetchPublishedProjectBySlug(
  slug: string,
): Promise<ProjectWithRelations | null> {
  if (!hasSupabasePublicConfig() || !slug) return null;

  try {
    const supabase = createSupabasePublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("metric_projects")
      .select(PROJECT_SELECT)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;
    return data as ProjectWithRelations;
  } catch {
    return null;
  }
}

const getCachedPublishedListingRows = unstable_cache(
  fetchPublishedListingRows,
  ["cms-published-project-listings"],
  { tags: ["cms", "projects"], revalidate: false },
);

const getCachedPublishedProjectBySlug = unstable_cache(
  fetchPublishedProjectBySlug,
  ["cms-published-project-by-slug"],
  { tags: ["cms", "projects"], revalidate: false },
);

export async function getPublishedProjects(locale: Locale): Promise<Project[]> {
  const rows = await getCachedPublishedListingRows();
  return rows
    .map((row) => mapProjectRow(row, locale as CmsLocale))
    .filter((p): p is Project => Boolean(p));
}

export async function getProjectBySlugFromCms(
  locale: Locale,
  slug: string,
): Promise<Project | null> {
  const row = await getCachedPublishedProjectBySlug(slug);
  if (!row) return null;
  return mapProjectRow(row, locale as CmsLocale);
}

export async function getAllPublishedSlugsFromCms(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  const rows = await getCachedPublishedListingRows();
  return rows
    .filter((r) => r.seo_indexable !== false)
    .map((r) => ({ slug: r.slug, updated_at: r.updated_at }));
}

export async function getAdminProjects(): Promise<
  Array<{
    id: string;
    slug: string;
    status: string;
    cover_image: string | null;
    sort_order: number | null;
    project_translations: Array<{ locale: string; title: string }>;
  }>
> {
  if (!hasSupabaseAdminConfig()) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("metric_projects")
    .select(
      "id, slug, status, cover_image, sort_order, project_translations:metric_project_translations ( locale, title )",
    )
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as Array<{
    id: string;
    slug: string;
    status: string;
    cover_image: string | null;
    sort_order: number | null;
    project_translations: Array<{ locale: string; title: string }>;
  }>;
}

export async function getAdminProjectById(
  id: string,
): Promise<ProjectWithRelations | null> {
  if (!hasSupabaseAdminConfig()) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("metric_projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as ProjectWithRelations;
}
