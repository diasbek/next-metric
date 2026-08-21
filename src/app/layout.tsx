import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { degular, degularDisplay } from "@/assets/fonts";
import "./globals.css";
import { GsapProviderLazy } from "@/components/animations/GsapProviderLazy";
import { SiteAnalytics } from "@/components/analytics";
import { ConsentProvider, CookieConsentBanner } from "@/components/consent";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { JsonLd } from "@/components/seo/JsonLd";
import { getYandexMetrikaNoscriptUrl } from "@/lib/analytics/yandex-metrika-snippet";
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
  const metrikaPixel = getYandexMetrikaNoscriptUrl(analytics.yandexMetrikaId);
  const htmlLangHeader = (await headers()).get("x-html-lang");
  const lang = htmlLangHeader === "de" ? "de" : "en";

  return (
    <html
      lang={lang}
      className={`${degular.variable} ${degularDisplay.variable} gsap-pending`}
      suppressHydrationWarning
    >
      <head>
        {/* Before paint: drop pending for reduced-motion; fail-open if GSAP never boots. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var h=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){h.classList.remove('gsap-pending');return;}setTimeout(function(){if(h.classList.contains('gsap-ready')||h.classList.contains('gsap-force-show'))return;h.classList.add('gsap-force-show');h.classList.remove('gsap-pending');},1500);}catch(e){}})();",
          }}
        />
      </head>
      <body className="antialiased">
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                "html.gsap-pending [data-reveal],html.gsap-pending [data-reveal-group]>*,html.gsap-pending [data-case-steps]>*,html.gsap-pending .metric-hero__subtitle,html.gsap-pending .metric-hero__copy .metric-cta,html.gsap-pending .metric-hero__trust>*{visibility:visible!important;opacity:1!important;transform:none!important}",
            }}
          />
        </noscript>
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
