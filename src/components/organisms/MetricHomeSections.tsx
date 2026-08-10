import Image from "next/image";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TransitionLink } from "@/components/atoms/TransitionLink";
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

export function MetricHeroSection({ locale }: { locale: Locale }) {
  const { hero } = getMetricHome(locale);

  return (
    <section className="metric-hero" aria-label="Hero">
      <div className="metric-hero__glow" aria-hidden>
        <Image
          src={hero.glow}
          alt=""
          fill
          priority
          sizes="100vw"
          className="metric-hero__glow-img"
        />
      </div>

      <PageContainer className="metric-hero__shell">
        <div className="metric-hero__main">
          <div className="metric-hero__copy">
            <h1 className="metric-hero__title">
              <span className="block">{hero.titleLine1}</span>
              <span className="block">{hero.titleLine2}</span>
            </h1>
            <p className="metric-hero__subtitle">{hero.subtitle}</p>
            <TransitionLink
              href={localePath(locale, "/#contact")}
              className="metric-cta metric-cta--skew"
            >
              <span className="metric-cta__label">{hero.cta}</span>
            </TransitionLink>
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
    <section id="projects" className="metric-gradient-pink metric-section">
      <PageContainer>
        <h2
          className="font-display max-w-[1390px] text-[clamp(40px,7vw,120px)] text-white"
          data-reveal
        >
          {categories.titleBefore}
          <span className="text-accent">{categories.titleAccent}</span>
          {categories.titleAfter}
        </h2>
        <div className="metric-categories__track mt-12 md:mt-16" data-reveal-group>
          {categories.images.map((src) => (
            <div key={src} className="metric-categories__card" data-reveal>
              <Image src={src} alt="" fill className="object-cover" sizes="300px" />
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function MetricCaseStudiesSection({ locale }: { locale: Locale }) {
  const { caseStudies } = getMetricHome(locale);
  const titleParts = caseStudies.title.split(caseStudies.titleAccent);

  return (
    <section id="case-studies" className="metric-section">
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end" data-reveal>
          <h2 className="font-display text-[clamp(40px,6vw,100px)] text-foreground">
            {titleParts[0]}
            <span className="text-accent">{caseStudies.titleAccent}</span>
            {titleParts[1] ?? ""}
          </h2>
          <p className="max-w-[430px] text-[clamp(16px,1.5vw,24px)] leading-[1.2] tracking-[-0.02em] text-foreground lg:justify-self-end">
            {caseStudies.subtitle}
          </p>
        </div>

        <div className="mt-12 space-y-6 md:mt-16" data-reveal-group>
          {caseStudies.items.map((item) => (
            <article key={item.slug} className="metric-case-card" data-reveal>
              <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
                <div className="flex flex-wrap gap-[5px]">
                  {item.tags.map((tag) => (
                    <span key={tag} className="metric-pill border-foreground text-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <div>
                  <h3 className="font-display text-[clamp(28px,4vw,60px)] text-foreground">
                    {item.quote}
                  </h3>
                  <p className="mt-8 text-[clamp(22px,2vw,32px)] font-medium tracking-[-0.02em]">
                    {item.author}
                  </p>
                  <p className="mt-2 text-[clamp(16px,1.5vw,24px)] tracking-[-0.02em] text-[color:var(--muted)]">
                    {item.role}
                  </p>
                </div>
                <TransitionLink
                  href={localePath(locale, `/works/${item.slug}/`)}
                  className="metric-cta metric-cta--dark w-fit"
                >
                  {caseStudies.viewLabel}
                </TransitionLink>
              </div>
              <div className="relative min-h-[280px] lg:min-h-[600px]">
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

        <div className="mt-10 flex justify-center" data-reveal>
          <TransitionLink
            href={localePath(locale, "/works/")}
            className="inline-flex items-center gap-3 text-[20px] font-medium tracking-[-0.02em]"
          >
            {caseStudies.moreLabel}
            <Image
              src="/images/metric/icons/arrow.svg"
              alt=""
              width={24}
              height={24}
            />
          </TransitionLink>
        </div>
      </PageContainer>
    </section>
  );
}

export function MetricServicesSection({ locale }: { locale: Locale }) {
  const { services } = getMetricHome(locale);
  return (
    <section id={services.id} className="bg-accent metric-section text-white">
      <PageContainer>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div data-reveal>
            <h2 className="font-display text-[clamp(36px,5vw,80px)] text-white">
              {services.title}{" "}
              <span className="text-foreground">{services.titleBracket}</span>
            </h2>
            <p className="mt-6 max-w-[480px] text-[clamp(16px,1.5vw,22px)] leading-[1.2] tracking-[-0.02em] text-white/85">
              {services.subtitle}
            </p>
            <TransitionLink
              href={localePath(locale, "/#contact")}
              className="metric-cta mt-10 inline-flex bg-white text-accent"
            >
              {services.cta}
            </TransitionLink>
          </div>
          <div className="space-y-0" data-reveal-group>
            {services.items.map((item) => (
              <div key={item.n} className="metric-services-item" data-reveal>
                <span className="font-display text-[48px] text-white/90">{item.n}</span>
                <p className="text-[clamp(22px,2vw,36px)] font-medium tracking-[-0.02em]">
                  {item.title}
                </p>
                <div className="relative h-20 w-full overflow-hidden rounded-xl bg-white/10 md:h-28">
                  <Image src={item.image} alt="" fill className="object-cover" sizes="280px" />
                </div>
              </div>
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
    <section id={workflow.id} className="metric-section">
      <PageContainer>
        <div className="max-w-3xl" data-reveal>
          <h2 className="font-display text-[clamp(40px,6vw,100px)] text-foreground">
            {workflow.title}
          </h2>
          <p className="mt-4 text-[clamp(18px,2vw,28px)] tracking-[-0.02em] text-[color:var(--muted)]">
            {workflow.subtitle}
          </p>
        </div>
        <div className="metric-workflow__grid mt-12" data-reveal-group>
          {workflow.cards.map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-[32px] bg-[color:var(--surface)]"
              data-reveal
            >
              <div className="relative aspect-[4/3]">
                <Image src={card.image} alt="" fill className="object-cover" sizes="400px" />
              </div>
              <div className="p-6 md:p-8">
                <h3 className="font-display text-[clamp(24px,2.5vw,36px)] text-foreground">
                  {card.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
        <div
          className="mt-12 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
          data-reveal
        >
          <p className="max-w-md text-[18px] tracking-[-0.02em] text-[color:var(--muted)]">
            {workflow.note}
          </p>
          <TransitionLink
            href={localePath(locale, "/#contact")}
            className="metric-cta metric-cta--solid"
          >
            {workflow.cta}
          </TransitionLink>
        </div>
      </PageContainer>
    </section>
  );
}
