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
  "https://instagram.com/timsol",
  "https://www.instagram.com/timsol",
  "https://t.me/timsolagency",
  "https://www.instagram.com/timsolagency",
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
  const fromCms = await getPublishedProjects(locale);
  if (fromCms.length > 0) return fromCms;
  return getContent(locale).projects;
}

export async function getProjectBySlug(locale: Locale, slug: string) {
  const fromCms = await getProjectBySlugFromCms(locale, slug);
  if (fromCms) return fromCms;
  return getContent(locale).projects.find((project) => project.slug === slug);
}

export async function getNextProjects(locale: Locale, slug: string, count = 2) {
  const projects = await getProjectsForLocale(locale);
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return projects.slice(0, count);
  const next = projects.slice(index + 1, index + 1 + count);
  if (next.length < count) {
    return [...next, ...projects.slice(0, count - next.length)];
  }
  return next;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const fromCms = await getAllPublishedSlugsFromCms();
  if (fromCms.length > 0) return fromCms.map((row) => row.slug);
  return enContent.projects.map((project) => project.slug);
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
  const hasCmsWhyUsTitle = extras.whyUsTitleLines.some((line) => line.trim().length > 0);

  return {
    ...base,
    projects,
    services: extras.services.length ? extras.services : base.services,
    faq: extras.faq.length ? extras.faq : base.faq,
    processSteps: extras.processSteps.length ? extras.processSteps : base.processSteps,
    benefits: extras.benefits.length ? extras.benefits : base.benefits,
    sections: {
      ...base.sections,
      whyUsTitleLines: hasCmsWhyUsTitle
        ? ([
            extras.whyUsTitleLines[0]?.trim() || base.sections.whyUsTitleLines[0],
            extras.whyUsTitleLines[1]?.trim() || base.sections.whyUsTitleLines[1],
          ] as [string, string])
        : base.sections.whyUsTitleLines,
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
              telegram: resolveSocialUrl(
                extras.siteSettings.telegram_url,
                base.site.social.telegram,
              ),
              instagram: resolveSocialUrl(
                extras.siteSettings.instagram_url,
                base.site.social.instagram,
              ),
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
