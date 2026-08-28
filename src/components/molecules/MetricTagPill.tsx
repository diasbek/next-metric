import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { Locale } from "@/i18n/config";
import { worksTagHref } from "@/utils/works-filters";

type MetricTagPillProps = {
  /** Stable filter slug used in ?category= / ?type= */
  tag: string;
  /** Locale display label; defaults to slug */
  label?: string;
  locale: Locale;
  className?: string;
};

export function MetricTagPill({
  tag,
  label,
  locale,
  className = "",
}: MetricTagPillProps) {
  return (
    <TransitionLink
      href={worksTagHref(locale, tag)}
      className={`metric-pill metric-pill--link ${className}`.trim()}
    >
      {label?.trim() || tag}
    </TransitionLink>
  );
}
