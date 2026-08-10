import Image from "next/image";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { PageContainer } from "@/components/atoms/PageContainer";
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

export function SiteFooter({ locale, content, captcha }: SiteFooterProps) {
  const { site, ui } = content;
  const footer = getMetricHome(locale).footer;
  const socialMap = {
    instagram: site.social.instagram,
    linkedin: site.social.linkedin ?? "#",
    x: site.social.x ?? "#",
    facebook: site.social.facebook ?? "#",
  };

  return (
    <footer id="contact" className="site-footer" data-reveal>
      <PageContainer>
        <div className="site-footer__grid">
          <div className="space-y-8">
            <TransitionLink
              href={localePath(locale, "/")}
              aria-label={site.name}
              className="relative block h-12 w-[213px]"
            >
              <Image
                src="/images/metric/logo/metric-logo.svg"
                alt={site.name}
                fill
                className="object-contain object-left"
              />
            </TransitionLink>
            <div className="site-footer__cities">
              {footer.cities.map((city) => (
                <span key={city}>{city}</span>
              ))}
            </div>
          </div>

          <div className="site-footer__contact">
            <div>
              <p className="site-footer__contact-label">{ui.phoneLabel}</p>
              <a
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
                className="text-[22px] font-medium tracking-tight"
              >
                {site.phone}
              </a>
            </div>
            <div>
              <p className="site-footer__contact-label">{ui.addressLabel}</p>
              <p className="text-[18px] tracking-tight">{site.address.join(", ")}</p>
            </div>
          </div>

          <div className="site-footer__links">
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
          </div>
        </div>

        <div className="site-footer__form">
          <div className="mb-6 max-w-xl">
            <h2 className="font-display text-[clamp(28px,4vw,48px)] text-foreground">
              {footer.startCta}
            </h2>
            <p className="mt-3 text-[18px] text-[color:var(--muted)]">
              {ui.contactSubtitle}
            </p>
          </div>
          <ContactForm locale={locale} ui={ui} captcha={captcha} />
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 {site.name}</p>
          <div className="site-footer__bottom-links">
            {footer.links.map((link) => (
              <TransitionLink key={link.label} href={localePath(locale, link.href)}>
                {link.label}
              </TransitionLink>
            ))}
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
