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

export type TestimonialTranslationDraft = {
  locale: AdminLocale;
  role: string;
  quote: string;
};

export type TestimonialDraft = {
  id: string;
  sort_order: number;
  status: string;
  person_image: string;
  person_object_position: string;
  logo_image: string;
  logo_rounded: string;
  translations: Record<AdminLocale, TestimonialTranslationDraft>;
};

export function isLocaleFilled(tr: TestimonialTranslationDraft): boolean {
  return Boolean(tr.role.trim() && tr.quote.trim());
}

export function localizationScore(
  translations: Record<AdminLocale, TestimonialTranslationDraft>,
): { filled: number; total: number } {
  const filled = ADMIN_LOCALES.filter((l) =>
    isLocaleFilled(translations[l.code]),
  ).length;
  return { filled, total: ADMIN_LOCALES.length };
}
