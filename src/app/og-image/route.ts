import { readStaticOgPng, staticOgPngResponse } from "@/utils/og/render";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 86400;

/** Legacy default OG image → static EN home card. */
export async function GET() {
  const png = readStaticOgPng("en", "home");
  if (!png) {
    return new Response("OG unavailable", { status: 503 });
  }
  return staticOgPngResponse(png);
}
