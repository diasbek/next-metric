import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { degular, degularDisplay } from "@/assets/fonts";
import "./globals.css";
import { GsapProviderLazy } from "@/components/animations/GsapProviderLazy";
import { SiteAnalytics } from "@/components/analytics";
import { ConsentProvider, CookieConsentBanner } from "@/components/consent";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getYandexMetrikaInitScript,
  getYandexMetrikaNoscriptUrl,
} from "@/lib/analytics/yandex-metrika-snippet";
import { getResolvedAnalytics } from "@/lib/cms/settings";
import { rootMetadata } from "@/utils/metadata";
import { getGlobalJsonLdGraph } from "@/utils/seo/json-ld";
import { SITE_CONFIG } from "@/utils/consts";

export const viewport: Viewport = {
  themeColor: SITE_CONFIG.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const analytics = await getResolvedAnalytics();
  return {
    ...rootMetadata,
    other: {
      ...(typeof rootMetadata.other === "object" && rootMetadata.other
        ? rootMetadata.other
        : {}),
      "theme-color": SITE_CONFIG.themeColor,
      ...(analytics.googleSiteVerification
        ? { "google-site-verification": analytics.googleSiteVerification }
        : {}),
      ...(analytics.yandexWebmasterVerification
        ? { "yandex-verification": analytics.yandexWebmasterVerification }
        : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analytics = await getResolvedAnalytics();
  const metrikaSnippet = getYandexMetrikaInitScript(analytics.yandexMetrikaId);
  const metrikaPixel = getYandexMetrikaNoscriptUrl(analytics.yandexMetrikaId);

  return (
    <html
      lang="en"
      className={`${degular.variable} ${degularDisplay.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {metrikaSnippet ? (
          <Script
            id="yandex-metrika"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: metrikaSnippet }}
          />
        ) : null}
        {metrikaPixel ? (
          <noscript>
            <div>
              <img
                src={metrikaPixel}
                style={{ position: "absolute", left: -9999 }}
                alt=""
              />
            </div>
          </noscript>
        ) : null}
        <JsonLd data={getGlobalJsonLdGraph()} />
        <ConsentProvider>
          <GsapProviderLazy>
            {children}
          </GsapProviderLazy>
          <SiteAnalytics />
          <CookieConsentBanner />
        </ConsentProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
