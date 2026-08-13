import type { FAQItem } from "@/data/faq";
import type { Project } from "@/data/projects";
import type { Service } from "@/data/services";
import type { Locale } from "@/i18n/config";
import { htmlLang } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { SITE_CONFIG } from "@/utils/consts";

export const ORGANIZATION_ID = `${SITE_CONFIG.url}/#organization`;
export const WEBSITE_ID = `${SITE_CONFIG.url}/#website`;

const ADDRESS_LOCALITY = "Tashkent";
const ADDRESS_COUNTRY = "UZ";
const STREET_ADDRESS = SITE_CONFIG.address.join(", ");

function absoluteUrl(path: string) {
  if (!path) return SITE_CONFIG.url;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_CONFIG.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function toGraph(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function getOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    telephone: SITE_CONFIG.phone,
    logo: absoluteUrl("/images/metric/logo/metric-logo.svg"),
    image: absoluteUrl("/og/ru/home/"),
    address: {
      "@type": "PostalAddress",
      streetAddress: STREET_ADDRESS,
      addressLocality: ADDRESS_LOCALITY,
      addressCountry: ADDRESS_COUNTRY,
    },
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.linkedin,
      SITE_CONFIG.social.telegram,
    ].filter(Boolean),
  };
}

export function getWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function getGlobalJsonLdGraph() {
  return toGraph(getOrganizationSchema(), getWebSiteSchema());
}

export function getWebPageSchema({
  title,
  description,
  path,
  locale = "en",
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
  dateModified?: string;
}) {
  const url = absoluteUrl(path);

  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    inLanguage: htmlLang[locale],
    ...(dateModified ? { dateModified } : {}),
  };
}

export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getFaqPageSchema(items: FAQItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getProjectListSchema(
  projects: Project[],
  locale: Locale = "en",
  listName = "Портфолио METRIC",
) {
  return {
    "@type": "ItemList",
    name: listName,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: absoluteUrl(localePath(locale, `/works/${project.slug}/`)),
    })),
  };
}

export function getCreativeWorkSchema(project: Project, locale: Locale = "en") {
  const path = localePath(locale, `/works/${project.slug}/`);
  const url = absoluteUrl(path);

  return {
    "@type": "CreativeWork",
    "@id": `${url}#creativework`,
    name: project.title,
    description: project.description,
    url,
    image: absoluteUrl(project.image),
    creator: { "@id": ORGANIZATION_ID },
    inLanguage: htmlLang[locale],
  };
}

export function getServicesCatalogSchema(services: Service[], locale: Locale = "en") {
  const catalogName =
    locale === "de" ? "METRIC Leistungen" : "METRIC services";

  return {
    "@type": "OfferCatalog",
    name: catalogName,
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.fullDescription,
        provider: { "@id": ORGANIZATION_ID },
      },
    })),
  };
}

export function getLocalBusinessSchema(locale: Locale = "en") {
  const path = localePath(locale, "/contacts/");

  return {
    "@type": "ProfessionalService",
    "@id": `${absoluteUrl(path)}#localbusiness`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: absoluteUrl(path),
    telephone: SITE_CONFIG.phone,
    image: absoluteUrl("/og-image/"),
    address: {
      "@type": "PostalAddress",
      streetAddress: STREET_ADDRESS,
      addressLocality: ADDRESS_LOCALITY,
      addressCountry: ADDRESS_COUNTRY,
    },
    sameAs: [SITE_CONFIG.social.telegram, SITE_CONFIG.social.instagram],
    parentOrganization: { "@id": ORGANIZATION_ID },
  };
}

export function getPageJsonLd({
  title,
  description,
  path,
  breadcrumbs,
  extra = [],
  locale = "en",
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  breadcrumbs?: { name: string; path: string }[];
  extra?: Record<string, unknown>[];
  locale?: Locale;
  dateModified?: string;
}) {
  const nodes = [
    getWebPageSchema({ title, description, path, locale, dateModified }),
    ...(breadcrumbs ? [getBreadcrumbSchema(breadcrumbs)] : []),
    ...extra,
  ];

  return toGraph(...nodes);
}
