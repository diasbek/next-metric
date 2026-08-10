"use client";

import { useEffect } from "react";

/** Keep <html lang> in sync for prefixed locales (root layout stays shared). */
export function DocumentLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
