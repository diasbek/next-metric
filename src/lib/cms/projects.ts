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

const PROJECT_SELECT = `
  *,
  project_translations:metric_project_translations (*),
  project_media:metric_project_media (*),
  project_blocks:metric_project_blocks (*)
`;

async function fetchPublishedProjectRows(): Promise<ProjectWithRelations[]> {
  if (!hasSupabasePublicConfig()) return [];

  try {
    const supabase = createSupabasePublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("metric_projects")
      .select(PROJECT_SELECT)
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data as ProjectWithRelations[];
  } catch {
    return [];
  }
}

const getCachedPublishedRows = unstable_cache(
  fetchPublishedProjectRows,
  ["cms-published-projects"],
  // Cache until admin calls updateTag via revalidateCms — no timed stale window
  { tags: ["cms", "projects"], revalidate: false },
);

export async function getPublishedProjects(locale: Locale): Promise<Project[]> {
  const rows = await getCachedPublishedRows();
  return rows
    .map((row) => mapProjectRow(row, locale as CmsLocale))
    .filter((p): p is Project => Boolean(p));
}

export async function getProjectBySlugFromCms(
  locale: Locale,
  slug: string,
): Promise<Project | null> {
  const rows = await getCachedPublishedRows();
  const row = rows.find((r) => r.slug === slug);
  if (!row) return null;
  return mapProjectRow(row, locale as CmsLocale);
}

export async function getAllPublishedSlugsFromCms(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  const rows = await getCachedPublishedRows();
  return rows.map((r) => ({ slug: r.slug, updated_at: r.updated_at }));
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
