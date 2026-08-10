import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";
import { getPublicCaptchaConfig } from "@/lib/cms/settings";
import { Header } from "@/components/organisms/Header";
import { SiteFooter } from "@/components/organisms/SiteFooter";

interface SiteLayoutProps {
  locale: Locale;
  children: React.ReactNode;
  headerVariant?: "hero" | "compact";
}

export async function SiteLayout({
  locale,
  children,
  headerVariant = "compact",
}: SiteLayoutProps) {
  const content = getContent(locale);
  const [captcha, home] = await Promise.all([
    getPublicCaptchaConfig(),
    getMetricHomeResolved(locale),
  ]);

  return (
    <>
      <Header
        locale={locale}
        site={content.site}
        ui={content.ui}
        variant={headerVariant}
        home={home}
      />
      <div id="site-content">
        <main id="main-content" data-page-transition-root>
          {children}
        </main>
      </div>
      <SiteFooter
        locale={locale}
        content={content}
        captcha={captcha}
        home={home}
      />
    </>
  );
}
