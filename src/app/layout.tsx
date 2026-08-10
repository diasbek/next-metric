import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { GsapProviderLazy } from "@/components/animations/GsapProviderLazy";
import { SiteAnalytics } from "@/components/analytics";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { JsonLd } from "@/components/seo/JsonLd";
import { rootMetadata } from "@/utils/metadata";
import { getGlobalJsonLdGraph } from "@/utils/seo/json-ld";
import { getResolvedAnalytics } from "@/lib/cms/settings";
import { SITE_CONFIG } from "@/utils/consts";

/** Always SSR so CMS edits are reflected on the next request after updateTag. */
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: SITE_CONFIG.themeColor,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-inter-tight",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const analytics = await getResolvedAnalytics();
  return {
    ...rootMetadata,
    other: {
      ...(typeof rootMetadata.other === "object" && rootMetadata.other
        ? rootMetadata.other
        : {}),
      "theme-color": "#2600ff",
      ...(analytics.googleSiteVerification
        ? { "google-site-verification": analytics.googleSiteVerification }
        : {}),
      ...(analytics.yandexWebmasterVerification
        ? { "yandex-verification": analytics.yandexWebmasterVerification }
        : {}),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={interTight.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var m=window.matchMedia("(prefers-reduced-motion: reduce)");if(!m.matches)document.documentElement.classList.add("gsap-pending");}catch(e){}})();',
          }}
        />
      </head>
      <body className="antialiased">
        <JsonLd data={getGlobalJsonLdGraph()} />
        <GsapProviderLazy>{children}</GsapProviderLazy>
        <SiteAnalytics />
        <PwaRegister />
      </body>
    </html>
  );
}
