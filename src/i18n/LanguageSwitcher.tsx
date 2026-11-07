"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { useLocationHash } from "@/hooks/useLocationHash";
import { usePathname } from "next/navigation";
import { locales, localeLabels, type Locale } from "./config";
import { switchLocalePath } from "./paths";

type LanguageSwitcherVariant = "dropdown" | "inline";

interface LanguageSwitcherProps {
  locale: Locale;
  ariaLabel: string;
  variant?: LanguageSwitcherVariant;
  className?: string;
}

export function LanguageSwitcher({
  locale,
  ariaLabel,
  variant = "inline",
  className = "",
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const hash = useLocationHash();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (variant !== "dropdown" || !open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, variant]);

  if (variant === "inline") {
    // Proto markup: <div class="lang"><button aria-pressed>EN</button><button>DE</button>
    // Inactive locale is a real link so Next can switch routes.
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

  return (
    <div
      ref={rootRef}
      className={`language-switcher language-switcher--dropdown ${className} ${
        open ? "is-open" : ""
      }`.trim()}
    >
      <button
        type="button"
        className="language-switcher__trigger"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="language-switcher__current">{localeLabels[locale]}</span>
        <span className="language-switcher__chevron" aria-hidden>
          ▾
        </span>
      </button>

      <ul
        id={menuId}
        className="language-switcher__menu"
        role="listbox"
        aria-label={ariaLabel}
        hidden={!open}
      >
        {locales.map((targetLocale) => {
          const isActive = targetLocale === locale;
          const href = switchLocalePath(pathname, targetLocale, hash);

          return (
            <li
              key={targetLocale}
              className="language-switcher__option"
              role="option"
              aria-selected={isActive}
            >
              {isActive ? (
                <span
                  className="language-switcher__option-active"
                  aria-current="true"
                  aria-selected="true"
                >
                  {localeLabels[targetLocale]}
                </span>
              ) : (
                <TransitionLink
                  href={href}
                  className="language-switcher__option-link"
                  onClick={() => setOpen(false)}
                >
                  {localeLabels[targetLocale]}
                </TransitionLink>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
