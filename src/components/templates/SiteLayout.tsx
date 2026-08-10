import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { Header } from "@/components/organisms/Header";
import { ContactSection } from "@/components/organisms/ContactSection";
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
  showContact = true,
  contactSubtitle,
  scrollSections = false,
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
      <div id="site-content" data-scroll-sections={scrollSections ? true : undefined}>
        <main id="main-content" data-page-transition-root>
          {children}
        </main>
        {showContact && (
          <ContactSection
            locale={locale}
            content={content}
            subtitle={contactSubtitle}
          />
        )}
      </div>
      <SiteFooter locale={locale} content={content} />
    </>
  );
}
