export const locales = ["ru", "uz", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export const localeLabels: Record<Locale, string> = {
  ru: "RU",
  uz: "UZ",
  en: "EN",
};

export const htmlLang: Record<Locale, string> = {
  ru: "ru",
  uz: "uz",
  en: "en",
};

export const ogLocale: Record<Locale, string> = {
  ru: "ru_RU",
  uz: "uz_UZ",
  en: "en_US",
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
