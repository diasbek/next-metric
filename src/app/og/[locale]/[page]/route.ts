import { locales, type Locale } from "@/i18n/config";
import { getResolvedContent } from "@/i18n/get-content";
import { buildPageOgProps, resolveOgSiteHostname } from "@/utils/og/build";
import {
  isOgPageKey,
  type OgPageKey,
} from "@/utils/og/paths";
import { renderOgImageResponse } from "@/utils/og/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

type RouteParams = {
  params: Promise<{ locale: string; page: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { locale: localeRaw, page: pageRaw } = await params;
  const locale = localeRaw as Locale;
  const page = pageRaw as OgPageKey;

  if (!(locales as readonly string[]).includes(locale) || !isOgPageKey(page)) {
    return new Response("Not found", { status: 404 });
  }

  const content = await getResolvedContent(locale);
  const meta = content.pageMeta[page];
  const preview = new URL(request.url).searchParams;
  const titleOverride = preview.get("title")?.trim();
  const descriptionOverride = preview.get("description")?.trim();
  const isPreview = Boolean(titleOverride || descriptionOverride);

  const props = await buildPageOgProps({
    pageKey: page,
    title: titleOverride || meta.title,
    description: descriptionOverride || meta.description,
    locale,
    siteUrl: resolveOgSiteHostname(content.site.url),
  });

  const image = await renderOgImageResponse(props);

  image.headers.set(
    "Cache-Control",
    isPreview
      ? "no-store"
      : "public, s-maxage=3600, stale-while-revalidate=86400",
  );

  return image;
}
