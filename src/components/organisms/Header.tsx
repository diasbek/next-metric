"use client";

import { useRef } from "react";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { PageContainer } from "@/components/atoms/PageContainer";
import { HeroLogoSvg } from "@/components/molecules/HeroLogoSvg";
import { MobileMenu, useMobileMenu } from "@/components/molecules/MobileMenu";
import { SiteLogoMark } from "@/components/molecules/SiteLogoMark";
import { SiteNav } from "@/components/molecules/SiteNav";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import { localePath } from "@/i18n/paths";

interface HeaderProps {
  locale: Locale;
  site: SiteContent["site"];
  ui: SiteContent["ui"];
  variant?: "hero" | "compact";
}

export function Header({ locale, site, ui, variant = "compact" }: HeaderProps) {
  const menu = useMobileMenu();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isHero = variant === "hero";
  const homePath = localePath(locale, "/");
  const mobileMenuId = "site-mobile-menu";

  return (
    <>
      <header
        data-site-header
        data-header-variant={isHero ? "hero" : "compact"}
        className={`site-header fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter] duration-300 ${
          isHero
            ? "bg-black [&.is-scrolled]:bg-black/80 [&.is-scrolled]:backdrop-blur-sm"
            : "bg-black/80 backdrop-blur-sm"
        }`}
      >
        <PageContainer className="site-header__inner">
          <div className="site-header__brand">
            {isHero ? (
              <div
                data-header-brand
                className="site-header__brand-hero"
              >
                <TransitionLink
                  href={homePath}
                  aria-label={site.name}
                  data-header-logo
                  className="site-header__logo-link site-header__logo-link--hero"
                >
                  <SiteLogoMark idPrefix="header-hero" />
                </TransitionLink>
                <p
                  data-hero-tagline
                  className="site-header__tagline whitespace-nowrap text-nav text-white"
                >
                  {ui.agencyTagline}
                </p>
              </div>
            ) : (
              <TransitionLink
                href={homePath}
                aria-label={site.name}
                className="site-header__logo-link"
                data-header-logo
              >
                <SiteLogoMark idPrefix="header-compact" />
              </TransitionLink>
            )}
          </div>

          <LanguageSwitcher
            locale={locale}
            ariaLabel={ui.langAria}
            variant="dropdown"
            className="site-header__lang site-header__lang--desktop"
          />

          <div className="site-header__tools">
            <SiteNav
              locale={locale}
              items={site.nav}
              variant="header"
              ariaLabel={ui.navAria}
              className="site-header__nav"
            />

            <div className="site-header__mobile">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={menu.toggle}
                aria-label={menu.isOpen ? ui.closeMenu : ui.openMenu}
                aria-expanded={menu.isOpen}
                aria-controls={mobileMenuId}
                className="site-header__menu-btn"
              >
                <span className="site-header__menu-line" />
                <span className="site-header__menu-line" />
              </button>
            </div>
          </div>
        </PageContainer>
      </header>
      <MobileMenu
        locale={locale}
        site={site}
        ui={ui}
        isOpen={menu.isOpen}
        onClose={menu.close}
        menuButtonRef={menuButtonRef}
        id={mobileMenuId}
      />
    </>
  );
}

export function HeroLogo() {
  return (
    <div className="hero-logo relative w-full" data-hero-logo>
      <div className="hero-logo__track relative w-full">
        <div className="hero-logo__frame" data-hero-logo-frame>
          <div className="hero-logo__spacer" aria-hidden />
          <div className="hero-logo__asset" data-hero-logo-asset role="img" aria-label="METRIC">
            {/* Progressive blur — desktop scrubs Figma cycle by cursor X; mobile autoplays. */}
            <div className="hero-logo__brush" data-hero-logo-brush aria-hidden>
              <HeroLogoSvg idPrefix="hero-brush-fx" showBlur />
            </div>

            <div data-hero-logo-blue>
              <HeroLogoSvg idPrefix="hero-blue" showBlur={false} />
            </div>

            <div data-hero-logo-white className="hero-logo__white" aria-hidden>
              <HeroLogoSvg color="#FAFAFA" idPrefix="hero-white" showBlur={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
