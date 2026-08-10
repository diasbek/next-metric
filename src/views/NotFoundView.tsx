import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SiteLayout } from "@/components/templates";

interface NotFoundViewProps {
  locale?: Locale;
}

export function NotFoundView({ locale = "ru" }: NotFoundViewProps) {
  const { ui } = getContent(locale);

  return (
    <SiteLayout locale={locale} showContact={false}>
      <section
        className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-28 text-center text-white"
        data-scroll-section
      >
        <h1 className="text-6xl font-medium" data-split-title>
          404
        </h1>
        <p className="mt-4 text-xl text-white/70" data-reveal>
          {ui.notFoundTitle}
        </p>
        <TransitionLink
          href={localePath(locale, "/")}
          className="mt-8 border border-white px-8 py-4 text-lg"
          data-reveal
          data-reveal-delay="0.15"
        >
          {ui.backHome}
        </TransitionLink>
      </section>
    </SiteLayout>
  );
}
