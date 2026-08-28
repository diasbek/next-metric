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

function origin() {
  return SITE_CONFIG.url.replace(/\/$/, "");
}

function absoluteUrl(path: string) {
  if (!path || path === "/") return `${origin()}/`;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin()}${normalized}`;
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
    url: absoluteUrl("/"),
    description: SITE_CONFIG.description,
    telephone: SITE_CONFIG.phone,
    logo: absoluteUrl("/images/metric/logo/metric-logo.svg"),
    image: absoluteUrl("/og/en/home/"),
    address: {
      "@type": "PostalAddress",
      streetAddress: STREET_ADDRESS,
      addressLocality: ADDRESS_LOCALITY,
      addressCountry: ADDRESS_COUNTRY,
    },
    sameAs: [
      SITE_CONFIG.social.upwork,
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.linkedin,
    ].filter(Boolean),
  };
}

export function getWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_CONFIG.name,
    url: absoluteUrl("/"),
    description: SITE_CONFIG.description,
    inLanguage: ["en", "de"],
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
  listName?: string,
) {
  const name =
    listName?.trim() ||
    (locale === "de" ? "METRIC Projekte" : "METRIC projects");

  return {
    "@type": "ItemList",
    name,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: absoluteUrl(localePath(locale, `/works/${project.slug}/`)),
    })),
  };
}

export function getCreativeWorkSchema(
  project: Project,
  locale: Locale = "en",
  options?: {
    datePublished?: string | null;
    dateModified?: string | null;
  },
) {
  const path = localePath(locale, `/works/${project.slug}/`);
  const url = absoluteUrl(path);
  const images = [
    project.image,
    ...(project.caseStudy?.blocks ?? []).flatMap((block) => {
      if (block.type === "gallery") return block.images.map((img) => img.url);
      if (block.type === "before_after") {
        return [block.beforeImage, block.afterImage].filter(Boolean) as string[];
      }
      return [];
    }),
  ]
    .filter(Boolean)
    .slice(0, 8)
    .map((src) => absoluteUrl(src));

  return {
    "@type": ["CreativeWork", "ImageGallery"],
    "@id": `${url}#creativework`,
    name: project.title,
    description: project.description,
    url,
    image: images.length ? images : absoluteUrl(project.image),
    creator: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: htmlLang[locale],
    ...(project.author ? { author: { "@type": "Person", name: project.author } } : {}),
    ...(project.sphere
      ? { about: { "@type": "Thing", name: project.sphere } }
      : {}),
    ...(project.tags.length
      ? { keywords: project.tags.join(", ") }
      : {}),
    ...(options?.datePublished ? { datePublished: options.datePublished } : {}),
    ...(options?.dateModified ? { dateModified: options.dateModified } : {}),
    isPartOf: { "@id": WEBSITE_ID },
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
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": `${absoluteUrl(path)}#localbusiness`,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: absoluteUrl(path),
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    image: absoluteUrl("/og/en/home/"),
    address: {
      "@type": "PostalAddress",
      streetAddress: STREET_ADDRESS,
      addressLocality: ADDRESS_LOCALITY,
      addressCountry: ADDRESS_COUNTRY,
    },
    sameAs: [
      SITE_CONFIG.social.upwork,
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram,
    ],
    parentOrganization: { "@id": ORGANIZATION_ID },
  };
}

export function getAboutPageSchema(locale: Locale = "en") {
  const path = localePath(locale, "/agency/");
  return {
    "@type": "AboutPage",
    "@id": `${absoluteUrl(path)}#about`,
    url: absoluteUrl(path),
    name: locale === "de" ? "Über METRIC" : "About METRIC",
    description: SITE_CONFIG.description,
    inLanguage: htmlLang[locale],
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    mainEntity: { "@id": ORGANIZATION_ID },
  };
}

export function getContactPageSchema(locale: Locale = "en") {
  const path = localePath(locale, "/contacts/");
  return {
    "@type": "ContactPage",
    "@id": `${absoluteUrl(path)}#contact`,
    url: absoluteUrl(path),
    name: locale === "de" ? "Kontakt" : "Contact",
    description: SITE_CONFIG.description,
    inLanguage: htmlLang[locale],
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": `${absoluteUrl(path)}#localbusiness` },
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
