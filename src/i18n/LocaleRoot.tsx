import type { Locale } from "@/i18n/config";
import { htmlLang } from "@/i18n/config";

interface LocaleRootProps {
  locale: Locale;
  children: React.ReactNode;
}

export function LocaleRoot({ locale, children }: LocaleRootProps) {
  return (
    <div lang={htmlLang[locale]} className="contents">
      {children}
    </div>
  );
}
