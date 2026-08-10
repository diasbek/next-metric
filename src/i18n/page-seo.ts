import type { Locale } from "./config";
import { htmlLang } from "./config";
import { getContent } from "./get-content";
import { localePath } from "./paths";
import {
  getCreativeWorkSchema,
  getFaqPageSchema,
  getLocalBusinessSchema,
  getPageJsonLd,
  getProjectListSchema,
  getServicesCatalogSchema,
} from "@/utils/seo/json-ld";

export function getLocalizedBreadcrumbs(
  locale: Locale,
  items: Array<
    "home" | "agency" | "works" | "services" | "contacts" | { name: string; path: string }
  >,
) {
  const { ui } = getContent(locale);
  const labels = {
    home: ui.breadcrumbHome,
    agency: ui.breadcrumbAgency,
    works: ui.breadcrumbWorks,
    services: ui.breadcrumbServices,
    contacts: ui.breadcrumbContacts,
  };
  const paths = {
    home: localePath(locale, "/"),
    agency: localePath(locale, "/agency/"),
    works: localePath(locale, "/works/"),
    services: localePath(locale, "/services/"),
    contacts: localePath(locale, "/contacts/"),
  };

  return items.map((item) => {
    if (typeof item === "string") {
      return { name: labels[item], path: paths[item] };
    }
    return item;
  });
}

export function getLocalizedPageJsonLd(
  locale: Locale,
  {
    title,
    description,
    path,
    breadcrumbs,
    extra,
    dateModified,
  }: {
    title: string;
    description: string;
    path: string;
    breadcrumbs?: Array<
      "home" | "agency" | "works" | "services" | "contacts" | { name: string; path: string }
    >;
    extra?: Record<string, unknown>[];
    dateModified?: string;
  },
) {
  return getPageJsonLd({
    title,
    description,
    path,
    locale,
    breadcrumbs: breadcrumbs
      ? getLocalizedBreadcrumbs(locale, breadcrumbs)
      : undefined,
    extra,
    dateModified,
  });
}

export function getLocalizedFaqSchema(locale: Locale) {
  return getFaqPageSchema(getContent(locale).faq);
}

export function getLocalizedProjectListSchema(locale: Locale) {
  const content = getContent(locale);
  return getProjectListSchema(content.projects, locale, content.ui.breadcrumbWorks);
}

export function getLocalizedCreativeWorkSchema(
  locale: Locale,
  slug: string,
) {
  const project = getContent(locale).projects.find((item) => item.slug === slug);
  if (!project) return null;
  return getCreativeWorkSchema(project, locale);
}

export function getLocalizedServicesCatalogSchema(locale: Locale) {
  return getServicesCatalogSchema(getContent(locale).services, locale);
}

export function getLocalizedLocalBusinessSchema(locale: Locale) {
  return getLocalBusinessSchema(locale);
}

export function getLocalizedInLanguage(locale: Locale) {
  return htmlLang[locale];
}
