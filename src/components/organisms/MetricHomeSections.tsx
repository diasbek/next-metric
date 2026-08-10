import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { CategoriesMarquee } from "@/components/molecules/CategoriesMarquee";
import { getMetricHome } from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";

function MetricTrustCards({ locale }: { locale: Locale }) {
  const { trust } = getMetricHome(locale);
  return (
    <div className="metric-hero__trust">
      {trust.map((item, index) => (
        <div
          key={`${item.kind}-${"value" in item ? item.value : "label" in item ? item.label : index}`}
          className={`metric-hero__trust-card metric-hero__trust-card--${item.kind}`}
        >
          {item.kind === "spn" ? (
            <>
              <p className="metric-hero__trust-kicker">{item.label}</p>
              <div className="metric-hero__trust-spn">
                <Image
                  src={item.icon}
                  alt="Amazon SPN"
                  width={160}
                  height={48}
                  className="h-12 w-auto object-contain object-left"
                />
              </div>
              <p className="metric-hero__trust-copy">{item.text}</p>
            </>
          ) : null}

          {item.kind === "reviews" ? (
            <>
              <div className="metric-hero__trust-icon">
                <Image
                  src={item.icon}
                  alt=""
                  width={56}
                  height={48}
                  className="object-contain"
                />
              </div>
              <p className="metric-hero__trust-copy metric-hero__trust-copy--bottom">
                {item.label}
              </p>
            </>
          ) : null}

          {item.kind === "rating" ? (
            <>
              <p className="metric-hero__trust-value">
                {item.value}
                <Image
                  src="/images/metric/icons/star.svg"
                  alt=""
                  width={41}
                  height={39}
                  className="metric-hero__trust-star"
                />
              </p>
              <p className="metric-hero__trust-copy metric-hero__trust-copy--bottom">
                {item.labelLine1}
                <br />
                {item.labelLine2}
              </p>
            </>
          ) : null}

          {item.kind === "stat" ? (
            <>
              <p className="metric-hero__trust-value">{item.value}</p>
              <p className="metric-hero__trust-copy metric-hero__trust-copy--bottom">
                {item.labelLine1}
                <br />
                {item.labelLine2}
              </p>
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}

const HERO_BLOBS = [
  "metric-hero-blob metric-hero-blob--a",
  "metric-hero-blob metric-hero-blob--b",
  "metric-hero-blob metric-hero-blob--c",
] as const;

export function MetricHeroSection({ locale }: { locale: Locale }) {
  const { hero } = getMetricHome(locale);

  return (
    <section
      className="metric-hero"
      aria-label="Hero"
      data-blobs-section
    >
      <div className="metric-hero__blobs" aria-hidden>
        {HERO_BLOBS.map((className) => (
          <div key={className} data-blob className={className} />
        ))}
      </div>

      <PageContainer className="metric-hero__shell">
        <div className="metric-hero__main">
          <div className="metric-hero__copy">
            <h1 className="metric-hero__title">
              <span className="block">{hero.titleLine1}</span>
              <span className="block">{hero.titleLine2}</span>
            </h1>
            <p className="metric-hero__subtitle">{hero.subtitle}</p>
            <Button href={localePath(locale, "/#contact")} variant="primary" size="lg">
              {hero.cta}
            </Button>
          </div>

          <div className="metric-hero__visual" aria-hidden>
            <div className="metric-hero__card metric-hero__card--left">
              <Image
                src={hero.product1}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 46vw, 284px"
                className="object-cover"
              />
            </div>
            <div className="metric-hero__card metric-hero__card--right">
              <Image
                src={hero.product2}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 52vw, 318px"
                className="object-cover"
              />
            </div>

            <div className="metric-hero__badge">
              <p className="metric-hero__badge-value">{hero.badgeValue}</p>
              <p className="metric-hero__badge-label">{hero.badgeLabel}</p>
            </div>

            <div className="metric-hero__redesign">
              <div className="metric-hero__redesign-tag">
                <span>{hero.redesignLabel}</span>
              </div>
              <div className="metric-hero__redesign-card">
                <p className="metric-hero__redesign-value">{hero.redesignValue}</p>
                <p className="metric-hero__redesign-delta">{hero.redesignDelta}</p>
                <p className="metric-hero__redesign-caption">{hero.redesignCaption}</p>
              </div>
            </div>
          </div>
        </div>

        <MetricTrustCards locale={locale} />
      </PageContainer>
    </section>
  );
}

export function MetricCategoriesSection({ locale = "en" }: { locale?: Locale }) {
  const { categories } = getMetricHome(locale);
  return (
    <section id="projects" className="metric-gradient-pink metric-section metric-categories">
      <PageContainer>
        <h2
          className="metric-categories__title font-display text-white"
          data-reveal
        >
          {categories.titleLines.map((line, index) => {
            if (typeof line === "string") {
              return (
                <span key={index} className="metric-categories__title-line">
                  {line}
                </span>
              );
            }

            return (
              <span
                key={index}
                className={
                  line.icon
                    ? "metric-categories__title-line metric-categories__title-line--with-icon"
                    : "metric-categories__title-line"
                }
              >
                {line.prefix}
                <span className="metric-categories__accent text-accent">
                  {line.accent}
                  {line.icon ? (
                    <Image
                      src="/images/metric/icons/arrow.svg"
                      alt=""
                      width={56}
                      height={48}
                      className="metric-categories__laurel"
                      aria-hidden
                    />
                  ) : null}
                </span>
                {line.suffix}
              </span>
            );
          })}
        </h2>
      </PageContainer>

      <CategoriesMarquee images={categories.images} />
    </section>
  );
}

export function MetricCaseStudiesSection({ locale }: { locale: Locale }) {
  const { caseStudies } = getMetricHome(locale);
  const titleParts = caseStudies.title.split(caseStudies.titleAccent);

  return (
    <section id="case-studies" className="metric-section metric-case-studies">
      <PageContainer>
        <div className="metric-case-studies__header" data-reveal>
          <h2 className="metric-case-studies__title font-display">
            {titleParts[0]}
            <span className="text-accent">{caseStudies.titleAccent}</span>
            {titleParts[1] ?? ""}
          </h2>
          <p className="metric-case-studies__subtitle">{caseStudies.subtitle}</p>
        </div>

        <div className="metric-case-studies__list" data-reveal-group>
          {caseStudies.items.map((item) => (
            <article key={item.slug} className="metric-case-card" data-reveal>
              <div className="metric-case-card__body">
                <div className="metric-case-card__tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="metric-pill border-foreground text-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <div>
                  <h3 className="metric-case-card__quote font-display">
                    {item.quote}
                  </h3>
                  <p className="metric-case-card__author">{item.author}</p>
                  <p className="metric-case-card__role">{item.role}</p>
                </div>
                <Button
                  href={localePath(locale, `/works/${item.slug}/`)}
                  variant="dark"
                  className="w-fit"
                >
                  {caseStudies.viewLabel}
                </Button>
              </div>
              <div className="metric-case-card__media">
                <Image
                  src={item.image}
                  alt={item.author}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </article>
          ))}
        </div>

        <div className="metric-case-studies__more" data-reveal>
          <Button href={localePath(locale, "/works/")} variant="outline">
            {caseStudies.moreLabel}
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}

export function MetricServicesSection({ locale }: { locale: Locale }) {
  const { services } = getMetricHome(locale);
  return (
    <section id={services.id} className="metric-services">
      <PageContainer className="metric-services__inner">
        <div className="metric-services__layout">
          <div className="metric-services__aside">
            <div className="metric-services__aside-copy">
              <h2 className="metric-services__title font-display" data-reveal>
                {services.titleLines.map((line) => (
                  <span key={line} className="metric-services__title-line">
                    {line}
                  </span>
                ))}
                <span className="metric-services__title-line metric-services__title-line--end">
                  {services.titleSuffix ? (
                    <span className="metric-services__title-suffix">
                      {services.titleSuffix}
                      {"\u00A0"}
                    </span>
                  ) : null}
                  <span className="metric-services__bracket">{services.titleBracket}</span>
                </span>
              </h2>
              <p className="metric-services__subtitle" data-reveal>
                {services.subtitle}
              </p>
            </div>

            <Button
              href={localePath(locale, "/#contact")}
              variant="onAccent"
              className="metric-services__cta"
              data-reveal
            >
              {services.cta}
            </Button>
          </div>

          <div className="metric-services__list" data-reveal-group>
            {services.items.map((item) => (
              <article key={item.n} className="metric-services-card" data-reveal>
                <div className="metric-services-card__head">
                  <span className="metric-services-card__num" aria-hidden>
                    {item.n}
                  </span>
                  <span className="metric-services-card__label">
                    <span className="metric-services-card__label-text">{item.title}</span>
                  </span>
                </div>
                <div className="metric-services-card__media">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="metric-services-card__img object-contain"
                    sizes="(max-width: 1024px) 90vw, 560px"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export function MetricWorkflowSection({ locale }: { locale: Locale }) {
  const { workflow } = getMetricHome(locale);
  return (
    <section id={workflow.id} className="metric-section metric-workflow">
      <PageContainer>
        <div className="metric-workflow__header" data-reveal>
          <h2 className="metric-workflow__title font-display text-foreground">
            <span className="metric-workflow__title-line">{workflow.titleLine1}</span>
            <span className="metric-workflow__title-line metric-workflow__title-line--brand">
              <Image
                src="/images/metric/icons/metric-m.svg"
                alt=""
                width={123}
                height={95}
                className="metric-workflow__mark"
                aria-hidden
              />
              <span>{workflow.titleLine2}</span>
            </span>
          </h2>
          <p className="metric-workflow__subtitle">{workflow.subtitle}</p>
        </div>

        <div className="metric-workflow__grid" data-reveal-group>
          {workflow.cards.map((card, index) => {
            const media = (
              <div className="metric-workflow-card__media">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="metric-workflow-card__img object-contain"
                  sizes="(max-width: 1024px) 90vw, 450px"
                />
              </div>
            );
            const copy = (
              <div className="metric-workflow-card__copy">
                <h3 className="metric-workflow-card__title font-display">{card.title}</h3>
                <p className="metric-workflow-card__body">{card.body}</p>
              </div>
            );

            return (
              <article
                key={card.title}
                className={`metric-workflow-card metric-workflow-card--${card.layout}${
                  index === 1 ? " metric-workflow-card--offset" : ""
                }`}
                data-reveal
              >
                {card.layout === "media-bottom" ? (
                  <>
                    {copy}
                    {media}
                  </>
                ) : (
                  <>
                    {media}
                    {copy}
                  </>
                )}
              </article>
            );
          })}
        </div>

        <div className="metric-workflow__cta" data-reveal>
          <p className="metric-workflow__note">{workflow.note}</p>
          <Button href={localePath(locale, "/#contact")} variant="primary">
            {workflow.cta}
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
