"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ProjectBriefCta } from "@/components/molecules/ProjectBriefCta";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { PageContainer } from "@/components/atoms/PageContainer";
import { SiteNav } from "@/components/molecules/SiteNav";
import type { MetricHomeContent } from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import { localePath, localeBriefHref } from "@/i18n/paths";

interface HeaderProps {
  locale: Locale;
  site: SiteContent["site"];
  ui: SiteContent["ui"];
  variant?: "hero" | "compact";
  home: MetricHomeContent;
}

const HERO_SCROLL_SOLIDIFY_PX = 24;

function MetricLogo({
  name,
  href,
  onClick,
  priority,
}: {
  name: string;
  href: string;
  onClick?: () => void;
  priority?: boolean;
}) {
  return (
    <TransitionLink
      href={href}
      aria-label={name}
      onClick={onClick}
      className="site-header__logo-link"
    >
      <Image
        src="/images/metric/logo/metric-logo.svg"
        alt={name}
        fill
        className="object-contain object-left"
        priority={priority}
      />
    </TransitionLink>
  );
}

export function Header({
  locale,
  site,
  ui,
  variant = "compact",
  home,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const homePath = localePath(locale, "/");
  const briefHref = localeBriefHref(locale);
  const isHero = variant === "hero";
  const cta = home.footer.startCta;
  const navItems = home.nav.map((item) => ({
    label: item.label,
    path: item.href,
  }));

  useEffect(() => {
    const inPreview = Boolean(headerRef.current?.closest(".admin-site-preview"));
    if (inPreview) {
      if (!open) return;
      const scroller = headerRef.current?.closest(".admin-site-preview__scroll");
      scroller?.scrollTo({ top: 0 });
      return;
    }

    document.documentElement.classList.toggle("is-mobile-menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.classList.remove("is-mobile-menu-open");
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
    };
  }, [open]);

  // Hero starts transparent over the white hero; solidify on scroll so
  // dark nav doesn't disappear into pink/accent sections underneath.
  useEffect(() => {
    if (!isHero) return;
    const header = headerRef.current;
    if (!header) return;

    let ticking = false;
    const syncScrolled = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        header.classList.toggle(
          "is-scrolled",
          window.scrollY > HERO_SCROLL_SOLIDIFY_PX,
        );
      });
    };

    syncScrolled();
    window.addEventListener("scroll", syncScrolled, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncScrolled);
      header.classList.remove("is-scrolled");
    };
  }, [isHero]);

  return (
    <>
      <header
        ref={headerRef}
        data-site-header
        data-header-variant={variant}
        className={
          isHero
            ? "site-header site-header--hero sticky top-0 z-50"
            : "site-header sticky top-0 z-50 bg-white/90 backdrop-blur-md"
        }
      >
        <PageContainer className="site-header__inner">
          <MetricLogo name={site.name} href={homePath} priority />

          <SiteNav
            locale={locale}
            items={navItems}
            variant="header"
            ariaLabel={ui.navAria}
            className="site-header__nav"
          />

          <div className="flex items-center gap-3">
            <ProjectBriefCta
              href={briefHref}
              variant="outlineAccent"
              size="sm"
              className="site-header__cta"
            >
              {cta}
            </ProjectBriefCta>
            <button
              type="button"
              className="site-header__menu-btn"
              aria-label={ui.openMenu}
              aria-expanded={open}
              aria-controls="site-mobile-menu"
              onClick={() => setOpen(true)}
            >
              <span className="sr-only">{ui.openMenu}</span>
              <span className="site-header__menu-icon" aria-hidden>
                <span />
                <span />
              </span>
            </button>
          </div>
        </PageContainer>
      </header>

      <div
        id="site-mobile-menu"
        className="mobile-menu-panel lg:hidden"
        role="dialog"
        aria-modal={open}
        aria-label={ui.navAria}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        data-open={open ? "true" : undefined}
      >
        <PageContainer className="mobile-menu-panel__bar">
          <MetricLogo
            name={site.name}
            href={homePath}
            onClick={() => setOpen(false)}
          />
          <button
            ref={closeButtonRef}
            type="button"
            className="mobile-menu-panel__close"
            aria-label={ui.closeMenu}
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">{ui.closeMenu}</span>
            <span className="mobile-menu-panel__close-icon" aria-hidden>
              <span />
              <span />
            </span>
          </button>
        </PageContainer>

        <PageContainer className="mobile-menu-panel__body">
          <SiteNav
            locale={locale}
            items={navItems}
            variant="mobile"
            ariaLabel={ui.navAria}
            onNavigate={() => setOpen(false)}
          />
          <ProjectBriefCta
            href={briefHref}
            variant="outlineAccent"
            size="sm"
            className="mobile-menu-panel__cta"
            onClick={() => setOpen(false)}
          >
            {cta}
          </ProjectBriefCta>
        </PageContainer>
      </div>
    </>
  );
}
