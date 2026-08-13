import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { TransitionLink } from "@/components/atoms/TransitionLink";

export type MetricCaseCardProps = {
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
    <article className="metric-case-card" data-reveal>
      <div className="metric-case-card__body">
        <div className="metric-case-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="metric-pill border-foreground text-foreground">
              {tag}
            </span>
          ))}
        </div>
        <div>
          <h3 className="metric-case-card__quote font-display">{quote}</h3>
          <p className="metric-case-card__author">{author}</p>
          <p className="metric-case-card__role">{role}</p>
        </div>
        <Button href={href} variant="dark" className="w-fit">
          {viewLabel}
        </Button>
      </div>
      <TransitionLink href={href} className="metric-case-card__media" aria-label={viewLabel}>
        <Image
          src={image}
          alt={imageAlt || author}
          fill
          className="object-cover"
          sizes="(max-width: 1023px) 92vw, 42vw"
          quality={85}
        />
      </TransitionLink>
    </article>
  );
}
