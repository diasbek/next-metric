import type { Locale } from "./config";
import { enContent } from "./locales/en";
import { deContent } from "./locales/de";
import type { SiteContent } from "./types";
import type { Project } from "@/data/projects";
import {
  getAllPublishedSlugsFromCms,
  getProjectBySlugFromCms,
  getPublishedProjects,
} from "@/lib/cms/projects";
import { getCmsExtras } from "@/lib/cms/content";

const contentByLocale: Record<Locale, SiteContent> = {
  en: enContent,
  de: deContent,
};

/** Old handles that should never ship; prefer current brand social URLs. */
const LEGACY_SOCIAL = new Set([
  "https://t.me/timsol",
  "https://t.me/metricagency",
  "https://instagram.com/timsol",
  "https://www.instagram.com/timsol",
  "https://t.me/timsolagency",
  "https://www.instagram.com/timsolagency",
  "https://www.instagram.com/metricagency",
  "https://www.linkedin.com/",
]);

function resolveSocialUrl(cmsUrl: string | undefined, fallback: string): string {
  const value = cmsUrl?.trim() || "";
  if (!value || LEGACY_SOCIAL.has(value.replace(/\/$/, ""))) return fallback;
  return value;
}

/** Sync local content (UI chrome + fallback entities). */
export function getContent(locale: Locale): SiteContent {
  return contentByLocale[locale];
}

export async function getProjectsForLocale(locale: Locale): Promise<Project[]> {
  return getPublishedProjects(locale);
}

export async function getProjectBySlug(locale: Locale, slug: string) {
  return getProjectBySlugFromCms(locale, slug);
}

export async function getNextProjects(locale: Locale, slug: string, count = 2) {
  const projects = await getProjectsForLocale(locale);
  const current = projects.find((project) => project.slug === slug);
  if (!current) return projects.slice(0, count);

  const others = projects.filter((project) => project.slug !== slug);
  const scored = others
    .map((project) => {
      let score = 0;
      if (current.sphere && project.sphere === current.sphere) score += 3;
      for (const tag of current.tags) {
        if (project.tags.includes(tag)) score += 1;
      }
      return { project, score };
    })
    .sort((a, b) => b.score - a.score || a.project.slug.localeCompare(b.project.slug));

  const related = scored.filter((row) => row.score > 0).map((row) => row.project);
  if (related.length >= count) return related.slice(0, count);

  const relatedSlugs = new Set(related.map((p) => p.slug));
  const fill = others.filter((p) => !relatedSlugs.has(p.slug));
  return [...related, ...fill].slice(0, count);
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const fromCms = await getAllPublishedSlugsFromCms();
  return fromCms.map((row) => row.slug);
}

/** Merge CMS entities into locale content when available. */
export async function getResolvedContent(locale: Locale): Promise<SiteContent> {
  const base = getContent(locale);
  const [projects, extras] = await Promise.all([
    getProjectsForLocale(locale),
    getCmsExtras(locale),
  ]);

  if (!extras) {
    return { ...base, projects };
  }

  const cmsAbout = extras.agency.about;
  const hasCmsTitleLines = cmsAbout.titleLines.some((line) => line.trim().length > 0);
  const hasCmsParagraphs = cmsAbout.paragraphs.some((p) => p.trim().length > 0);
  const hasCmsStats = extras.agency.stats.length > 0;

  return {
    ...base,
    projects,
    services: extras.services.length ? extras.services : base.services,
    faq: extras.faq.length ? extras.faq : base.faq,
    sections: {
      ...base.sections,
    },
    agency: {
      ...base.agency,
      // Always prefer CMS agency copy when present (page uses titleLines, not title)
      about: {
        title:
          cmsAbout.title.trim() ||
          cmsAbout.titleLines.filter((l) => l.trim()).join(" ") ||
          base.agency.about.title,
        titleLines: hasCmsTitleLines
          ? ([
              cmsAbout.titleLines[0]?.trim() || base.agency.about.titleLines[0],
              cmsAbout.titleLines[1]?.trim() || base.agency.about.titleLines[1],
            ] as [string, string])
          : base.agency.about.titleLines,
        paragraphs: hasCmsParagraphs
          ? cmsAbout.paragraphs
          : base.agency.about.paragraphs,
      },
      foundedYear: extras.agency.foundedYear || base.agency.foundedYear,
      stats: hasCmsStats ? extras.agency.stats : base.agency.stats,
      director: extras.agency.director.name
        ? extras.agency.director
        : base.agency.director,
      team: extras.agency.team.length ? extras.agency.team : base.agency.team,
      testimonials: extras.agency.testimonials.length
        ? extras.agency.testimonials
        : base.agency.testimonials,
    },
    pageMeta: {
      ...base.pageMeta,
      ...Object.fromEntries(
        Object.entries(extras.pageSeo).map(([key, value]) => {
          const fallback = base.pageMeta[key as keyof typeof base.pageMeta];
          return [
            key,
            {
              title: value.title || fallback?.title || "",
              description: value.description || fallback?.description || "",
              keywords: value.keywords || fallback?.keywords || "",
              ogImage: value.ogImage || fallback?.ogImage || "",
              noindex: value.noindex ?? fallback?.noindex ?? false,
            },
          ];
        }),
      ),
    } as SiteContent["pageMeta"],
    site: {
      ...base.site,
      ...(extras.siteSettings
        ? {
            phone: extras.siteSettings.phone || base.site.phone,
            social: {
              upwork: base.site.social.upwork,
              facebook: base.site.social.facebook,
              instagram: resolveSocialUrl(
                extras.siteSettings.instagram_url,
                base.site.social.instagram,
              ),
              linkedin: base.site.social.linkedin,
              x: base.site.social.x,
            },
            files: {
              presentation:
                extras.siteSettings.presentation_url ||
                base.site.files.presentation,
              brief:
                extras.siteSettings.brief_url || base.site.files.brief,
            },
            address: extras.siteSettings.address_lines?.length
              ? extras.siteSettings.address_lines
              : base.site.address,
          }
        : {}),
    },
  };
}
