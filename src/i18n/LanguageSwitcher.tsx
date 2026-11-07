"use client";

import { TransitionLink } from "@/components/atoms/TransitionLink";
import { useLocationHash } from "@/hooks/useLocationHash";
import { usePathname } from "next/navigation";
import { locales, localeLabels, type Locale } from "./config";
import { switchLocalePath } from "./paths";

interface LanguageSwitcherProps {
  locale: Locale;
  ariaLabel: string;
  /** @deprecated Kept for call-site compatibility; only proto `.lang` inline is used. */
  variant?: "dropdown" | "inline";
  className?: string;
}

/** Proto `.lang` EN/DE controls. Inactive locale is a real link for Next routing. */
export function LanguageSwitcher({
  locale,
  ariaLabel,
  className = "",
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const hash = useLocationHash();

  return (
    <div
      className={`lang ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
    >
      {locales.map((targetLocale) => {
        const isActive = targetLocale === locale;
        const href = switchLocalePath(pathname, targetLocale, hash);
        const label = localeLabels[targetLocale];

        if (isActive) {
          return (
            <button
              key={targetLocale}
              type="button"
              aria-pressed="true"
              aria-current="true"
            >
              {label}
            </button>
          );
        }

        return (
          <TransitionLink
            key={targetLocale}
            href={href}
            aria-pressed="false"
          >
            {label}
          </TransitionLink>
        );
      })}
    </div>
  );
}
