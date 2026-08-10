"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { PageContainer } from "@/components/atoms/PageContainer";
import { SiteNav } from "@/components/molecules/SiteNav";
import type { MetricHomeContent } from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import { localePath } from "@/i18n/paths";

interface HeaderProps {
  locale: Locale;
  site: SiteContent["site"];
  ui: SiteContent["ui"];
  variant?: "hero" | "compact";
  home: MetricHomeContent;
}

const HERO_SCROLL_SOLIDIFY_PX = 24;

export function Header({
  locale,
  site,
  ui,
  variant = "compact",
  home,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const homePath = localePath(locale, "/");
  const contactPath = localePath(locale, "/#contact");
  const isHero = variant === "hero";
  const navItems = home.nav.map((item) => ({
    label: item.label,
    path: item.href,
  }));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Hero starts transparent over the white hero; solidify on scroll so
  // dark nav doesn't disappear into pink/accent sections underneath.
  useEffect(() => {
    if (!isHero) return;
    const header = headerRef.current;
    if (!header) return;

    const syncScrolled = () => {
      header.classList.toggle(
        "is-scrolled",
        window.scrollY > HERO_SCROLL_SOLIDIFY_PX,
      );
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
          <TransitionLink
            href={homePath}
            aria-label={site.name}
            className="relative block h-10 w-[140px] shrink-0"
          >
            <Image
              src="/images/metric/logo/metric-logo.svg"
              alt={site.name}
              fill
              className="object-contain object-left"
              priority
            />
          </TransitionLink>

          <SiteNav
            locale={locale}
            items={navItems}
            variant="header"
            ariaLabel={ui.navAria}
            className="site-header__nav"
          />

          <div className="flex items-center gap-3">
            <Button
              href={contactPath}
              variant="outlineAccent"
              size="sm"
              className="site-header__cta"
            >
              {home.footer.startCta}
            </Button>
            <button
              type="button"
              className="site-header__menu-btn inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground/15 lg:hidden"
              aria-label={open ? ui.closeMenu : ui.openMenu}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{open ? ui.closeMenu : ui.openMenu}</span>
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 bg-foreground" />
                <span className="block h-0.5 w-5 bg-foreground" />
              </span>
            </button>
          </div>
        </PageContainer>
      </header>

      {open ? (
        <div className="mobile-menu-panel lg:hidden" role="dialog" aria-modal>
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold tracking-tight">{site.name}</span>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15"
              aria-label={ui.closeMenu}
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">{ui.closeMenu}</span>
              <span className="relative block size-5" aria-hidden>
                <span className="absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-foreground" />
                <span className="absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-foreground" />
              </span>
            </button>
          </div>
          <SiteNav
            locale={locale}
            items={navItems}
            variant="mobile"
            ariaLabel={ui.navAria}
            onNavigate={() => setOpen(false)}
          />
          <Button
            href={contactPath}
            variant="outlineAccent"
            size="sm"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            {home.footer.startCta}
          </Button>
        </div>
      ) : null}
    </>
  );
}

