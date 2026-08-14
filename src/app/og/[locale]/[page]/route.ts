import { locales, type Locale } from "@/i18n/config";
import { getResolvedContent } from "@/i18n/get-content";
import {
  isOgPageKey,
  ogEyebrows,
  type OgPageKey,
} from "@/utils/og/paths";
import { renderOgImageResponse } from "@/utils/og/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

type RouteParams = {
  params: Promise<{ locale: string; page: string }>;
};

function siteHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "metric.graphics";
  }
}

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

  const image = await renderOgImageResponse({
    title: (titleOverride || meta.title).replace(/ — METRIC$/i, ""),
    description: descriptionOverride || meta.description,
    eyebrow: ogEyebrows[locale][page],
    siteUrl: siteHostname(content.site.url),
  });

  image.headers.set(
    "Cache-Control",
    isPreview
      ? "no-store"
      : "public, s-maxage=3600, stale-while-revalidate=86400",
  );

  return image;
}
