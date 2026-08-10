import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { Header } from "@/components/organisms/Header";
import { SiteFooter } from "@/components/organisms/SiteFooter";

interface SiteLayoutProps {
  locale: Locale;
  children: React.ReactNode;
  headerVariant?: "hero" | "compact";
  showContact?: boolean;
  contactSubtitle?: string;
  scrollSections?: boolean;
}

export function SiteLayout({
  locale,
  children,
  headerVariant = "compact",
}: SiteLayoutProps) {
  const content = getContent(locale);

  return (
    <>
      <Header
        locale={locale}
        site={content.site}
        ui={content.ui}
        variant={headerVariant}
      />
      <div id="site-content">
        <main id="main-content" data-page-transition-root>
          {children}
        </main>
      </div>
      <SiteFooter locale={locale} content={content} />
    </>
  );
}
