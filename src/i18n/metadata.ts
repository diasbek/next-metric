import type { Metadata } from "next";
import type { Locale, PageKey } from "./config";
import { pagePaths } from "./config";
import { getContent, getResolvedContent } from "./get-content";
import { getLocalizedAlternates, localePath } from "./paths";
import { getContentFreshnessDate } from "@/lib/cms/freshness";
import { createPageMetadata } from "@/utils/metadata";
import {
  getPageOgImagePath,
  isOgPageKey,
} from "@/utils/og/paths";
import { ogLocale } from "./config";

export async function getLocalizedPageMetadata(
  locale: Locale,
  pageKey: PageKey,
  options?: { image?: string },
): Promise<Metadata> {
  const content = await getResolvedContent(locale);
  const meta = content.pageMeta[pageKey];
  const path = localePath(locale, pagePaths[pageKey]);
  const alternates = getLocalizedAlternates(pagePaths[pageKey]);
  const image =
    options?.image ??
    (isOgPageKey(pageKey) ? getPageOgImagePath(locale, pageKey) : undefined);
  const modifiedTime = (await getContentFreshnessDate()).toISOString();

  return createPageMetadata(meta.title, meta.description, path, {
    locale,
    ogLocale: ogLocale[locale],
    alternates: Object.fromEntries(
      Object.entries(alternates).map(([lang, href]) => [
        lang,
        `${content.site.url}${href}`,
      ]),
    ),
    modifiedTime,
    ...(meta.keywords?.trim() ? { keywords: meta.keywords } : {}),
    ...(image ? { image } : {}),
  });
}

export function getLocalizedNotFoundMetadata(locale: Locale) {
  const content = getContent(locale);
  const meta = content.pageMeta.notFound;

  return {
    title: meta.title,
    description: meta.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}
