"use server";

import { cookies } from "next/headers";
import { locales, type Locale } from "@/i18n/config";
import { ADMIN_UI_LOCALE_COOKIE } from "@/i18n/admin/cookie";

export async function setAdminUiLocaleAction(locale: string) {
  if (!(locales as readonly string[]).includes(locale)) {
    return { ok: false as const };
  }

  const store = await cookies();
  store.set(ADMIN_UI_LOCALE_COOKIE, locale as Locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return { ok: true as const };
}
