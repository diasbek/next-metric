"use client";

import { useEffect, useRef, useState } from "react";
import { ProtoBtn } from "@/components/proto/ProtoBtn";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { MetricProtoLogo } from "@/components/molecules/MetricProtoLogo";
import type { MetricHomeContent } from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import { localePath } from "@/i18n/paths";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { usePathname } from "next/navigation";
import { useActiveSectionHash } from "@/hooks/useActiveSectionHash";
import { useLocationHash } from "@/hooks/useLocationHash";
import { isNavPathActive } from "@/utils/nav";

interface HeaderProps {
  locale: Locale;
  site: SiteContent["site"];
  ui: SiteContent["ui"];
  variant?: "hero" | "compact";
  home: MetricHomeContent;
}

/** Map CMS nav hrefs onto the concept IA (projects listing + section anchors). */
function resolveNavHref(href: string): string {
  const h = href.trim();
  if (h === "/#projects" || h === "/#case-studies" || h === "/#cases") {
    if (h === "/#projects") return "/works/";
    return "/#cases";
  }
  return h;
}

export function Header({
  locale,
  site,
  ui,
  home,
  variant = "compact",
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [sol, setSol] = useState(false);
  const [hide, setHide] = useState(false);
  const [dkn, setDkn] = useState(variant === "hero");
  const headerRef = useRef<HTMLElement>(null);
  const navLastY = useRef(0);
  const homePath = localePath(locale, "/");
  const pathname = usePathname();
  const hash = useLocationHash();
  const cta = home.footer.startCta;

  const navItems = home.nav.map((item) => ({
    label: item.label,
    path: resolveNavHref(item.href),
  }));

  const spyHash = useActiveSectionHash(navItems.map((item) => item.path));
  const effectiveHash = spyHash !== null ? spyHash : hash;

  useEffect(() => {
    const inPreview = Boolean(headerRef.current?.closest(".admin-site-preview"));
    if (inPreview) {
      if (!open) return;
      const scroller = headerRef.current?.closest(".admin-site-preview__scroll");
      scroller?.scrollTo({ top: 0 });
      return;
    }

    document.documentElement.classList.toggle("menu-open", open);
    document.documentElement.classList.toggle("is-mobile-menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.classList.remove("menu-open");
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
      if (window.matchMedia("(min-width: 980px)").matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Proto scroll chrome: solid bar, hide-on-down, dark-over-night sections.
  useEffect(() => {
    const inPreview = Boolean(headerRef.current?.closest(".admin-site-preview"));
    if (inPreview) return;

    navLastY.current = window.scrollY || 0;

    const darkEls = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-dark], footer.ft, .ft.dk",
        ),
      );

    const sync = () => {
      const y = window.scrollY || 0;
      const last = navLastY.current;
      setSol(y > 30);
      if (!document.documentElement.classList.contains("menu-open")) {
        if (y > 480 && y > last + 4) setHide(true);
        else if (y < last - 4 || y < 480) setHide(false);
      }
      navLastY.current = y;

      let dark = false;
      for (const el of darkEls()) {
        const r = el.getBoundingClientRect();
        if (r.top <= 38 && r.bottom >= 38) {
          dark = true;
          break;
        }
      }
      setDkn(dark);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [pathname]);

  const navClass = [
    "nav",
    "wrap",
    sol ? "sol" : "",
    hide && !open ? "hide" : "",
    dkn || open ? "dkn" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header ref={headerRef} className={navClass} id="nav">
        <TransitionLink
          href={homePath}
          aria-label={site.name}
          className="logo"
        >
          <MetricProtoLogo />
        </TransitionLink>

        <nav aria-label={ui.navAria}>
          <ul className="nav-ul" id="nav-ul">
            {navItems.map((item) => {
              const active = isNavPathActive(pathname, item.path, effectiveHash);
              return (
                <li key={item.path}>
                  <TransitionLink
                    href={localePath(locale, item.path)}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="nav-r">
          <LanguageSwitcher
            locale={locale}
            ariaLabel={ui.langAria}
            variant="inline"
          />
          <ProtoBtn brief locale={locale} className="sm nav-cta">
            {cta}
          </ProtoBtn>
          <button
            className="burger"
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? ui.closeMenu : ui.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <i />
            <i />
          </button>
        </div>
      </header>

      <div
        className="menu wrap"
        id="menu"
        role="dialog"
        aria-modal={open}
        aria-label={ui.navAria}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="menu-l">
          {navItems.map((item, i) => (
            <TransitionLink
              key={item.path}
              href={localePath(locale, item.path)}
              onClick={() => setOpen(false)}
            >
              {item.label}
              <small>{String(i + 1).padStart(2, "0")}</small>
            </TransitionLink>
          ))}
        </div>
        <div className="menu-b">
          <LanguageSwitcher
            locale={locale}
            ariaLabel={ui.langAria}
            variant="inline"
          />
          <ProtoBtn
            brief
            locale={locale}
            className="sm wh"
            onClick={() => setOpen(false)}
          >
            {cta}
          </ProtoBtn>
        </div>
      </div>
    </>
  );
}
