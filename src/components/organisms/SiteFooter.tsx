import { TransitionLink } from "@/components/atoms/TransitionLink";
import { PageContainer } from "@/components/atoms/PageContainer";
import { SiteLogoMark } from "@/components/molecules/SiteLogoMark";
import { SiteNav } from "@/components/molecules/SiteNav";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";

interface SiteFooterProps {
  locale: Locale;
  content: SiteContent;
}

export function SiteFooter({ locale, content }: SiteFooterProps) {
  const { site, ui } = content;

  return (
    <footer className="site-footer bg-black" data-reveal>
      <PageContainer>
        <div className="site-footer__inner" data-reveal-group>
          <TransitionLink
            href={localePath(locale, "/")}
            aria-label={site.name}
            className="site-footer__logo"
          >
            <SiteLogoMark idPrefix="footer" />
          </TransitionLink>

          <SiteNav
            locale={locale}
            items={site.nav}
            variant="footer"
            ariaLabel={ui.navAria}
            className="site-footer__nav"
          />

          <div className="site-footer__social">
            <a
              href={site.social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__social-link"
              aria-label={`Telegram — ${site.name}`}
            >
              Telegram
            </a>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__social-link"
              aria-label={`Instagram — ${site.name}`}
            >
              Instagram
            </a>
          </div>

          <p className="site-footer__copyright">© 2026 {site.name}</p>
        </div>
      </PageContainer>
    </footer>
  );
}
