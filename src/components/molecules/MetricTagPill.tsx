import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { Locale } from "@/i18n/config";
import { worksTagHref } from "@/utils/works-filters";

type MetricTagPillProps = {
  tag: string;
  locale: Locale;
  className?: string;
};

export function MetricTagPill({ tag, locale, className = "" }: MetricTagPillProps) {
  return (
    <TransitionLink
      href={worksTagHref(locale, tag)}
      className={`metric-pill metric-pill--link ${className}`.trim()}
    >
      {tag}
    </TransitionLink>
  );
}
