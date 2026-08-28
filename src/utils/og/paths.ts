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

/** Stable filename used by CMS “Generate & save”. */
export const OG_GENERATED_FILENAME = "og-generated.png";

/** Detect CMS-generated OG files by storage path convention. */
export function isGeneratedOgUrl(url: string): boolean {
  const clean = url.split("?")[0] ?? "";
  return (
    clean.includes(`/${OG_GENERATED_FILENAME}`) ||
    /\/og\/og-generated\.png$/i.test(clean)
  );
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
