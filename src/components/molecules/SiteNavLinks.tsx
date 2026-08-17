import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteNavItem } from "@/i18n/types";

type SiteNavVariant = "header" | "footer" | "mobile";

interface SiteNavLinksProps {
  locale: Locale;
  items: SiteNavItem[];
  variant: SiteNavVariant;
  ariaLabel: string;
  className?: string;
}

const variantClass: Record<SiteNavVariant, string> = {
  header: "site-nav site-nav--header",
  footer: "site-nav site-nav--footer",
  mobile: "site-nav site-nav--mobile",
};

/** Static nav for SSR. Header keeps `SiteNav` for active-section highlighting. */
export function SiteNavLinks({
  locale,
  items,
  variant,
  ariaLabel,
  className = "",
}: SiteNavLinksProps) {
  return (
    <nav
      className={`${variantClass[variant]} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <TransitionLink
          key={item.path}
          href={localePath(locale, item.path)}
          className={`site-nav__link site-nav__link--${variant}`}
        >
          {item.label}
        </TransitionLink>
      ))}
    </nav>
  );
}
