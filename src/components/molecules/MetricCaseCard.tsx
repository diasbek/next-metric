import { Button } from "@/components/atoms/Button";
import { MediaImage } from "@/components/atoms/MediaImage";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { MetricTagPill } from "@/components/molecules/MetricTagPill";
import type { Locale } from "@/i18n/config";

export type MetricCaseCardProps = {
  locale: Locale;
  href: string;
  tags: readonly string[];
  quote: string;
  author: string;
  role: string;
  image: string;
  imageAlt?: string;
  viewLabel: string;
};

export function MetricCaseCard({
  locale,
  href,
  tags,
  quote,
  author,
  role,
  image,
  imageAlt,
  viewLabel,
}: MetricCaseCardProps) {
  return (
    <article className="metric-case-card">
      <div className="metric-case-card__body">
        <div className="metric-case-card__tags">
          {tags.map((tag) => (
            <MetricTagPill
              key={tag}
              tag={tag}
              locale={locale}
              className="border-foreground text-foreground"
            />
          ))}
        </div>
        <div className="metric-case-card__copy">
          <h3 className="metric-case-card__quote font-display">{quote}</h3>
          <p className="metric-case-card__author">{author}</p>
          <p className="metric-case-card__role">{role}</p>
        </div>
        <Button href={href} variant="dark" className="metric-case-card__cta">
          {viewLabel}
        </Button>
      </div>
      <div className="metric-case-card__media">
        <MediaImage
          src={image}
          alt={imageAlt || author}
          fill
          className="object-cover"
          sizes="(max-width: 1023px) 92vw, (max-width: 1799px) 42vw, 1200px"
          quality={90}
        />
      </div>
      <TransitionLink
        href={href}
        className="metric-case-card__cover"
        aria-label={viewLabel}
        prefetch
      />
    </article>
  );
}
