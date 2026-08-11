"use client";

import { useConsent } from "@/components/consent";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { GoogleTagManager } from "./GoogleTagManager";
import { YandexMetrika } from "./YandexMetrika";
import type { ResolvedAnalytics } from "@/lib/cms/settings";

/**
 * Client-side consent gate: analytics scripts only ever mount once the
 * visitor has opted in via the cookie banner. Strictly necessary scripts
 * (none today) would bypass this and render directly from SiteAnalytics.
 */
export function ConsentGatedAnalytics({
  analytics,
}: {
  analytics: ResolvedAnalytics;
}) {
  const { analyticsConsent } = useConsent();

  if (!analyticsConsent) return null;

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
