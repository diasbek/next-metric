import Image from "next/image";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { PageContainer } from "@/components/atoms/PageContainer";
import { SiteNav } from "@/components/molecules/SiteNav";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";
import { getMetricHome } from "@/data/metric-home";
import { ContactForm } from "@/components/molecules/ContactForm";
import type { PublicCaptchaConfig } from "@/lib/cms/settings";

interface SiteFooterProps {
  locale: Locale;
  content: SiteContent;
  captcha: PublicCaptchaConfig;
}

/** Figma footer nav order (differs from header). */
const FOOTER_NAV_HREFS = [
  "/#services",
  "/#case-studies",
  "/#projects",
  "/#workflow",
  "/#faq",
] as const;

export function SiteFooter({ locale, content, captcha }: SiteFooterProps) {
  const { site, ui } = content;
  const home = getMetricHome(locale);
  const footer = home.footer;
  const socialMap = {
    instagram: site.social.instagram,
    linkedin: site.social.linkedin ?? "#",
    x: site.social.x ?? "#",
    facebook: site.social.facebook ?? "#",
  };

  const privacyLink = footer.links.find((link) => link.href.includes("privacy"));
  const utilityLinks = footer.links.filter((link) => !link.href.includes("privacy"));

  const navItems = FOOTER_NAV_HREFS.flatMap((href) => {
    const item = home.nav.find((entry) => entry.href === href);
    return item ? [{ label: item.label, path: item.href }] : [];
  });

  return (
    <footer id="contact" className="site-footer">
      <PageContainer>
        {/* TEMP: CTA contact form hidden — restore site-footer__form block when ready */}
        {false ? (
          <div className="site-footer__form" data-reveal>
            <div className="site-footer__form-copy">
              <h2 className="site-footer__form-title font-display">{footer.startCta}</h2>
              <p className="site-footer__form-subtitle">{ui.contactSubtitle}</p>
            </div>
            <ContactForm locale={locale} ui={ui} captcha={captcha} />
          </div>
        ) : null}

        <div className="site-footer__main" data-reveal>
          <TransitionLink
            href={localePath(locale, "/")}
            aria-label={site.name}
            className="site-footer__logo"
          >
            <Image
              src="/images/metric/logo/metric-logo.svg"
              alt={site.name}
              width={213}
              height={48}
              className="site-footer__logo-img"
            />
          </TransitionLink>

          <SiteNav
            locale={locale}
            items={navItems}
            variant="footer"
            ariaLabel={ui.navAria}
            className="site-footer__nav"
          />

          <div className="site-footer__contact">
            <div className="site-footer__contact-block">
              <p className="site-footer__contact-label">{ui.phoneLabel}</p>
              <a
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
                className="site-footer__contact-value"
              >
                {site.phone}
              </a>
            </div>
            <div className="site-footer__contact-block">
              <p className="site-footer__contact-label">{ui.addressLabel}</p>
              <p className="site-footer__contact-value site-footer__contact-value--address">
                {site.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom" data-reveal>
          <div className="site-footer__meta">
            {footer.social.map((item) => (
              <a
                key={item.label}
                href={socialMap[item.key]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            ))}
            {utilityLinks.map((link) => (
              <TransitionLink
                key={link.label}
                href={localePath(locale, link.href)}
                className={
                  link.href.includes("newsletter")
                    ? "site-footer__link--newsletter"
                    : undefined
                }
              >
                {link.label}
              </TransitionLink>
            ))}
          </div>

          <div className="site-footer__legal">
            <p className="site-footer__copy">© 2026 {site.name}</p>
            {privacyLink ? (
              <TransitionLink
                href={localePath(locale, privacyLink.href)}
                className="site-footer__privacy"
              >
                {privacyLink.label}
              </TransitionLink>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
