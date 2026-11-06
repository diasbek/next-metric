import { MediaImage } from "@/components/atoms/MediaImage";
import { ProgressiveCaseImage } from "@/components/atoms/ProgressiveCaseImage";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { BeforeAfterSlider } from "@/components/molecules/BeforeAfterSlider";
import type { Project } from "@/data/projects";
import { youtubeEmbedUrl } from "@/data/projects";
import {
  CASE_GALLERY_SIZES,
  getCaseImageMeta,
} from "@/data/case-image-meta";
import { caseStripFromBlocks } from "@/lib/cms/case-gallery";
import { caseAccent } from "@/lib/case-accent";
import { getNextProjects } from "@/i18n/get-content";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";
import { getActiveTags } from "@/lib/cms/tags";
import { resolveTagDisplays } from "@/utils/tag-labels";

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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export async function WorkCaseSection({
  locale,
  content,
  project,
}: WorkCaseSectionProps) {
  const { ui } = content;
  const de = locale === "de";
  const [home, nextProjects, taxonomy] = await Promise.all([
    getMetricHomeResolved(locale),
    getNextProjects(locale, project.slug),
    getActiveTags(locale),
  ]);
  const caseStudy = project.caseStudy;
  const blocks = caseStudy?.blocks ?? [];
  const hasStructuredBlocks = blocks.length > 0;
  const legacyStrip = hasStructuredBlocks
    ? []
    : caseStripFromBlocks([], {
        heroImage: caseStudy?.heroImage,
        coverImage: project.image,
      });

  const reviews =
    project.reviews && project.reviews.length > 0
      ? project.reviews
      : project.quote
        ? [
            {
              id: "legacy",
              author: project.author ?? "",
              role: project.role ?? "",
              quote: project.quote,
            },
          ]
        : [];
  const firstReview = reviews[0];
  const displayTags = resolveTagDisplays(project.tags, taxonomy);
  const worksHref = localePath(locale, "/works/");
  const homeHref = localePath(locale, "/");

  const galleryImages: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }> = [];
  if (hasStructuredBlocks) {
    for (const block of blocks) {
      if (block.type === "gallery") {
        for (const image of block.images) {
          galleryImages.push({
            url: image.url,
            alt: image.alt,
            width: image.width ?? undefined,
            height: image.height ?? undefined,
          });
        }
      }
    }
  } else {
    for (const item of legacyStrip) {
      galleryImages.push({
        url: item.src,
        alt: item.alt,
        width: item.width ?? undefined,
        height: item.height ?? undefined,
      });
    }
  }

  const cover = project.image || galleryImages[0]?.url || "";
  const slideCount = Math.max(galleryImages.length, 1);
  const deliverables = displayTags.map((t) => t.label).join(" · ") || "Listing · A+";
  const category = project.sphere || displayTags[0]?.label || "Amazon";
  const accent = caseAccent(
    project.sphere || category,
    project.slug.length,
    project.slug,
    project.caseAccent,
  );
  const next = nextProjects[0];
  const nextAccent = next
    ? caseAccent(
        next.sphere || next.tags?.[0],
        next.slug.length,
        next.slug,
        next.caseAccent,
      )
    : accent;

  return (
    <div className="metric-case" style={{ ["--acc" as string]: accent }}>
      <article className="ch wrap">
        <TransitionLink className="bk" href={worksHref} data-in="fade">
          ← {de ? "Zurück" : "Back"}
        </TransitionLink>
        <nav className="bc cap" aria-label="Breadcrumb" data-in="fade">
          <TransitionLink href={homeHref}>
            {de ? "Start" : "Home"}
          </TransitionLink>
          <span aria-hidden="true">/</span>
          <TransitionLink href={worksHref}>
            {de ? "Projekte" : "Projects"}
          </TransitionLink>
          <span aria-hidden="true">/</span>
          <span>{project.title.trim() || project.slug}</span>
        </nav>

        <h1 className="d1" data-in="chars">
          {project.title.trim() || project.slug}
        </h1>

        <div className="ch-r" data-in="fade">
          {displayTags.length ? (
            <div className="tags">
              {displayTags.map((tag) => (
                <span className="tag" key={tag.slug}>
                  {tag.label}
                </span>
              ))}
            </div>
          ) : null}
          {project.description ? (
            <p className="lead">{project.description}</p>
          ) : null}
        </div>

        {cover ? (
          <figure className="ch-cv" id="ch-cv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={`${project.title} — cover`}
              decoding="async"
            />
          </figure>
        ) : null}

        <div className="meta" data-reveal="stagger">
          <div>
            <span className="cap">{de ? "Kategorie" : "Category"}</span>
            <b>{category}</b>
          </div>
          <div>
            <span className="cap">{de ? "Leistungen" : "Deliverables"}</span>
            <b>{deliverables}</b>
          </div>
          <div>
            <span className="cap">{de ? "In diesem Projekt" : "In this case"}</span>
            <b>
              {slideCount}{" "}
              {de ? "Slides · Listing + A+" : "slides · listing + A+"}
            </b>
          </div>
        </div>

        {(caseStudy?.task || caseStudy?.solution) && (
          <div className="ts">
            {caseStudy.task ? (
              <div>
                <p className="cap">{ui.task}</p>
                <p data-reveal="lines">{caseStudy.task}</p>
              </div>
            ) : null}
            {caseStudy.solution ? (
              <div>
                <p className="cap">{ui.solution}</p>
                <p data-reveal="lines">{caseStudy.solution}</p>
              </div>
            ) : null}
          </div>
        )}

        {galleryImages.length ? (
          <div className="gal">
            <div className="gal-l">
              {galleryImages.map((image, index) => {
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
                return (
                  <figure className="gs" data-reveal="pic" key={`${image.url}-${index}`}>
                    {isHero ? (
                      <ProgressiveCaseImage
                        src={image.url}
                        alt={alt}
                        width={width}
                        height={height}
                        priority
                        fetchPriority="high"
                      />
                    ) : (
                      <MediaImage
                        src={image.url}
                        alt={alt}
                        width={width}
                        height={height}
                        quality={85}
                        sizes={CASE_GALLERY_SIZES}
                        loading="lazy"
                      />
                    )}
                  </figure>
                );
              })}
            </div>
          </div>
        ) : null}

        {hasStructuredBlocks
          ? blocks.map((block) => {
              if (block.type === "before_after") {
                if (!block.beforeImage || !block.afterImage) return null;
                return (
                  <section
                    key={block.id}
                    className="metric-case__block metric-case__block--ba"
                    style={{ marginTop: 40 }}
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
              if (block.type === "youtube") {
                const embed = youtubeEmbedUrl(block.youtubeUrl);
                if (!embed) return null;
                return (
                  <section
                    key={block.id}
                    className="metric-case__block metric-case__block--youtube"
                    style={{ marginTop: 40 }}
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
              }
              return null;
            })
          : null}
      </article>

      {firstReview?.quote ? (
        <section className="crv dk" data-dark aria-label="Client review">
          <div className="wrap">
            <figure className="rq">
              <blockquote>{firstReview.quote}</blockquote>
              <figcaption>
                <footer>
                  {firstReview.personImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="av"
                      src={firstReview.personImage}
                      alt=""
                      width={48}
                      height={48}
                    />
                  ) : (
                    <span className="av" aria-hidden="true">
                      {initials(firstReview.author || project.title)}
                    </span>
                  )}
                  <span>
                    <b>{firstReview.author || project.title}</b>
                    {firstReview.role ? (
                      <span className="cap">{firstReview.role}</span>
                    ) : null}
                  </span>
                </footer>
              </figcaption>
            </figure>
          </div>
        </section>
      ) : null}

      {next ? (
        <TransitionLink
          className="nx wrap"
          href={localePath(locale, `/works/${next.slug}/`)}
          data-cur={de ? "Nächster Fall" : "Next case"}
          style={{ ["--acc" as string]: nextAccent }}
        >
          <div className="nx-g">
            <div>
              <p className="cap">
                {de ? "Nächster Fall · " : "Next case · "}
                {next.sphere || next.tags?.[0] || ""}
              </p>
              <p className="d1">{next.title}</p>
            </div>
            <div className="nx-m">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={next.image}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </TransitionLink>
      ) : (
        <div className="wrap" style={{ paddingBottom: 80 }}>
          <TransitionLink className="btn mag ghost" href={worksHref}>
            {home.caseStudies.moreLabel}{" "}
            <span className="ar" aria-hidden="true">
              →
            </span>
          </TransitionLink>
        </div>
      )}
    </div>
  );
}
