import { locales, type Locale } from "@/i18n/config";
import { getResolvedContent } from "@/i18n/get-content";
import { buildPageOgProps, resolveOgSiteHostname } from "@/utils/og/build";
import {
  isOgPageKey,
  type OgPageKey,
} from "@/utils/og/paths";
import {
  readStaticOgPng,
  renderOgImageResponse,
  staticOgPngResponse,
} from "@/utils/og/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 86400;

type RouteParams = {
  params: Promise<{ locale: string; page: string }>;
};

/**
 * Prefer pre-built static PNGs (Telegram-safe on Hostinger).
 * Dynamic ImageResponse only for admin draft preview query params.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { locale: localeRaw, page: pageRaw } = await params;
  const locale = localeRaw as Locale;
  const page = pageRaw as OgPageKey;

  if (!(locales as readonly string[]).includes(locale) || !isOgPageKey(page)) {
    return new Response("Not found", { status: 404 });
  }

  const preview = new URL(request.url).searchParams;
  const titleOverride = preview.get("title")?.trim();
  const descriptionOverride = preview.get("description")?.trim();
  const isPreview = Boolean(titleOverride || descriptionOverride);

  if (!isPreview) {
    const staticPng =
      readStaticOgPng(locale, page) ?? readStaticOgPng("en", page);
    if (staticPng) return staticOgPngResponse(staticPng);
  }

  try {
    const content = await getResolvedContent(locale);
    const meta = content.pageMeta[page];
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
  } catch (err) {
    console.error("[og page]", err);
    const fallback =
      readStaticOgPng(locale, page) ??
      readStaticOgPng("en", "home") ??
      readStaticOgPng("en", "default" as OgPageKey);
    if (fallback) return staticOgPngResponse(fallback, "no-store");
    return new Response("OG unavailable", { status: 503 });
  }
}
