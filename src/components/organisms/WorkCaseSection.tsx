import { Button } from "@/components/atoms/Button";
import { MediaImage } from "@/components/atoms/MediaImage";
import { PageContainer } from "@/components/atoms/PageContainer";
import { MetricCaseCard } from "@/components/molecules/MetricCaseCard";
import { MetricTagPill } from "@/components/molecules/MetricTagPill";
import { BeforeAfterSlider } from "@/components/molecules/BeforeAfterSlider";
import type { Project } from "@/data/projects";
import { youtubeEmbedUrl } from "@/data/projects";
import { ProgressiveCaseImage } from "@/components/atoms/ProgressiveCaseImage";
import {
  CASE_GALLERY_SIZES,
  getCaseImageMeta,
} from "@/data/case-image-meta";
import { caseStripFromBlocks } from "@/lib/cms/case-gallery";
import { getNextProjects } from "@/i18n/get-content";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";

interface WorkCaseSectionProps {
  locale: Locale;
  content: SiteContent;
  project: Project;
}

function frameAlt(
  projectTitle: string,
  index: number,
  cmsAlt?: string,
): string {
  const trimmed = cmsAlt?.trim();
  if (trimmed) return trimmed;
  return `${projectTitle} — ${index + 1}`;
}

export async function WorkCaseSection({
  locale,
  content,
  project,
}: WorkCaseSectionProps) {
  const { ui } = content;
  const [home, nextProjects] = await Promise.all([
    getMetricHomeResolved(locale),
    getNextProjects(locale, project.slug),
  ]);
  const homeCaseBySlug = new Map<string, (typeof home.caseStudies.items)[number]>(
    home.caseStudies.items.map((item) => [item.slug, item]),
  );
  const caseStudy = project.caseStudy;
  const blocks = caseStudy?.blocks ?? [];
  const hasStructuredBlocks = blocks.length > 0;
  const legacyStrip = hasStructuredBlocks
    ? []
    : caseStripFromBlocks([], {
        heroImage: caseStudy?.heroImage,
        coverImage: project.image,
      });

  const authorName = project.author ?? project.title;
  let galleryIndex = 0;

  return (
    <article className="metric-case">
      <PageContainer className="metric-case__shell">
        <header className="metric-case__intro">
          <h1 className="metric-case__title font-display">{authorName}</h1>

          <div className="metric-case__grid">
            <div className="metric-case__col metric-case__col--main">
              {project.role ? (
                <p className="metric-case__role">{project.role}</p>
              ) : null}

              {caseStudy?.task ? (
                <div className="metric-case__brief">
                  <p className="metric-case__brief-label">{ui.task}</p>
                  <p className="metric-case__brief-text">{caseStudy.task}</p>
                </div>
              ) : null}
            </div>

            <div className="metric-case__col metric-case__col--aside">
              <div className="metric-case__meta">
                {project.tags.length ? (
                  <div className="metric-case__tags">
                    {project.tags.map((tag) => (
                      <MetricTagPill
                        key={tag}
                        tag={tag}
                        locale={locale}
                        className="metric-case__tag"
                      />
                    ))}
                  </div>
                ) : null}
                {project.description ? (
                  <p className="metric-case__lede">{project.description}</p>
                ) : null}
              </div>

              {caseStudy?.solution ? (
                <div className="metric-case__brief">
                  <p className="metric-case__brief-label">{ui.solution}</p>
                  <p className="metric-case__brief-text">{caseStudy.solution}</p>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {hasStructuredBlocks ? (
          <div className="metric-case__content mt-12 md:mt-16">
            {blocks.map((block) => {
              if (block.type === "gallery") {
                if (!block.images.length) return null;
                return (
                  <section key={block.id} className="metric-case__stack">
                    {block.images.map((image) => {
                      const index = galleryIndex++;
                      const fromCms =
                        image.width != null &&
                        image.height != null &&
                        image.width > 0 &&
                        image.height > 0
                          ? { width: image.width, height: image.height }
                          : null;
                      const { width, height } =
                        fromCms ?? getCaseImageMeta(image.url);
                      const alt = frameAlt(project.title, index, image.alt);
                      const isHero = index === 0;
                      const intrinsicH =
                        width > 0 && height > 0
                          ? Math.round((height / width) * 1200)
                          : 800;

                      return (
                        <div
                          key={`${block.id}-${image.url}-${index}`}
                          className={
                            isHero
                              ? "metric-case__stack-item"
                              : "metric-case__stack-item metric-case__stack-item--lazy"
                          }
                          style={
                            isHero
                              ? undefined
                              : {
                                  containIntrinsicSize: `auto ${intrinsicH}px`,
                                }
                          }
                        >
                          {isHero ? (
                            <ProgressiveCaseImage
                              src={image.url}
                              alt={alt}
                              width={width}
                              height={height}
                              className="metric-case__stack-img"
                              priority
                            />
                          ) : (
                            <MediaImage
                              src={image.url}
                              alt={alt}
                              width={width}
                              height={height}
                              className="metric-case__stack-img"
                              quality={85}
                              sizes={CASE_GALLERY_SIZES}
                              loading="lazy"
                            />
                          )}
                        </div>
                      );
                    })}
                  </section>
                );
              }

              if (block.type === "before_after") {
                if (!block.beforeImage || !block.afterImage) return null;
                return (
                  <section
                    key={block.id}
                    className="metric-case__block metric-case__block--ba mt-4"
                  >
                    <BeforeAfterSlider
                      beforeImage={block.beforeImage}
                      afterImage={block.afterImage}
                      beforeLabel={ui.logoCompareBefore}
                      afterLabel={ui.logoCompareAfter}
                      compareAriaLabel={ui.beforeAfterLabel}
                    />
                  </section>
                );
              }

              const embed = youtubeEmbedUrl(block.youtubeUrl);
              if (!embed) return null;
              return (
                <section
                  key={block.id}
                  className="metric-case__block metric-case__block--youtube mt-4"
                >
                  <div className="metric-case__youtube">
                    <iframe
                      src={embed}
                      title={`${project.title} — YouTube`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </section>
              );
            })}
          </div>
        ) : legacyStrip.length ? (
          <section className="metric-case__stack mt-12 md:mt-16">
            {legacyStrip.map((item, index) => {
              const fromCms =
                item.width != null &&
                item.height != null &&
                item.width > 0 &&
                item.height > 0
                  ? { width: item.width, height: item.height }
                  : null;
              const { width, height } = fromCms ?? getCaseImageMeta(item.src);
              const alt = frameAlt(project.title, index, item.alt);
              const isHero = index === 0;
              const intrinsicH =
                width > 0 && height > 0
                  ? Math.round((height / width) * 1200)
                  : 800;

              return (
                <div
                  key={`${item.src}-${index}`}
                  className={
                    isHero
                      ? "metric-case__stack-item"
                      : "metric-case__stack-item metric-case__stack-item--lazy"
                  }
                  style={
                    isHero
                      ? undefined
                      : { containIntrinsicSize: `auto ${intrinsicH}px` }
                  }
                >
                  {isHero ? (
                    <ProgressiveCaseImage
                      src={item.src}
                      alt={alt}
                      width={width}
                      height={height}
                      className="metric-case__stack-img"
                      priority
                    />
                  ) : (
                    <MediaImage
                      src={item.src}
                      alt={alt}
                      width={width}
                      height={height}
                      className="metric-case__stack-img"
                      quality={85}
                      sizes={CASE_GALLERY_SIZES}
                      loading="lazy"
                    />
                  )}
                </div>
              );
            })}
          </section>
        ) : null}

        {project.quote ? (
          <section className="mt-16 md:mt-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-[clamp(36px,5vw,72px)] text-foreground">
                {ui.reviewsTitle}
              </h2>
            </div>
            <div className="metric-case__reviews">
              <article className="metric-case__review">
                <p className="text-[clamp(16px,1.4vw,20px)] leading-[1.3] tracking-[-0.02em]">
                  {project.quote}
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="relative size-12 overflow-hidden rounded-full bg-[color:var(--surface)]">
                    <MediaImage
                      src={project.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <p className="text-[18px] font-medium tracking-[-0.02em]">
                      {authorName}
                    </p>
                    {project.role ? (
                      <p className="text-[14px] text-[color:var(--muted)]">
                        {project.role}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            </div>
          </section>
        ) : null}
      </PageContainer>

      <PageContainer>
        <section className="mt-16 md:mt-20">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="font-display text-[clamp(36px,5vw,72px)] text-foreground">
              {ui.otherWorks}
            </h2>
            <Button href={localePath(locale, "/works/")} variant="outline">
              {home.caseStudies.moreLabel}
            </Button>
          </div>
          <div className="metric-case-studies__list">
            {nextProjects.slice(0, 2).map((item) => {
              const fromHome = homeCaseBySlug.get(item.slug);
              return (
                <MetricCaseCard
                  key={item.slug}
                  locale={locale}
                  href={localePath(locale, `/works/${item.slug}/`)}
                  tags={fromHome?.tags ?? item.tags}
                  quote={fromHome?.quote ?? item.quote ?? item.title}
                  author={fromHome?.author ?? item.author ?? item.title}
                  role={fromHome?.role ?? item.role ?? item.description}
                  image={fromHome?.image ?? item.image}
                  imageAlt={item.title}
                  viewLabel={home.caseStudies.viewLabel}
                />
              );
            })}
          </div>
        </section>
      </PageContainer>
    </article>
  );
}
