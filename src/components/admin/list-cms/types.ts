export type AdminLocale = "en" | "de";

export const ADMIN_LOCALES: Array<{
  code: AdminLocale;
  label: string;
  short: string;
}> = [
  { code: "en", label: "English", short: "EN" },
  { code: "de", label: "Deutsch", short: "DE" },
];

export type FaqTranslationDraft = {
  locale: AdminLocale;
  question: string;
  answer: string;
};

export type FaqDraft = {
  id: string;
  sort_order: number;
  status: string;
  translations: Record<AdminLocale, FaqTranslationDraft>;
};

export function isFaqLocaleFilled(tr: FaqTranslationDraft): boolean {
  return Boolean(tr.question.trim() && tr.answer.trim());
}

export function faqLocaleScore(
  translations: Record<AdminLocale, FaqTranslationDraft>,
): { filled: number; total: number } {
  const filled = ADMIN_LOCALES.filter((l) =>
    isFaqLocaleFilled(translations[l.code]),
  ).length;
  return { filled, total: ADMIN_LOCALES.length };
}
