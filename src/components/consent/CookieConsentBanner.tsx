"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { useConsent } from "./ConsentContext";
import { stripLocalePrefix } from "@/i18n/paths";

const COPY = {
  en: {
    title: "We value your privacy",
    body: "We use cookies to run this site and to understand traffic. Your choice is saved in this browser.",
    privacyLinkLabel: "Privacy Policy",
    acceptAll: "Accept all",
    rejectAll: "Necessary only",
    close: "Close",
  },
  de: {
    title: "Ihre Privatsphäre ist uns wichtig",
    body: "Wir verwenden Cookies für den Betrieb der Website und für die Traffic-Analyse. Ihre Auswahl speichern wir in diesem Browser.",
    privacyLinkLabel: "Datenschutzerklärung",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Nur notwendige",
    close: "Schließen",
  },
} as const;

function usePrivacyHref() {
  const pathname = usePathname();
  const { locale } = stripLocalePrefix(pathname ?? "/");
  return locale === "de" ? "/de/privacy/" : "/privacy/";
}

export function CookieConsentBanner() {
  const { isPanelOpen, status, acceptAll, rejectAll, closePanel } = useConsent();
  const pathname = usePathname();
  const { locale } = stripLocalePrefix(pathname ?? "/");
  const copy = locale === "de" ? COPY.de : COPY.en;
  const privacyHref = usePrivacyHref();

  if (!isPanelOpen) return null;

  const alreadyDecided = status === "resolved";

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
    >
      <div className="cookie-consent__inner">
        <div className="cookie-consent__copy">
          <p id="cookie-consent-title" className="cookie-consent__title">
            {copy.title}
          </p>
          <p className="cookie-consent__body">
            {copy.body}{" "}
            <TransitionLink href={privacyHref} className="cookie-consent__link">
              {copy.privacyLinkLabel}
            </TransitionLink>
          </p>
        </div>
        <div className="cookie-consent__actions">
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--ghost"
            onClick={rejectAll}
          >
            {copy.rejectAll}
          </button>
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--primary"
            onClick={acceptAll}
          >
            {copy.acceptAll}
          </button>
          {alreadyDecided ? (
            <button
              type="button"
              className="cookie-consent__close"
              onClick={closePanel}
              aria-label={copy.close}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
