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

export type TeamTranslationDraft = {
  locale: AdminLocale;
  name: string;
  role: string;
};

export type TeamMemberDraft = {
  id: string;
  sort_order: number;
  status: string;
  image: string;
  image_object_position: string;
  is_director: boolean;
  translations: Record<AdminLocale, TeamTranslationDraft>;
};

export function isLocaleFilled(tr: TeamTranslationDraft): boolean {
  return Boolean(tr.name.trim() && tr.role.trim());
}

export function localizationScore(
  translations: Record<AdminLocale, TeamTranslationDraft>,
): { filled: number; total: number } {
  const filled = ADMIN_LOCALES.filter((l) =>
    isLocaleFilled(translations[l.code]),
  ).length;
  return { filled, total: ADMIN_LOCALES.length };
}
