import type { Locale, PageKey } from "@/i18n/config";

export const OG_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 630,
} as const;

const PAGE_KEYS = ["home", "agency", "works", "services", "contacts"] as const;

export type OgPageKey = (typeof PAGE_KEYS)[number];

export function isOgPageKey(pageKey: PageKey): pageKey is OgPageKey {
  return PAGE_KEYS.includes(pageKey as OgPageKey);
}

export function getPageOgImagePath(locale: Locale, pageKey: OgPageKey): string {
  return `/og/${locale}/${pageKey}/`;
}

export function getWorkOgImagePath(locale: Locale, slug: string): string {
  return `/og/${locale}/works/${slug}/`;
}

export const ogEyebrows: Record<Locale, Record<OgPageKey, string>> = {
  en: {
    home: "Amazon design",
    agency: "About",
    works: "Projects",
    services: "Services",
    contacts: "Contact",
  },
  de: {
    home: "Amazon Design",
    agency: "Über uns",
    works: "Projekte",
    services: "Leistungen",
    contacts: "Kontakt",
  },
};
