"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { dispatchMenuClose, dispatchMenuOpen } from "@/animations/menu";
import { SiteLogoMark } from "@/components/molecules/SiteLogoMark";
import { SiteNav } from "@/components/molecules/SiteNav";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MobileMenuProps {
  locale: Locale;
  site: SiteContent["site"];
  ui: SiteContent["ui"];
  isOpen: boolean;
  onClose: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  id?: string;
}

export function MobileMenu({
  locale,
  site,
  ui,
  isOpen,
  onClose,
  menuButtonRef,
  id = "site-mobile-menu",
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(isOpen);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-mobile-menu-open", isOpen);
    return () => {
      document.documentElement.removeAttribute("data-mobile-menu-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;

    const panel = panelRef.current;
    if (!panel) return;

    if (isOpen) {
      dispatchMenuOpen(panel);
      return;
    }

    const handleClosed = () => setMounted(false);
    window.addEventListener("metric:menu-closed", handleClosed, { once: true });
    dispatchMenuClose(panel);

    return () => {
      window.removeEventListener("metric:menu-closed", handleClosed);
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (isOpen) {
      // Keep the panel mounted through the close animation.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- exit animation requires mounted state after isOpen becomes false
      setMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    const panel = panelRef.current;
    const siteContent = document.getElementById("site-content");
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    siteContent?.setAttribute("aria-hidden", "true");
    siteContent?.setAttribute("inert", "");

    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    const focusFirst = () => {
      const items = focusables();
      (closeButtonRef.current ?? items[0])?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const items = focusables();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(focusFirst);
    });
    document.addEventListener("keydown", handleKeyDown);

    const menuButton = menuButtonRef.current;

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      siteContent?.removeAttribute("aria-hidden");
      siteContent?.removeAttribute("inert");
      menuButton?.focus();
    };
  }, [isOpen, mounted, menuButtonRef, onClose]);

  if (!mounted) return null;

  return (
    <div
      ref={panelRef}
      id={id}
      data-mobile-menu
      role="dialog"
      aria-modal="true"
      aria-label={ui.navAria}
      aria-hidden={!isOpen}
      className="mobile-menu fixed inset-0 z-[100] bg-black lg:hidden"
    >
      <div className="mobile-menu__head">
        <TransitionLink
          href={localePath(locale, "/")}
          onClick={onClose}
          aria-label={site.name}
          className="site-header__logo-link mobile-menu__logo"
        >
          <SiteLogoMark idPrefix="mobile-menu" />
        </TransitionLink>
        <div className="mobile-menu__head-actions">
          <LanguageSwitcher locale={locale} ariaLabel={ui.langAria} variant="dropdown" />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={ui.closeMenu}
            className="mobile-menu__close"
          >
            ×
          </button>
        </div>
      </div>

      <SiteNav
        locale={locale}
        items={site.nav}
        variant="mobile"
        ariaLabel={ui.navAria}
        onNavigate={onClose}
        className="mobile-menu__nav"
      />

      <div className="mobile-menu__contacts">
        <div>
          <p className="mobile-menu__label">{ui.phoneLabel}</p>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mobile-menu__value">
            {site.phone}
          </a>
        </div>
        <div>
          <p className="mobile-menu__label">{ui.addressLabel}</p>
          <address className="mobile-menu__value not-italic">
            {site.address.join(" ")}
          </address>
        </div>
      </div>
    </div>
  );
}

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  };
}
