import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { ResolvedTag } from "@/lib/cms/tags";
import { classifyTagSlug } from "@/lib/cms/tags";
import type { TagKind } from "@/lib/cms/types";
import {
  WORKS_CATEGORY_VALUES,
  WORKS_TYPE_VALUES,
} from "./works-filters-fallback";

export type WorksFilterOption = {
  value: string;
  label: string;
};

export type WorksFilterKind = TagKind;

/** @deprecated Prefer getActiveTags() — kept for fallbacks when CMS is empty. */
export { WORKS_CATEGORY_VALUES, WORKS_TYPE_VALUES };

export function worksListingHref(
  locale: Locale,
  filters: { category?: string | null; type?: string | null } = {},
): string {
  const base = localePath(locale, "/works/");
  const params = new URLSearchParams();
  const category = filters.category?.trim();
  const type = filters.type?.trim();
  if (category) params.set("category", category);
  if (type) params.set("type", type);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function worksTagHref(
  locale: Locale,
  tag: string,
  taxonomy: readonly Pick<ResolvedTag, "slug" | "kind">[] = [],
): string {
  const kind = classifyWorksTag(tag, taxonomy);
  if (kind === "category") return worksListingHref(locale, { category: tag });
  if (kind === "type") return worksListingHref(locale, { type: tag });
  return worksListingHref(locale, { type: tag });
}

export function projectMatchesWorksFilters(
  project: { sphere: string; tags: readonly string[] },
  category: string | null | undefined,
  type: string | null | undefined,
): boolean {
  const categoryOk =
    !category ||
    project.sphere === category ||
    project.tags.includes(category);
  const typeOk = !type || project.tags.includes(type);
  return categoryOk && typeOk;
}

export function uniqueWorksFilterOptions(
  values: readonly string[],
  allowed?: ReadonlySet<string> | readonly string[],
): string[] {
  const allow =
    allowed == null
      ? null
      : allowed instanceof Set
        ? allowed
        : new Set(allowed);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value || seen.has(value)) continue;
    if (allow && !allow.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

/** Build filter dropdown options from taxonomy, only values present on projects. */
export function worksFilterOptionsFromTaxonomy(
  taxonomy: readonly ResolvedTag[],
  kind: TagKind,
  usedSlugs: readonly string[],
): WorksFilterOption[] {
  const used = new Set(
    usedSlugs.map((s) => s.trim().toLowerCase()).filter(Boolean),
  );
  return taxonomy
    .filter((tag) => tag.kind === kind && used.has(tag.slug.toLowerCase()))
    .sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug))
    .map((tag) => ({ value: tag.slug, label: tag.label }));
}

export function classifyWorksTag(
  tag: string,
  taxonomy: readonly Pick<ResolvedTag, "slug" | "kind">[] = [],
): WorksFilterKind | null {
  const fromTaxonomy = classifyTagSlug(tag, taxonomy);
  if (fromTaxonomy) return fromTaxonomy;
  const key = tag.trim().toLowerCase();
  if (!key) return null;
  if (WORKS_CATEGORY_VALUES.some((value) => value.toLowerCase() === key)) {
    return "category";
  }
  if (WORKS_TYPE_VALUES.some((value) => value.toLowerCase() === key)) {
    return "type";
  }
  return null;
}
