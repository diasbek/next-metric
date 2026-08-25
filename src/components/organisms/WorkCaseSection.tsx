import { Button } from "@/components/atoms/Button";
import { MediaImage } from "@/components/atoms/MediaImage";
import { PageContainer } from "@/components/atoms/PageContainer";
import { MetricCaseCard } from "@/components/molecules/MetricCaseCard";
import { MetricTagPill } from "@/components/molecules/MetricTagPill";
import type { Project } from "@/data/projects";
import { ProgressiveCaseImage } from "@/components/atoms/ProgressiveCaseImage";
import { getCaseImageMeta } from "@/data/case-image-meta";
import { getNextProjects } from "@/i18n/get-content";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";

/** Flatten a case into an ordered strip — images only, no gaps. */
function caseStripImages(
  project: Project,
): Array<{ src: string; width?: number | null; height?: number | null }> {
  const seen = new Set<string>();
  const images: Array<{
    src: string;
    width?: number | null;
    height?: number | null;
  }> = [];
  const push = (
    src?: string,
    width?: number | null,
    height?: number | null,
  ) => {
    const url = src?.trim();
    if (!url || seen.has(url)) return;
    seen.add(url);
    images.push({ src: url, width, height });
  };

  for (const block of project.caseStudy?.blocks ?? []) {
    if (block.type === "gallery") {
      for (const image of block.images) {
        push(image.url, image.width, image.height);
      }
    }
  }

  if (!images.length) {
    push(project.caseStudy?.heroImage);
    push(project.image);
  }

  return images;
}

interface WorkCaseSectionProps {
  locale: Locale;
  content: SiteContent;
  project: Project;
}

export async function WorkCaseSection({
  locale,
  content,
  project,
}: WorkCaseSectionProps) {
  const { ui } = content;
  const home = await getMetricHomeResolved(locale);
  const homeCaseBySlug = new Map<string, (typeof home.caseStudies.items)[number]>(
    home.caseStudies.items.map((item) => [item.slug, item]),
  );
  const caseStudy = project.caseStudy;
  const nextProjects = await getNextProjects(locale, project.slug);
  const stripImages = caseStripImages(project);

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

        {stripImages.length ? (
          <section className="metric-case__stack mt-12 md:mt-16">
            {stripImages.map((item, index) => {
              const fromCms =
                item.width != null &&
                item.height != null &&
                item.width > 0 &&
                item.height > 0
                  ? { width: item.width, height: item.height }
                  : null;
              const { width, height } = fromCms ?? getCaseImageMeta(item.src);
              return (
                <div
                  key={`${item.src}-${index}`}
                  className="metric-case__stack-item"
                >
                  <ProgressiveCaseImage
                    src={item.src}
                    alt={
                      index === 0
                        ? `${project.title} — Amazon listing visuals`
                        : `${project.title} — project image ${index + 1}`
                    }
                    width={width}
                    height={height}
                    className="metric-case__stack-img"
                    priority={index === 0}
                  />
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
              {reviews.map((review) => (
                <article
                  key={review.author + review.quote.slice(0, 24)}
                  className="metric-case__review"
                >
                  <p className="text-[clamp(16px,1.4vw,20px)] leading-[1.3] tracking-[-0.02em]">
                    {review.quote}
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-full bg-[color:var(--surface)]">
                      <MediaImage
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
