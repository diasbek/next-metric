import { locales, type Locale } from "@/i18n/config";
import { getProjectBySlug, getResolvedContent } from "@/i18n/get-content";
import { ogEyebrows } from "@/utils/og/paths";
import { getImageDataUrl, renderOgImageResponse } from "@/utils/og/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

type RouteParams = {
  params: Promise<{ locale: string; slug: string }>;
};

function siteHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "metric.agency";
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { locale: localeRaw, slug } = await params;
  const locale = localeRaw as Locale;

  if (!(locales as readonly string[]).includes(locale)) {
    return new Response("Not found", { status: 404 });
  }

  const [content, project] = await Promise.all([
    getResolvedContent(locale),
    getProjectBySlug(locale, slug),
  ]);

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const image = await renderOgImageResponse({
    title: project.title,
    description: project.description,
    eyebrow: ogEyebrows[locale].works,
    imageDataUrl: await getImageDataUrl(project.image),
    siteUrl: siteHostname(content.site.url),
  });

  image.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );

  return image;
}
