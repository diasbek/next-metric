import {
  directionFilters,
  sphereFilters,
} from "@/data/filters";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";

/** Category / industry values (excludes localized "All"). */
export const WORKS_CATEGORY_VALUES = sphereFilters.filter(
  (value) => value !== "All",
) as readonly string[];

/** Deliverable / type values (excludes localized "All"). */
export const WORKS_TYPE_VALUES = directionFilters.filter(
  (value) => value !== "All",
) as readonly string[];

const CATEGORY_SET = new Set(
  WORKS_CATEGORY_VALUES.map((value) => value.toLowerCase()),
);
const TYPE_SET = new Set(WORKS_TYPE_VALUES.map((value) => value.toLowerCase()));

export type WorksFilterKind = "category" | "type";

export function classifyWorksTag(tag: string): WorksFilterKind | null {
  const key = tag.trim().toLowerCase();
  if (!key) return null;
  if (CATEGORY_SET.has(key)) return "category";
  if (TYPE_SET.has(key)) return "type";
  return null;
}

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

export function worksTagHref(locale: Locale, tag: string): string {
  const kind = classifyWorksTag(tag);
  if (kind === "category") return worksListingHref(locale, { category: tag });
  if (kind === "type") return worksListingHref(locale, { type: tag });
  // Unknown tags still deep-link as type so the list can match on tags.
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
