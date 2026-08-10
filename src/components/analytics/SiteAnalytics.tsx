import { GoogleAnalytics } from "./GoogleAnalytics";
import { GoogleTagManager } from "./GoogleTagManager";
import { YandexMetrika } from "./YandexMetrika";
import { getResolvedAnalytics } from "@/lib/cms/settings";

export async function SiteAnalytics() {
  const analytics = await getResolvedAnalytics();

  return (
    <>
      {analytics.yandexMetrikaId ? (
        <YandexMetrika counterId={analytics.yandexMetrikaId} />
      ) : null}
      {analytics.googleTagManagerId ? (
        <GoogleTagManager containerId={analytics.googleTagManagerId} />
      ) : null}
      {!analytics.googleTagManagerId && analytics.googleAnalyticsId ? (
        <GoogleAnalytics measurementId={analytics.googleAnalyticsId} />
      ) : null}
    </>
  );
}
