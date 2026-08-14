import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { ogLocale, pagePaths } from "@/i18n/config";
import { getAllProjectSlugs, getContent, getProjectBySlug, getResolvedContent } from "@/i18n/get-content";
import { getLocalizedPageMetadata } from "@/i18n/metadata";
import {
  getLocalizedCreativeWorkSchema,
  getLocalizedFaqSchema,
  getLocalizedLocalBusinessSchema,
  getLocalizedPageJsonLd,
  getLocalizedProjectListSchema,
  getLocalizedServicesCatalogSchema,
} from "@/i18n/page-seo";
import { getLocalizedAlternates, localePath } from "@/i18n/paths";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteLayout } from "@/components/templates";
import { WorkCaseSection } from "@/components/organisms";
import { getContentFreshnessDate } from "@/lib/cms/freshness";
import { getAllPublishedSlugsFromCms } from "@/lib/cms/projects";
import { createPageMetadata } from "@/utils/metadata";
import { getWorkOgImagePath } from "@/utils/og/paths";
import { HomePageView } from "@/views/HomePageView";
import { AgencyPageView } from "@/views/AgencyPageView";
import { WorksPageView } from "@/views/WorksPageView";
import { ServicesPageView } from "@/views/ServicesPageView";
import { ContactsPageView } from "@/views/ContactsPageView";

export function createWorkCasePage(locale: Locale) {
  return {
    async generateStaticParams(): Promise<Array<{ slug: string }>> {
      const slugs = await getAllProjectSlugs();
      return slugs.map((slug: string) => ({ slug }));
    },

    async generateMetadata({
      params,
    }: {
      params: Promise<{ slug: string }>;
    }): Promise<Metadata> {
      const { slug } = await params;
      const project = await getProjectBySlug(locale, slug);
      if (!project) return {};

      const seoTitle = project.seo?.metaTitle || `${project.title} — METRIC`;
      const seoDescription =
        project.seo?.metaDescription || project.description;
      const path = localePath(locale, `/works/${slug}/`);
      const alternates = getLocalizedAlternates(`/works/${slug}/`);
      const cmsSlugs = await getAllPublishedSlugsFromCms();
      const modifiedTime =
        cmsSlugs.find((item) => item.slug === slug)?.updated_at ??
        (await getContentFreshnessDate()).toISOString();
      const ogImage =
        project.seo?.ogImage || getWorkOgImagePath(locale, slug);

      return createPageMetadata(seoTitle, seoDescription, path, {
        image: ogImage,
        locale,
        ogLocale: ogLocale[locale],
        type: "article",
        modifiedTime,
        keywords: project.seo?.keywords,
        robots:
          project.seo?.indexable === false
            ? { index: false, follow: false }
            : undefined,
        alternates: Object.fromEntries(
          Object.entries(alternates).map(([lang, href]) => [
            lang,
            `${getContent(locale).site.url}${href}`,
          ]),
        ),
      });
    },

    async Page({ params }: { params: Promise<{ slug: string }> }) {
      const { slug } = await params;
      const [project, content, cmsSlugs] = await Promise.all([
        getProjectBySlug(locale, slug),
        getResolvedContent(locale),
        getAllPublishedSlugsFromCms(),
      ]);

      if (!project) notFound();

      const title = project.seo?.metaTitle || `${project.title} — METRIC`;
      const description =
        project.seo?.metaDescription || project.description;
      const path = localePath(locale, `/works/${slug}/`);
      const creativeWork = getLocalizedCreativeWorkSchema(locale, slug);
      const dateModified =
        cmsSlugs.find((item) => item.slug === slug)?.updated_at ??
        (await getContentFreshnessDate()).toISOString();

      return (
        <>
          <JsonLd
            data={getLocalizedPageJsonLd(locale, {
              title,
              description,
              path,
              dateModified,
              breadcrumbs: [
                "home",
                "works",
                { name: project.title, path },
              ],
              extra: creativeWork ? [creativeWork] : [],
            })}
          />
          <SiteLayout locale={locale}>
            <WorkCaseSection
              locale={locale}
              content={content}
              project={project}
            />
          </SiteLayout>
        </>
      );
    },
  };
}

async function withPageDateModified(
  locale: Locale,
  meta: { title: string; description: string },
  path: string,
  breadcrumbs?: Array<
    "home" | "agency" | "works" | "services" | "contacts" | { name: string; path: string }
  >,
  extra?: Record<string, unknown>[],
) {
  const dateModified = (await getContentFreshnessDate()).toISOString();
  return getLocalizedPageJsonLd(locale, {
    title: meta.title,
    description: meta.description,
    path,
    breadcrumbs,
    extra,
    dateModified,
  });
}

export function createHomePage(locale: Locale) {
  const content = getContent(locale);
  const meta = content.pageMeta.home;
  const path = localePath(locale, pagePaths.home);

  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "home"),
    Page: async function HomePage() {
      return (
        <>
          <JsonLd data={await withPageDateModified(locale, meta, path)} />
          <HomePageView locale={locale} />
        </>
      );
    },
  };
}

export function createAgencyPage(locale: Locale) {
  const content = getContent(locale);
  const meta = content.pageMeta.agency;
  const path = localePath(locale, pagePaths.agency);

  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "agency"),
    Page: async function AgencyPage() {
      return (
        <>
          <JsonLd
            data={await withPageDateModified(locale, meta, path, ["home", "agency"], [
              getLocalizedFaqSchema(locale),
            ])}
          />
          <AgencyPageView locale={locale} />
        </>
      );
    },
  };
}

export function createWorksPage(locale: Locale) {
  const content = getContent(locale);
  const meta = content.pageMeta.works;
  const path = localePath(locale, pagePaths.works);

  return {
    generateMetadata: async ({
      searchParams,
    }: {
      searchParams?: Promise<Record<string, string | string[] | undefined>>;
    }) => {
      const params = (await searchParams) ?? {};
      const category = typeof params.category === "string" ? params.category.trim() : "";
      const type = typeof params.type === "string" ? params.type.trim() : "";
      const filtered = Boolean(category || type);
      const base = await getLocalizedPageMetadata(locale, "works");
      if (!filtered) return base;
      // Filtered list URLs canonicalize to clean /works/ and stay out of the index.
      return {
        ...base,
        robots: {
          index: false,
          follow: true,
        },
      };
    },
    Page: async function WorksPage() {
      return (
        <>
          <JsonLd
            data={await withPageDateModified(locale, meta, path, ["home", "works"], [
              getLocalizedProjectListSchema(locale),
            ])}
          />
          <WorksPageView locale={locale} />
        </>
      );
    },
  };
}

export function createServicesPage(locale: Locale) {
  const content = getContent(locale);
  const meta = content.pageMeta.services;
  const path = localePath(locale, pagePaths.services);

  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "services"),
    Page: async function ServicesPage() {
      return (
        <>
          <JsonLd
            data={await withPageDateModified(locale, meta, path, ["home", "services"], [
              getLocalizedServicesCatalogSchema(locale),
            ])}
          />
          <ServicesPageView locale={locale} />
        </>
      );
    },
  };
}

export function createContactsPage(locale: Locale) {
  const content = getContent(locale);
  const meta = content.pageMeta.contacts;
  const path = localePath(locale, pagePaths.contacts);

  return {
    generateMetadata: () => getLocalizedPageMetadata(locale, "contacts"),
    Page: async function ContactsPage() {
      return (
        <>
          <JsonLd
            data={await withPageDateModified(locale, meta, path, ["home", "contacts"], [
              getLocalizedLocalBusinessSchema(locale),
            ])}
          />
          <ContactsPageView locale={locale} />
        </>
      );
    },
  };
}
