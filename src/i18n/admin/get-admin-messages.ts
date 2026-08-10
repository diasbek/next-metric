import { defaultLocale, type Locale } from "@/i18n/config";
import type { AdminMessages, AdminUiLocale } from "./types";
import { ruAdmin } from "./messages/ru";
import { uzAdmin } from "./messages/uz";
import { enAdmin } from "./messages/en";

const catalog: Record<AdminUiLocale, AdminMessages> = {
  ru: ruAdmin,
  uz: uzAdmin,
  en: enAdmin,
};

export function getAdminMessages(locale: Locale = defaultLocale): AdminMessages {
  return catalog[locale] ?? catalog[defaultLocale];
}
