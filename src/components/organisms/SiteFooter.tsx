"use client";

import type { MouseEvent } from "react";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { ProtoBtn } from "@/components/proto/ProtoBtn";
import { MetricProtoLogo } from "@/components/molecules/MetricProtoLogo";
import { useOptionalProjectBrief } from "@/components/molecules/ProjectBriefProvider";
import type { MetricHomeContent } from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import { localeBriefHref, localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";

interface SiteFooterProps {
  locale: Locale;
  content: SiteContent;
  home: MetricHomeContent;
}

const HIDDEN_FOOTER_LINK_HREFS = new Set(["/newsletter/", "/careers/"]);

function isVisibleFooterLink(link: { label: string; href: string }) {
  const href = link.href.trim().toLowerCase();
  return !HIDDEN_FOOTER_LINK_HREFS.has(href);
}

/** Letter spans for Talk motion; words stay atomic so “talk” never orphans a letter. */
function talkLetters(text: string) {
  return text.split(/(\s+)/).map((chunk, i) => {
    if (!chunk) return null;
    if (/^\s+$/.test(chunk)) {
      return (
        <span key={`sp-${i}`} className="talk-sp" aria-hidden="true">
          &nbsp;
        </span>
      );
    }
    return (
      <span key={`w-${i}`} className="talk-w" aria-hidden="true">
        {Array.from(chunk).map((ch, j) => (
          <span key={`${ch}-${j}`} className="talk-ch">
            {ch}
          </span>
        ))}
      </span>
    );
  });
}

export function SiteFooter({ locale, content, home }: SiteFooterProps) {
  const { site, ui } = content;
  const footer = home.footer;
  const brief = useOptionalProjectBrief();
  const de = locale === "de";
  const talk = de ? "Sprechen wir" : "Let’s talk";
  const talkNote = de
    ? "Gerne stellen wir Ihnen weitere Projekte in einem persönlichen Gespräch vor."
    : "We’d be happy to present more projects in a personal call.";

  const openBrief = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!brief) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    brief.open();
  };

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
  // Prefer CMS order (proto: Upwork → LinkedIn → Instagram → Facebook).
  const socialOrder =
    footer.social.length > 0
      ? footer.social.map((item) => item.key)
      : (["upwork", "linkedin", "instagram", "facebook"] as const);
  const seen = new Set<string>();
  const socialLinks = socialOrder.flatMap((key) => {
    if (seen.has(key)) return [];
    seen.add(key);
    const href = socialMap[key];
    if (!href) return [];
    const fromCms = footer.social.find((item) => item.key === key);
    return [{ key, href, label: fromCms?.label ?? socialLabels[key] ?? key }];
  });

  const privacyLink = footer.links.find(
    (link) => link.href.includes("privacy") && isVisibleFooterLink(link),
  );

  const studioLinks = [
    { label: de ? "Projekte" : "Projects", href: "/works/" },
    { label: de ? "Leistungen" : "Services", href: "/#services" },
    { label: de ? "Ablauf" : "Workflow", href: "/#workflow" },
    { label: "FAQ", href: "/#faq" },
  ];

  const caseLinks = home.caseStudies.items.slice(0, 6).map((item) => ({
    label: item.title || item.author || item.slug,
    href: `/works/${item.slug}/`,
  }));

  const city = site.address?.[0] || (de ? "Berlin" : "Berlin");

  return (
    <footer className="ft dk" id="ft" data-dark>
      <div className="wrap">
        <div className="talk">
          <p className="cap">{talkNote}</p>
          <h2 className="talk-h" aria-label={talk}>
            {talkLetters(talk)}
          </h2>
          <div className="talk-r">
            <ProtoBtn brief locale={locale}>
              {footer.startCta}
            </ProtoBtn>
            {site.social.upwork ? (
              <a
                className="lnk"
                href={site.social.upwork}
                target="_blank"
                rel="noopener noreferrer"
              >
                {de ? "Auf Upwork beauftragen ↗" : "Hire us on Upwork ↗"}
              </a>
            ) : null}
          </div>
        </div>

        <div className="ft-g">
          <div>
            <TransitionLink
              href={localePath(locale, "/")}
              aria-label={site.name}
              className="logo"
              style={{ height: 28, display: "inline-block" }}
            >
              <MetricProtoLogo />
            </TransitionLink>
            <p>
              {de
                ? `Amazon-Listing-Bilder, A+ Content, Brand Stores und Werbe-Creatives. Offizieller Amazon-SPN-Partner mit Sitz in ${city}.`
                : `Amazon listing images, A+ Content, Brand Stores and advertising creatives. Official Amazon SPN partner, based in ${city}.`}
            </p>
          </div>

          <nav aria-label={ui.navAria}>
            <p className="cap">Studio</p>
            <div className="ft-l">
              {studioLinks.map((link) => (
                <TransitionLink
                  key={link.href}
                  href={localePath(locale, link.href)}
                >
                  {link.label}
                </TransitionLink>
              ))}
              <TransitionLink
                href={localeBriefHref(locale)}
                prefetch={false}
                onClickCapture={openBrief}
              >
                {footer.startCta}
              </TransitionLink>
            </div>
          </nav>

          <div>
            <p className="cap">Social</p>
            <div className="ft-l">
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
            </div>
          </div>

          <div>
            <p className="cap">{de ? "Fallstudien" : "Cases"}</p>
            <div className="ft-l">
              {caseLinks.map((link) => (
                <TransitionLink
                  key={link.href}
                  href={localePath(locale, link.href)}
                >
                  {link.label}
                </TransitionLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ft-b wrap">
        <span>
          © 2026 {site.name} · {city}
        </span>
        {privacyLink ? (
          <TransitionLink href={localePath(locale, privacyLink.href)}>
            {privacyLink.label}
          </TransitionLink>
        ) : (
          <span />
        )}
        <a href="https://metric.graphics" target="_blank" rel="noopener noreferrer">
          metric.graphics ↗
        </a>
      </div>
    </footer>
  );
}
