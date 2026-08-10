import { defaultLocale, type Locale } from "@/i18n/config";
import type { AdminMessages, AdminUiLocale } from "./types";
import { enAdmin } from "./messages/en";
import { deAdmin } from "./messages/de";

const catalog: Record<AdminUiLocale, AdminMessages> = {
  en: enAdmin,
  de: deAdmin,
};

export function getAdminMessages(locale: Locale = defaultLocale): AdminMessages {
  return catalog[locale] ?? catalog[defaultLocale];
}
