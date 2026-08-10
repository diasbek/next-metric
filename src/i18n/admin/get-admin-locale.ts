import { cookies } from "next/headers";
import {
  ADMIN_UI_LOCALE_COOKIE,
  parseAdminUiLocale,
} from "./cookie";
import type { AdminUiLocale } from "./types";

export async function getAdminUiLocale(): Promise<AdminUiLocale> {
  const store = await cookies();
  return parseAdminUiLocale(store.get(ADMIN_UI_LOCALE_COOKIE)?.value);
}
