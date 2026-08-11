"use client";

import { useConsent } from "./ConsentContext";

export function CookiePreferencesButton({ label }: { label: string }) {
  const { openPreferences } = useConsent();
  return (
    <button
      type="button"
      className="metric-legal__cookie-btn"
      onClick={openPreferences}
    >
      {label}
    </button>
  );
}
