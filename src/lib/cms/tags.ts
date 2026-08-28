import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import {
  createSupabasePublicClient,
  hasSupabasePublicConfig,
} from "@/lib/supabase/public";
import { T } from "@/lib/cms/tables";
import type {
  CmsLocale,
  TagKind,
  TagWithTranslations,
} from "@/lib/cms/types";

const TAG_SELECT = `
  *,
  tag_translations:metric_tag_translations (*)
`;

export type ResolvedTag = {
  id: string;
  kind: TagKind;
  slug: string;
  sort_order: number;
  is_active: boolean;
  label: string;
  labels: Record<CmsLocale, string>;
};

function mapTagRow(
  row: TagWithTranslations,
  locale: CmsLocale = "en",
): ResolvedTag {
  const translations = row.tag_translations ?? [];
  const byLocale = Object.fromEntries(
    translations.map((tr) => [tr.locale, tr.label]),
  ) as Partial<Record<CmsLocale, string>>;
  const labels: Record<CmsLocale, string> = {
    en: byLocale.en?.trim() || row.slug,
    de: byLocale.de?.trim() || byLocale.en?.trim() || row.slug,
  };
  return {
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    sort_order: row.sort_order,
    is_active: row.is_active,
    label: labels[locale] || row.slug,
    labels,
  };
}

async function fetchActiveTags(): Promise<TagWithTranslations[]> {
  if (!hasSupabasePublicConfig()) return [];
  try {
    const supabase = createSupabasePublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(T.tags)
      .select(TAG_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return data as TagWithTranslations[];
  } catch {
    return [];
  }
}

const getCachedActiveTags = unstable_cache(
  fetchActiveTags,
  ["cms-active-tags"],
  { tags: ["cms", "tags", "projects"], revalidate: false },
);

export async function getActiveTags(
  locale: Locale = "en",
): Promise<ResolvedTag[]> {
  const rows = await getCachedActiveTags();
  return rows
    .map((row) => mapTagRow(row, locale as CmsLocale))
    .sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug));
}

export async function getActiveTagsByKind(
  kind: TagKind,
  locale: Locale = "en",
): Promise<ResolvedTag[]> {
  const tags = await getActiveTags(locale);
  return tags.filter((tag) => tag.kind === kind);
}

export async function getAdminTags(): Promise<ResolvedTag[]> {
  if (!hasSupabaseAdminConfig()) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(T.tags)
    .select(TAG_SELECT)
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return (data as TagWithTranslations[]).map((row) => mapTagRow(row, "en"));
}

export async function getProjectTagIds(projectId: string): Promise<string[]> {
  if (!hasSupabaseAdminConfig() || !projectId) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(T.projectTags)
    .select("tag_id")
    .eq("project_id", projectId);
  if (error || !data) return [];
  return data.map((row) => String(row.tag_id));
}

export async function getProjectTags(
  projectId: string,
  locale: Locale = "en",
): Promise<ResolvedTag[]> {
  if (!hasSupabaseAdminConfig() || !projectId) return [];
  const supabase = createSupabaseAdminClient();
  const { data: links, error } = await supabase
    .from(T.projectTags)
    .select("tag_id")
    .eq("project_id", projectId);
  if (error || !links?.length) return [];
  const ids = links.map((row) => String(row.tag_id));
  const { data, error: tagError } = await supabase
    .from(T.tags)
    .select(TAG_SELECT)
    .in("id", ids);
  if (tagError || !data) return [];
  return (data as TagWithTranslations[])
    .map((row) => mapTagRow(row, locale as CmsLocale))
    .sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug));
}

/** Normalize form/UI label into a stable filter slug (keeps spaces / +). */
export function slugifyTagLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

/**
 * Replace project↔tag links, then denormalize into sphere + translation.tags
 * (slugs) so public cards/filters keep working.
 */
export async function replaceProjectTags(
  projectId: string,
  tagIds: string[],
): Promise<{ sphere: string; tags: string[] } | { error: string }> {
  if (!hasSupabaseAdminConfig()) return { error: "Admin not configured" };
  const supabase = createSupabaseAdminClient();
  const uniqueIds = [...new Set(tagIds.map(String).filter(Boolean))];

  let resolved: ResolvedTag[] = [];
  if (uniqueIds.length) {
    const { data, error } = await supabase
      .from(T.tags)
      .select(TAG_SELECT)
      .in("id", uniqueIds);
    if (error) return { error: error.message };
    resolved = (data as TagWithTranslations[]).map((row) => mapTagRow(row));
  }

  const categories = resolved.filter((t) => t.kind === "category");
  const types = resolved.filter((t) => t.kind === "type");
  if (categories.length > 1) {
    return { error: "A case can have at most one category tag" };
  }

  const ordered = [
    ...categories.sort((a, b) => a.sort_order - b.sort_order),
    ...types.sort((a, b) => a.sort_order - b.sort_order),
  ];
  const finalIds = ordered.map((t) => t.id);
  const sphere = categories[0]?.slug ?? "";
  const tags = ordered.map((t) => t.slug);

  const { error: delError } = await supabase
    .from(T.projectTags)
    .delete()
    .eq("project_id", projectId);
  if (delError) return { error: delError.message };

  if (finalIds.length) {
    const { error: insError } = await supabase.from(T.projectTags).insert(
      finalIds.map((tag_id) => ({ project_id: projectId, tag_id })),
    );
    if (insError) return { error: insError.message };
  }

  const { error: projectError } = await supabase
    .from(T.projects)
    .update({ sphere })
    .eq("id", projectId);
  if (projectError) return { error: projectError.message };

  for (const locale of ["en", "de"] as const) {
    const { error: trError } = await supabase
      .from(T.projectTranslations)
      .update({ tags })
      .eq("project_id", projectId)
      .eq("locale", locale);
    if (trError) return { error: trError.message };
  }

  return { sphere, tags };
}

export function classifyTagSlug(
  slug: string,
  tags: readonly Pick<ResolvedTag, "slug" | "kind">[],
): TagKind | null {
  const key = slug.trim().toLowerCase();
  if (!key) return null;
  const match = tags.find((t) => t.slug.toLowerCase() === key);
  return match?.kind ?? null;
}
