import { Button } from "@/components/atoms/Button";
import { MediaImage } from "@/components/atoms/MediaImage";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { MetricTagPill } from "@/components/molecules/MetricTagPill";
import type { Locale } from "@/i18n/config";

export type MetricCaseCardProps = {
  locale: Locale;
  href: string;
  tags: readonly string[] | readonly { slug: string; label: string }[];
  /** Case / project name. */
  title: string;
  /** Short listing blurb from the case (`description` in CMS). */
  description?: string;
  image: string;
  imageAlt?: string;
  viewLabel: string;
};

function normalizeTags(
  tags: MetricCaseCardProps["tags"],
): Array<{ slug: string; label: string }> {
  return tags.map((tag) =>
    typeof tag === "string" ? { slug: tag, label: tag } : tag,
  );
}

export function MetricCaseCard({
  locale,
  href,
  tags,
  title,
  description,
  image,
  imageAlt,
  viewLabel,
}: MetricCaseCardProps) {
  const resolvedTags = normalizeTags(tags);
  const name = title.trim();
  const blurb = description?.trim() ?? "";
  return (
    <article className="metric-case-card">
      <div className="metric-case-card__body">
        <div className="metric-case-card__tags">
          {resolvedTags.map((tag) => (
            <MetricTagPill
              key={tag.slug}
              tag={tag.slug}
              label={tag.label}
              locale={locale}
              className="border-foreground text-foreground"
            />
          ))}
        </div>
        <div className="metric-case-card__copy">
          {name ? (
            <h3 className="metric-case-card__title font-display">{name}</h3>
          ) : null}
          {blurb ? (
            <p className="metric-case-card__description">{blurb}</p>
          ) : null}
        </div>
        <Button href={href} variant="dark" className="metric-case-card__cta">
          {viewLabel}
        </Button>
      </div>
      <div className="metric-case-card__media">
        <MediaImage
          src={image}
          alt={imageAlt || name}
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
