import { getResolvedContent } from "@/i18n/get-content";
import { ogEyebrows } from "@/utils/og/paths";
import { renderOgImageResponse } from "@/utils/og/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

/** Legacy default OG image → RU home. */
export async function GET() {
  const content = await getResolvedContent("ru");
  const meta = content.pageMeta.home;

  const image = await renderOgImageResponse({
    title: meta.title.replace(/ — METRIC$/i, ""),
    description: meta.description,
    eyebrow: ogEyebrows.ru.home,
    siteUrl: (() => {
      try {
        return new URL(content.site.url).hostname;
      } catch {
        return "metric.agency";
      }
    })(),
  });

  image.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );

  return image;
}
