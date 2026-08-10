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

export function localeScore(filledCount: number, total = ADMIN_LOCALES.length) {
  return { filled: filledCount, total };
}
