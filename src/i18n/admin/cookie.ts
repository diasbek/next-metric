import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type { AdminUiLocale } from "./types";

export const ADMIN_UI_LOCALE_COOKIE = "admin_ui_locale";

export function parseAdminUiLocale(value: string | undefined | null): AdminUiLocale {
  if (value && (locales as readonly string[]).includes(value)) {
    return value as AdminUiLocale;
  }
  return defaultLocale;
}

export function buildAdminLocaleCookie(locale: Locale): string {
  const maxAge = 60 * 60 * 24 * 365;
  return `${ADMIN_UI_LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
