import type { Locale } from "@/i18n/config";
import { htmlLang } from "@/i18n/config";
import { DocumentLang } from "@/i18n/DocumentLang";

interface LocaleRootProps {
  locale: Locale;
  children: React.ReactNode;
}

export function LocaleRoot({ locale, children }: LocaleRootProps) {
  const lang = htmlLang[locale];
  return (
    <div lang={lang} className="contents">
      {/* Set <html lang> before paint so crawlers that run minimal JS see DE. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(lang)};`,
        }}
      />
      <DocumentLang lang={lang} />
      {children}
    </div>
  );
}
