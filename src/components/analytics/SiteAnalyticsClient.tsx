"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { GoogleTagManager } from "./GoogleTagManager";
import { YandexMetrika } from "./YandexMetrika";
import type { ResolvedAnalytics } from "@/lib/cms/settings";

type PublicAnalytics = Pick<
  ResolvedAnalytics,
  "yandexMetrikaId" | "googleAnalyticsId" | "googleTagManagerId"
>;

function AnalyticsTags({ ids }: { ids: PublicAnalytics }) {
  return (
    <>
      {ids.yandexMetrikaId ? (
        <YandexMetrika counterId={ids.yandexMetrikaId} />
      ) : null}
      {ids.googleTagManagerId ? (
        <GoogleTagManager containerId={ids.googleTagManagerId} />
      ) : null}
      {!ids.googleTagManagerId && ids.googleAnalyticsId ? (
        <GoogleAnalytics measurementId={ids.googleAnalyticsId} />
      ) : null}
    </>
  );
}

/** Loads counter IDs from `/api/analytics/` so a save in admin is picked up
 * even when the root layout HTML was cached at build time. */
export function SiteAnalyticsClient({ initial }: { initial: PublicAnalytics }) {
  const pathname = usePathname();
  const [ids, setIds] = useState<PublicAnalytics>(initial);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/analytics/", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: PublicAnalytics | null) => {
        if (cancelled || !payload) return;
        setIds({
          yandexMetrikaId: payload.yandexMetrikaId ?? "",
          googleAnalyticsId: payload.googleAnalyticsId ?? "",
          googleTagManagerId: payload.googleTagManagerId ?? "",
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return <AnalyticsTags ids={ids} />;
}
