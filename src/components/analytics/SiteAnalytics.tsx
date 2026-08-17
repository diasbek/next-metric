import { SiteAnalyticsClient } from "./SiteAnalyticsClient";
import { getResolvedAnalytics } from "@/lib/cms/settings";

export async function SiteAnalytics() {
  const analytics = await getResolvedAnalytics();

  return (
    <SiteAnalyticsClient
      initial={{
        yandexMetrikaId: analytics.yandexMetrikaId,
        googleAnalyticsId: analytics.googleAnalyticsId,
        googleTagManagerId: analytics.googleTagManagerId,
      }}
    />
  );
}
