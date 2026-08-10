export type AdminLocale = "ru" | "uz" | "en";

export const ADMIN_LOCALES: Array<{
  code: AdminLocale;
  label: string;
  short: string;
}> = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "uz", label: "O‘zbekcha", short: "UZ" },
  { code: "en", label: "English", short: "EN" },
];

export type ServiceTranslationDraft = {
  locale: AdminLocale;
  title: string;
  short: string;
  full: string;
  price: string;
  duration: string;
};

export type ServiceDraft = {
  id: string;
  service_key: string;
  sort_order: number;
  status: string;
  translations: Record<AdminLocale, ServiceTranslationDraft>;
};

export function isServiceLocaleFilled(tr: ServiceTranslationDraft): boolean {
  return Boolean(tr.title.trim() && tr.short.trim());
}

export function serviceLocaleScore(
  translations: Record<AdminLocale, ServiceTranslationDraft>,
): { filled: number; total: number } {
  const filled = ADMIN_LOCALES.filter((l) =>
    isServiceLocaleFilled(translations[l.code]),
  ).length;
  return { filled, total: ADMIN_LOCALES.length };
}
