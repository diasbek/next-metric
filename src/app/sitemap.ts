import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getAllProjectSlugs } from "@/i18n/get-content";
import { getContentFreshnessDate } from "@/lib/cms/freshness";
import { getAllPublishedSlugsFromCms } from "@/lib/cms/projects";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";
import { isIndexableDeployment } from "@/utils/seo/indexing";

const staticPaths = [
  "/",
  "/works/",
  "/privacy/",
  "/newsletter/",
  "/careers/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexableDeployment()) {
    return [];
  }

  const base = SITE_CONFIG.url;
  const [cmsSlugs, staticLastModified] = await Promise.all([
    getAllPublishedSlugsFromCms(),
    getContentFreshnessDate(),
  ]);
  const fallbackSlugs = await getAllProjectSlugs();
  const projectEntries =
    cmsSlugs.length > 0
      ? cmsSlugs
      : fallbackSlugs.map((slug) => ({
          slug,
          updated_at: staticLastModified.toISOString(),
        }));

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      const localizedPath = localePath(locale, path);
      entries.push({
        url: `${base}${localizedPath}`,
        lastModified: staticLastModified,
        changeFrequency: path === "/" || path === "/works/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/works/" ? 0.9 : 0.5,
      });
    }

    for (const item of projectEntries) {
      const localizedPath = localePath(locale, `/works/${item.slug}/`);
      entries.push({
        url: `${base}${localizedPath}`,
        lastModified: new Date(item.updated_at),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
