import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { degular, degularDisplay } from "@/assets/fonts";
import "./globals.css";
import { ContentVisibilityGuard } from "@/components/ContentVisibilityGuard";
import { NavigationScrollReset } from "@/components/NavigationScrollReset";
import { SiteAnalytics } from "@/components/analytics";
import { ConsentProvider, CookieConsentBanner } from "@/components/consent";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { JsonLd } from "@/components/seo/JsonLd";
import { getYandexMetrikaNoscriptUrl } from "@/lib/analytics/yandex-metrika-snippet";
import { getResolvedAnalytics } from "@/lib/cms/settings";
import { rootMetadata } from "@/utils/metadata";
import { getGlobalJsonLdGraph } from "@/utils/seo/json-ld";
import { SITE_CONFIG } from "@/utils/consts";
import {
  WEBVIEW_BOOT_CRITICAL_CSS,
  WEBVIEW_BOOT_SCRIPT,
} from "@/utils/webview";

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
  const metrikaPixel = getYandexMetrikaNoscriptUrl(analytics.yandexMetrikaId);
  const htmlLangHeader = (await headers()).get("x-html-lang");
  const lang = htmlLangHeader === "de" ? "de" : "en";

  return (
    <html
      lang={lang}
      className={`${degular.variable} ${degularDisplay.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style
          dangerouslySetInnerHTML={{ __html: WEBVIEW_BOOT_CRITICAL_CSS }}
        />
        <script dangerouslySetInnerHTML={{ __html: WEBVIEW_BOOT_SCRIPT }} />
      </head>
      <body className="antialiased">
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
          {children}
          <NavigationScrollReset />
          <ContentVisibilityGuard />
          <SiteAnalytics />
          <CookieConsentBanner />
        </ConsentProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
