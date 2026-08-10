import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { BeforeAfterSlider } from "@/components/molecules/BeforeAfterSlider";
import type { Project } from "@/data/projects";
import { youtubeEmbedUrl } from "@/data/projects";
import { getNextProjects } from "@/i18n/get-content";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";

interface WorkCaseSectionProps {
  locale: Locale;
  content: SiteContent;
  project: Project;
  /** Full page (default) or content inside desktop case modal. */
  presentation?: "page" | "modal";
}

export async function WorkCaseSection({
  locale,
  content,
  project,
  presentation = "page",
}: WorkCaseSectionProps) {
  const { ui } = content;
  const home = await getMetricHomeResolved(locale);
  const caseStudy = project.caseStudy;
  const nextProjects = await getNextProjects(locale, project.slug);
  const blocks = caseStudy?.blocks ?? [];
  const galleryFallback =
    caseStudy?.heroImage ? [caseStudy.heroImage] : [project.image];
  const hasGalleryBlock = blocks.some((b) => b.type === "gallery");

  const authorName = project.author ?? project.title;
  const reviews = [
    {
      quote: project.quote ?? project.description,
      author: authorName,
      role: project.role ?? project.title,
      avatar: project.image,
    },
    ...nextProjects.slice(0, 2).map((item) => ({
      quote: item.quote ?? item.description,
      author: item.author ?? item.title,
      role: item.role ?? item.title,
      avatar: item.image,
    })),
  ];

  return (
    <article
      className={
        presentation === "modal" ? "metric-case metric-case--modal" : "metric-case"
      }
    >
      <PageContainer>
        <header className="metric-case__intro" data-reveal>
          <div className="metric-case__intro-copy">
            <h1 className="font-display text-[clamp(42px,6vw,90px)] leading-[0.9] tracking-[-0.02em] text-foreground">
              {authorName}
            </h1>
            {project.role ? (
              <p className="mt-4 text-[clamp(18px,2vw,24px)] tracking-[-0.02em] text-[color:var(--muted)]">
                {project.role}
              </p>
            ) : null}
          </div>
          <div className="metric-case__intro-meta">
            <div className="flex flex-wrap gap-[5px]">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="metric-pill border-foreground/25 text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-6 max-w-xl text-[clamp(16px,1.5vw,20px)] leading-[1.25] tracking-[-0.02em] text-foreground">
              {project.description}
            </p>
          </div>
        </header>

        {(caseStudy?.task || caseStudy?.solution) && (
          <div
            className="mt-10 grid gap-8 md:grid-cols-2"
            data-reveal-group
          >
            {caseStudy.task ? (
              <div data-reveal>
                <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  {ui.task}
                </p>
                <p className="mt-2 text-[20px] leading-[1.3]">{caseStudy.task}</p>
              </div>
            ) : null}
            {caseStudy.solution ? (
              <div data-reveal>
                <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  {ui.solution}
                </p>
                <p className="mt-2 text-[20px] leading-[1.3]">
                  {caseStudy.solution}
                </p>
              </div>
            ) : null}
          </div>
        )}

        <section className="metric-case__stack mt-12 md:mt-16" data-reveal-group>
          {!hasGalleryBlock
            ? galleryFallback.map((src, index) => (
                <div
                  key={src}
                  className="metric-case__stack-item"
                  data-reveal
                  data-reveal-delay={String(Math.min(index * 0.05, 0.2))}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1512px) 100vw, 1392px"
                    priority={index === 0}
                  />
                </div>
              ))
            : null}

          {blocks.map((block, blockIndex) => {
            if (block.type === "gallery") {
              return block.images.map((src, index) => (
                <div
                  key={`${block.id}-${src}`}
                  className="metric-case__stack-item"
                  data-reveal
                  data-reveal-delay={String(Math.min(index * 0.05, 0.2))}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1512px) 100vw, 1392px"
                    priority={blockIndex === 0 && index === 0}
                  />
                  {blockIndex === 0 && index === 0 && caseStudy?.metricValue ? (
                    <div className="metric-glass absolute bottom-6 left-6 px-5 py-4 md:bottom-10 md:left-10">
                      <p className="text-sm text-foreground/70">
                        {caseStudy.metricLabel}
                      </p>
                      <p className="text-[28px] font-semibold tracking-[-0.04em] text-foreground">
                        {caseStudy.metricValue}
                      </p>
                    </div>
                  ) : null}
                </div>
              ));
            }

            if (block.type === "before_after") {
              if (!block.beforeImage || !block.afterImage) return null;
              return (
                <div
                  key={block.id}
                  className="metric-case__stack-item metric-case__stack-item--slider"
                  data-reveal
                >
                  <BeforeAfterSlider
                    beforeImage={block.beforeImage}
                    afterImage={block.afterImage}
                    beforeLabel={ui.logoCompareBefore}
                    afterLabel={ui.logoCompareAfter}
                    compareAriaLabel={ui.beforeAfterLabel}
                  />
                </div>
              );
            }

            if (block.type === "youtube") {
              const embed = youtubeEmbedUrl(block.youtubeUrl);
              if (!embed) return null;
              return (
                <div
                  key={block.id}
                  className="metric-case__stack-item metric-case__stack-item--video"
                  data-reveal
                >
                  <iframe
                    src={embed}
                    title={project.title}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }

            return null;
          })}
        </section>

        {project.quote ? (
          <section className="mt-16 md:mt-20" data-reveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-[clamp(36px,5vw,72px)] text-foreground">
                {ui.reviewsTitle}
              </h2>
            </div>
            <div className="metric-case__reviews">
              {reviews.map((review) => (
                <article key={review.author + review.quote.slice(0, 24)} className="metric-case__review">
                  <p className="text-[clamp(16px,1.4vw,20px)] leading-[1.3] tracking-[-0.02em]">
                    {review.quote}
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-full bg-[color:var(--surface)]">
                      <Image
                        src={review.avatar}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="text-[18px] font-medium tracking-[-0.02em]">
                        {review.author}
                      </p>
                      <p className="text-[14px] text-[color:var(--muted)]">
                        {review.role}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-16 md:mt-20" data-reveal>
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="font-display text-[clamp(36px,5vw,72px)] text-foreground">
              {ui.otherWorks}
            </h2>
            <Button href={localePath(locale, "/works/")} variant="outline">
              {home.caseStudies.moreLabel}
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {nextProjects.slice(0, 2).map((item) => (
              <article key={item.slug} className="metric-work-card group">
                <div className="metric-work-card__media">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="metric-work-card__body">
                  <h3 className="metric-work-card__title">
                    {item.quote ?? item.description}
                  </h3>
                  <Button
                    href={localePath(locale, `/works/${item.slug}/`)}
                    variant="dark"
                    className="mt-6"
                  >
                    {home.caseStudies.viewLabel}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </PageContainer>
    </article>
  );
}
