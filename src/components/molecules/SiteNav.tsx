"use client";

import { TransitionLink } from "@/components/atoms/TransitionLink";
import { usePathname } from "next/navigation";
import { useActiveSectionHash } from "@/hooks/useActiveSectionHash";
import { useLocationHash } from "@/hooks/useLocationHash";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteNavItem } from "@/i18n/types";
import { isNavPathActive } from "@/utils/nav";

type SiteNavVariant = "header" | "footer" | "mobile";

interface SiteNavProps {
  locale: Locale;
  items: SiteNavItem[];
  variant: SiteNavVariant;
  ariaLabel: string;
  onNavigate?: () => void;
  className?: string;
}

const variantClass: Record<SiteNavVariant, string> = {
  header: "site-nav site-nav--header",
  footer: "site-nav site-nav--footer",
  mobile: "site-nav site-nav--mobile",
};

export function SiteNav({
  locale,
  items,
  variant,
  ariaLabel,
  onNavigate,
  className = "",
}: SiteNavProps) {
  const pathname = usePathname();
  const hash = useLocationHash();
  const spyHash = useActiveSectionHash(items.map((item) => item.path));
  const effectiveHash = spyHash !== null ? spyHash : hash;
  const LinkComponent = TransitionLink;

  return (
    <nav
      className={`${variantClass[variant]} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const active = isNavPathActive(pathname, item.path, effectiveHash);

        return (
          <LinkComponent
            key={item.path}
            href={localePath(locale, item.path)}
            onClick={onNavigate}
            data-menu-link={variant === "mobile" ? true : undefined}
            className={`site-nav__link site-nav__link--${variant}${
              active ? " site-nav__link--active" : ""
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </LinkComponent>
        );
      })}
    </nav>
  );
}
