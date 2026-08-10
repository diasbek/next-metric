import type { Locale } from "./config";
import type { SiteContent } from "./types";
import { getResolvedContent } from "./get-content";

export interface LocalePageProps {
  locale: Locale;
  content: SiteContent;
}

export async function getLocalePageProps(locale: Locale): Promise<LocalePageProps> {
  return { locale, content: await getResolvedContent(locale) };
}
