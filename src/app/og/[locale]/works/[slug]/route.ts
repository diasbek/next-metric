import { locales, type Locale } from "@/i18n/config";
import { getProjectBySlug, getResolvedContent } from "@/i18n/get-content";
import { buildCaseOgProps, resolveOgSiteHostname } from "@/utils/og/build";
import {
  readStaticOgPng,
  renderOgImageResponse,
  staticOgPngResponse,
} from "@/utils/og/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

type RouteParams = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { locale: localeRaw, slug } = await params;
  const locale = localeRaw as Locale;

  if (!(locales as readonly string[]).includes(locale)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const [content, project] = await Promise.all([
      getResolvedContent(locale),
      getProjectBySlug(locale, slug),
    ]);

    if (!project) {
      return new Response("Not found", { status: 404 });
    }

    const props = await buildCaseOgProps({
      title: project.title,
      description: project.description,
      coverUrl: project.image,
      locale,
      siteUrl: resolveOgSiteHostname(content.site.url),
    });

    const image = await renderOgImageResponse(props);
    image.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    return image;
  } catch (err) {
    console.error("[og works]", err);
    const fallback =
      readStaticOgPng(locale, "works") ?? readStaticOgPng("en", "works");
    if (fallback) return staticOgPngResponse(fallback, "no-store");
    return new Response("OG unavailable", { status: 503 });
  }
}
