export type AdminLocale = "en" | "de";

export const ADMIN_LOCALES: Array<{
  code: AdminLocale;
  label: string;
  short: string;
}> = [
  { code: "en", label: "English", short: "EN" },
  { code: "de", label: "Deutsch", short: "DE" },
];

export function localeScore(filledCount: number, total = ADMIN_LOCALES.length) {
  return { filled: filledCount, total };
}
