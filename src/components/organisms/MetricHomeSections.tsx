import Image from "next/image";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { metricHome } from "@/data/metric-home";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";

export function MetricHeroSection({ locale }: { locale: Locale }) {
  const { hero } = metricHome;

  return (
    <section className="relative overflow-hidden pb-10 pt-6 md:pb-16 md:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[70vw] max-h-[720px] w-[70vw] max-w-[720px] rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(255,60,130,0.35) 0%, rgba(255,60,130,0) 70%)",
        }}
      />
      <PageContainer>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="max-w-[695px]">
            <h1 className="font-display text-[clamp(42px,7vw,90px)] text-foreground">
              {hero.title}
            </h1>
            <p className="mt-8 max-w-[483px] text-[clamp(18px,2vw,24px)] leading-[1.2] tracking-[-0.02em] text-foreground">
              {hero.subtitle}
            </p>
            <TransitionLink
              href={localePath(locale, "/#contact")}
              className="metric-cta metric-cta--solid mt-10"
            >
              {hero.cta}
            </TransitionLink>
          </div>

          <div className="relative mx-auto aspect-[620/480] w-full max-w-[620px]">
            <div className="absolute left-[6%] top-[18%] aspect-[284/395] w-[46%] rotate-[-5deg] overflow-hidden rounded-[19px] bg-white shadow-[0_4px_32px_rgba(131,4,108,0.25)]">
              <Image
                src={hero.product1}
                alt=""
                fill
                className="object-cover"
                sizes="300px"
                priority
              />
            </div>
            <div className="absolute right-0 top-0 aspect-[318/441] w-[52%] rotate-[7deg] overflow-hidden rounded-[19px] bg-white shadow-[0_4px_32px_rgba(131,4,108,0.25)]">
              <Image
                src={hero.product2}
                alt=""
                fill
                className="object-cover"
                sizes="320px"
                priority
              />
            </div>
            <div className="metric-glass absolute bottom-[12%] left-0 z-10 flex h-[118px] w-[120px] items-center justify-center">
              <span className="text-[40px] font-semibold tracking-[-0.06em] text-foreground">
                {hero.badge}
              </span>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export function MetricTrustSection() {
  return (
    <section className="pb-16 md:pb-24">
      <PageContainer>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricHome.trust.map((item) => (
            <div
              key={item.kind + (item.label ?? "")}
              className="metric-glass flex min-h-[220px] flex-col justify-between p-7 md:min-h-[264px]"
            >
              {"icon" in item && item.icon ? (
                <div className="relative h-12 w-[85px]">
                  <Image src={item.icon} alt="" fill className="object-contain object-left" />
                </div>
              ) : null}
              {"value" in item && item.value ? (
                <p className="font-display text-[clamp(48px,6vw,80px)] text-foreground">
                  {item.value}
                  {item.kind === "rating" ? (
                    <span className="ml-2 inline-block align-middle">
                      <Image
                        src="/images/metric/icons/star.svg"
                        alt=""
                        width={41}
                        height={39}
                      />
                    </span>
                  ) : null}
                </p>
              ) : null}
              <div>
                {"text" in item && item.text ? (
                  <>
                    <p className="text-[18px] tracking-[-0.02em]">{item.label}</p>
                    <p className="mt-3 max-w-[320px] text-[18px] leading-[1.2] tracking-[-0.02em]">
                      {item.text}
                    </p>
                  </>
                ) : (
                  <p className="max-w-[180px] text-[18px] leading-[1.2] tracking-[-0.02em]">
                    {item.label}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function MetricCategoriesSection() {
  const { categories } = metricHome;
  return (
    <section id="projects" className="metric-gradient-pink py-16 md:py-24">
      <PageContainer>
        <h2 className="font-display max-w-[1390px] text-[clamp(40px,7vw,120px)] text-white">
          {categories.titleBefore}
          <span className="text-accent">{categories.titleAccent}</span>
          {categories.titleAfter}
        </h2>
        <div className="mt-12 flex gap-4 overflow-x-auto pb-2 md:mt-16 md:gap-6">
          {categories.images.map((src) => (
            <div
              key={src}
              className="relative h-[280px] w-[220px] shrink-0 overflow-hidden rounded-[20px] md:h-[400px] md:w-[300px]"
            >
              <Image src={src} alt="" fill className="object-cover" sizes="300px" />
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function MetricCaseStudiesSection({ locale }: { locale: Locale }) {
  const { caseStudies } = metricHome;
  return (
    <section id="case-studies" className="py-16 md:py-24">
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 className="font-display text-[clamp(40px,6vw,100px)] text-foreground">
            See how better visuals drive real{" "}
            <span className="text-accent">Amazon results.</span>
          </h2>
          <p className="max-w-[430px] text-[clamp(16px,1.5vw,24px)] leading-[1.2] tracking-[-0.02em] text-foreground lg:justify-self-end">
            {caseStudies.subtitle}
          </p>
        </div>

        <div className="mt-12 space-y-6 md:mt-16">
          {caseStudies.items.map((item) => (
            <article
              key={item.slug}
              className="grid overflow-hidden rounded-[40px] bg-[color:var(--surface)] lg:grid-cols-2"
            >
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

        <div className="mt-10 flex justify-center">
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
  const { services } = metricHome;
  return (
    <section id={services.id} className="bg-accent py-16 text-white md:py-24">
      <PageContainer>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="font-display text-[clamp(36px,5vw,80px)] text-white">
              {services.title}
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
          <div className="space-y-6">
            {services.items.map((item) => (
              <div
                key={item.n}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/25 pb-6 last:border-0"
              >
                <span className="font-display text-[48px] text-white/90">{item.n}</span>
                <p className="text-[clamp(22px,2vw,36px)] font-medium tracking-[-0.02em]">
                  {item.title}
                </p>
                <div className="relative h-16 w-24 overflow-hidden rounded-xl bg-white/10 md:h-24 md:w-36">
                  <Image src={item.image} alt="" fill className="object-cover" sizes="144px" />
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
  const { workflow } = metricHome;
  return (
    <section id={workflow.id} className="py-16 md:py-24">
      <PageContainer>
        <div className="max-w-3xl">
          <h2 className="font-display text-[clamp(40px,6vw,100px)] text-foreground">
            {workflow.title}
          </h2>
          <p className="mt-4 text-[clamp(18px,2vw,28px)] tracking-[-0.02em] text-[color:var(--muted)]">
            {workflow.subtitle}
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {workflow.cards.map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-[32px] bg-[color:var(--surface)]"
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
        <div className="mt-12 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
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
