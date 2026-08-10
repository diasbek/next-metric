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

export type ProcessTranslationDraft = {
  locale: AdminLocale;
  title: string;
  description: string;
};

export type ProcessDraft = {
  id: string;
  sort_order: number;
  status: string;
  translations: Record<AdminLocale, ProcessTranslationDraft>;
};

export function isProcessLocaleFilled(tr: ProcessTranslationDraft): boolean {
  return Boolean(tr.title.trim());
}

export function processLocaleScore(
  translations: Record<AdminLocale, ProcessTranslationDraft>,
): { filled: number; total: number } {
  const filled = ADMIN_LOCALES.filter((l) =>
    isProcessLocaleFilled(translations[l.code]),
  ).length;
  return { filled, total: ADMIN_LOCALES.length };
}

export type BenefitTranslationDraft = {
  locale: AdminLocale;
  label: string;
};

export type BenefitDraft = {
  id: string;
  sort_order: number;
  status: string;
  translations: Record<AdminLocale, BenefitTranslationDraft>;
};

export function isBenefitLocaleFilled(tr: BenefitTranslationDraft): boolean {
  return Boolean(tr.label.trim());
}

export function benefitLocaleScore(
  translations: Record<AdminLocale, BenefitTranslationDraft>,
): { filled: number; total: number } {
  const filled = ADMIN_LOCALES.filter((l) =>
    isBenefitLocaleFilled(translations[l.code]),
  ).length;
  return { filled, total: ADMIN_LOCALES.length };
}
