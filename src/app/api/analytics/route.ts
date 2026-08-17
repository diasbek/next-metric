import { NextResponse } from "next/server";
import { getLiveResolvedAnalytics } from "@/lib/cms/settings";

export const dynamic = "force-dynamic";

/** Public counter IDs only — no secrets. Bypasses the layout HTML cache
 * so Metrika starts working as soon as the ID is saved in admin. */
export async function GET() {
  const analytics = await getLiveResolvedAnalytics();
  return NextResponse.json(
    {
      yandexMetrikaId: analytics.yandexMetrikaId,
      googleAnalyticsId: analytics.googleAnalyticsId,
      googleTagManagerId: analytics.googleTagManagerId,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}
