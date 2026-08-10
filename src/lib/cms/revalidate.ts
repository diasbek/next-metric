import { after } from "next/server";
import { revalidatePath, updateTag } from "next/cache";

export const CMS_TAGS = [
  "cms",
  "projects",
  "services",
  "faq",
  "process",
  "benefits",
  "home",
  "metric-home",
  "team",
  "testimonials",
  "agency",
  "page_seo",
  "site_settings",
  "leads",
] as const;

export type CmsTag = (typeof CMS_TAGS)[number];

type PathEntry = [string, "layout" | "page"];

const LOCALES = ["", "/de"] as const;

function localePaths(
  suffix: string,
  type: "layout" | "page" = "layout",
): PathEntry[] {
  return LOCALES.map((prefix) => {
    if (!prefix && suffix === "/") return ["/", type] as PathEntry;
    if (!prefix) return [suffix, type] as PathEntry;
    return [`${prefix}${suffix === "/" ? "" : suffix}`, type] as PathEntry;
  });
}

/** Public routes affected by each CMS tag (narrower than full-site wipe). */
const TAG_PATHS: Record<CmsTag, PathEntry[]> = {
  cms: [["/sitemap.xml", "page"]],
  projects: [
    ...localePaths("/"),
    ...localePaths("/works"),
    ...localePaths("/works/[slug]", "page"),
    ["/sitemap.xml", "page"],
  ],
  services: [
    ...localePaths("/"),
    ...localePaths("/services"),
    ["/sitemap.xml", "page"],
  ],
  faq: [...localePaths("/agency"), ["/sitemap.xml", "page"]],
  process: [...localePaths("/"), ["/sitemap.xml", "page"]],
  benefits: [...localePaths("/"), ["/sitemap.xml", "page"]],
  home: [...localePaths("/"), ["/sitemap.xml", "page"]],
  "metric-home": [...localePaths("/"), ["/sitemap.xml", "page"]],
  team: [...localePaths("/agency"), ["/sitemap.xml", "page"]],
  testimonials: [...localePaths("/agency"), ["/sitemap.xml", "page"]],
  agency: [...localePaths("/agency"), ["/sitemap.xml", "page"]],
  page_seo: [
    ...localePaths("/"),
    ...localePaths("/works"),
    ...localePaths("/works/[slug]", "page"),
    ...localePaths("/agency"),
    ...localePaths("/services"),
    ...localePaths("/contacts"),
    ["/sitemap.xml", "page"],
  ],
  site_settings: [
    ...localePaths("/"),
    ...localePaths("/contacts"),
    ["/sitemap.xml", "page"],
  ],
  leads: [],
};

/**
 * Invalidate CMS data after admin mutations.
 *
 * Tags update immediately (next public request waits for fresh data).
 * Path revalidation runs in `after()` so the admin response is not blocked.
 */
export function revalidateCms(tags: CmsTag[] = ["cms", "projects"]) {
  const unique = new Set<CmsTag>(tags);

  for (const tag of unique) {
    updateTag(tag);
  }

  const paths = new Map<string, "layout" | "page">();
  for (const tag of unique) {
    for (const [path, type] of TAG_PATHS[tag] ?? []) {
      paths.set(path, type);
    }
  }

  if (paths.size === 0) return;

  after(() => {
    for (const [path, type] of paths) {
      revalidatePath(path, type);
    }
  });
}
