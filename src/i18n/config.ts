export const locales = ["en", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  de: "DE",
};

export const htmlLang: Record<Locale, string> = {
  en: "en",
  de: "de",
};

export const ogLocale: Record<Locale, string> = {
  en: "en_US",
  de: "de_DE",
};

export type PageKey =
  | "home"
  | "agency"
  | "works"
  | "services"
  | "contacts"
  | "notFound";

export const pagePaths: Record<PageKey, string> = {
  home: "/",
  agency: "/agency/",
  works: "/works/",
  services: "/services/",
  contacts: "/contacts/",
  notFound: "/404/",
};
