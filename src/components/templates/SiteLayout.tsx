import type { Locale } from "@/i18n/config";
import { getResolvedContent } from "@/i18n/get-content";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";
import { getPublicCaptchaConfig } from "@/lib/cms/settings";
import { Header } from "@/components/organisms/Header";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { ProjectBriefProvider } from "@/components/molecules/ProjectBriefProvider";

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
  const [content, captcha, home] = await Promise.all([
    getResolvedContent(locale),
    getPublicCaptchaConfig(),
    getMetricHomeResolved(locale),
  ]);

  return (
    <ProjectBriefProvider
      locale={locale}
      ui={content.ui}
      captcha={captcha}
      brief={content.projectBrief}
    >
      <Header
        locale={locale}
        site={content.site}
        ui={content.ui}
        variant={headerVariant}
        home={home}
      />
      <div id="site-content">
        <main id="main-content">
          {children}
        </main>
      </div>
      <SiteFooter locale={locale} content={content} home={home} />
    </ProjectBriefProvider>
  );
}
