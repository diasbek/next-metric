import Image from "next/image";
import type { Project } from "@/data/projects";
import { youtubeEmbedUrl } from "@/data/projects";
import {
  Divider,
  PageContainer,
  SectionScrollColumn,
  SectionStickyHeading,
} from "@/components/atoms";
import { ProjectTag, BeforeAfterSlider, ProjectCard } from "@/components/molecules";
import { getNextProjects } from "@/i18n/get-content";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";

interface WorkCaseSectionProps {
  locale: Locale;
  content: SiteContent;
  project: Project;
}

export async function WorkCaseSection({ locale, content, project }: WorkCaseSectionProps) {
  const { ui } = content;
  const caseStudy = project.caseStudy;
  const nextProjects = await getNextProjects(locale, project.slug);
  const heroSrc = caseStudy?.heroImage ?? project.image;
  const blocks = caseStudy?.blocks ?? [];

  return (
    <article className="case-study bg-black">
      <PageContainer className="case-study__body">
        <div className="case-study__layout">
          <SectionStickyHeading className="case-study__hero-left">
            <h1 className="case-study__title" data-flip-id="page-title">
              {project.title}
            </h1>
            {caseStudy?.year ? (
              <p className="case-study__year">{caseStudy.year}</p>
            ) : null}
          </SectionStickyHeading>

          <SectionScrollColumn className="case-study__content">
            <div className="case-study__hero-intro" data-reveal>
              <p className="case-study__description">{project.description}</p>
              <div className="case-study__tags" data-reveal-group="pop">
                {project.tags.map((tag) => (
                  <ProjectTag key={tag} label={tag} />
                ))}
              </div>
            </div>

            {caseStudy?.task ? (
              <div className="case-study__block" data-reveal>
                <p className="case-study__label">{ui.task}</p>
                <p className="case-study__text">{caseStudy.task}</p>
              </div>
            ) : null}

            {caseStudy?.solution ? (
              <div className="case-study__block" data-reveal>
                <p className="case-study__label">{ui.solution}</p>
                <p className="case-study__text">{caseStudy.solution}</p>
              </div>
            ) : null}
          </SectionScrollColumn>
        </div>
      </PageContainer>

      <section
        className="case-study__full-media case-study__full-media--hero"
        data-scroll-section
        data-reveal
      >
        <div
          data-flip-id={`work-image-${project.slug}`}
          className="case-study__figure case-study__figure--full js-parallax"
        >
          <Image
            src={heroSrc}
            alt={project.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </section>

      {blocks.map((block) => {
        if (block.type === "before_after") {
          if (!block.beforeImage || !block.afterImage) return null;
          return (
            <section
              key={block.id}
              className="case-study__full-media"
              data-scroll-section
              data-reveal
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

        if (block.type === "gallery") {
          if (!block.images.length) return null;
          return (
            <PageContainer key={block.id}>
              <div className="case-study__gallery">
                {block.images.map((src, index) => (
                  <div key={`${block.id}-${src}-${index}`} className="case-study__figure" data-reveal>
                    <Image
                      src={src}
                      alt={`${project.title} — ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                ))}
              </div>
            </PageContainer>
          );
        }

        const embed = youtubeEmbedUrl(block.youtubeUrl);
        if (!embed) return null;
        return (
          <section
            key={block.id}
            className="case-study__full-media case-study__youtube"
            data-scroll-section
            data-reveal
          >
            <div className="case-study__youtube-frame">
              <iframe
                src={embed}
                title={`${project.title} — video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </section>
        );
      })}

      <PageContainer className="case-study__next">
        <section data-scroll-section>
          <Divider className="mb-0" />
          <h2 className="case-study__next-title text-h2 text-white" data-reveal>
            {ui.nextProjects}
          </h2>
          <div className="case-study__next-grid" data-reveal-group>
            {nextProjects.map((item) => (
              <ProjectCard key={item.slug} locale={locale} project={item} />
            ))}
          </div>
        </section>
      </PageContainer>
    </article>
  );
}
