import Image from "next/image";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { PageContainer } from "@/components/atoms/PageContainer";
import { SiteNavLinks } from "@/components/molecules/SiteNavLinks";
import type { MetricHomeContent } from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";

interface SiteFooterProps {
  locale: Locale;
  content: SiteContent;
  home: MetricHomeContent;
}

/** Footer utility links that should not render on the public site. */
const HIDDEN_FOOTER_LINK_HREFS = new Set(["/newsletter/", "/careers/"]);

function isVisibleFooterLink(link: { label: string; href: string }) {
  const href = link.href.trim().toLowerCase();
  return !HIDDEN_FOOTER_LINK_HREFS.has(href);
}
const FOOTER_NAV_HREFS = [
  "/#services",
  "/#case-studies",
  "/#projects",
  "/#workflow",
  "/#faq",
] as const;

export function SiteFooter({ locale, content, home }: SiteFooterProps) {
  const { site, ui } = content;
  const footer = home.footer;
  const socialMap: Record<string, string | undefined> = {
    upwork: site.social.upwork,
    facebook: site.social.facebook,
    instagram: site.social.instagram,
    linkedin: site.social.linkedin,
    x: site.social.x,
  };
  const socialLabels: Record<string, string> = {
    upwork: "Upwork",
    facebook: "Facebook",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    x: "X",
  };
  const socialLinks = (
    ["upwork", "facebook", "instagram", "linkedin", "x"] as const
  ).flatMap((key) => {
    const href = socialMap[key];
    if (!href) return [];
    const fromCms = footer.social.find((item) => item.key === key);
    return [{ key, href, label: fromCms?.label ?? socialLabels[key] }];
  });

  const privacyLink = footer.links.find(
    (link) => link.href.includes("privacy") && isVisibleFooterLink(link),
  );
  const utilityLinks = footer.links.filter(
    (link) => !link.href.includes("privacy") && isVisibleFooterLink(link),
  );

  const navItems = FOOTER_NAV_HREFS.flatMap((href) => {
    const item = home.nav.find((entry) => entry.href === href);
    return item ? [{ label: item.label, path: item.href }] : [];
  });

  return (
    <footer className="site-footer">
      <PageContainer>
        <div className="site-footer__main">
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

          <SiteNavLinks
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

        <div className="site-footer__bottom">
          <div className="site-footer__meta">
            {socialLinks.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            ))}
            {utilityLinks.map((link) => (
              <TransitionLink key={link.label} href={localePath(locale, link.href)}>
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
