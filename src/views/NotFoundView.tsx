import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { SiteLayout } from "@/components/templates";

interface NotFoundViewProps {
  locale?: Locale;
}

export function NotFoundView({ locale = "en" }: NotFoundViewProps) {
  const { ui } = getContent(locale);

  return (
    <SiteLayout locale={locale}>
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-28 text-center">
        <h1 className="font-display text-[clamp(64px,10vw,120px)] text-foreground">
          404
        </h1>
        <p className="mt-4 text-xl text-[color:var(--muted)]">{ui.notFoundTitle}</p>
        <TransitionLink
          href={localePath(locale, "/")}
          className="metric-cta metric-cta--solid mt-8"
        >
          {ui.backHome}
        </TransitionLink>
      </section>
    </SiteLayout>
  );
}
