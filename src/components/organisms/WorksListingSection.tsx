import Image from "next/image";
import { SectionTitle, PageContainer } from "@/components/atoms";
import { ProjectCard, ProjectTag, BeforeAfterSlider } from "@/components/molecules";
import { WorksListingFilters } from "@/components/molecules/WorksListingFilters";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";

export function WorksListingSection({ locale, content }: LocalePageProps) {
  const { projects, sphereFilters, directionFilters, site, ui } = content;
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const grid = projects.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="bg-black pb-16 pt-28 md:pb-24">
      <PageContainer>
        <section
          className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          data-scroll-section
        >
          <SectionTitle as="h1" split data-flip-id="page-title">
            {ui.allProjects}
          </SectionTitle>
          <WorksListingFilters
            ui={ui}
            sphereFilters={sphereFilters}
            directionFilters={directionFilters}
          />
        </section>

        <section className="works-listing-grid" data-scroll-section data-works-grid data-reveal-group>
          {featured && (
            <TransitionLink
              href={localePath(locale, `/works/${featured.slug}/`)}
              className="works-listing-grid__lead group block"
              data-work-item
              data-sphere={featured.sphere}
              data-tags={featured.tags.join("|")}
              data-featured="true"
              data-slug={featured.slug}
            >
              <div
                className="js-parallax relative aspect-[1432/902] w-full overflow-hidden"
                data-flip-id={`work-image-${featured.slug}`}
                data-clip-reveal
              >
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="100vw"
                />
              </div>
              <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-h3 text-white">{featured.title}</h2>
                  <p className="project-card__description text-body text-white">
                    {featured.description}
                  </p>
                </div>
                <div className="project-tags md:justify-end">
                  {featured.tags.map((t) => (
                    <ProjectTag key={t} label={t} />
                  ))}
                </div>
              </div>
            </TransitionLink>
          )}

          {grid.map((project) => (
            <ProjectCard key={project.slug} locale={locale} project={project} />
          ))}
        </section>

        <section className="mt-20" data-scroll-section data-reveal>
          <SectionTitle className="mb-8">{ui.beforeAfterLabel}</SectionTitle>
          <BeforeAfterSlider
            beforeImage="/images/projects/sushi-moto.jpg"
            afterImage="/images/projects/kidi-mart.jpg"
            beforeLabel={ui.logoCompareBefore}
            afterLabel={ui.logoCompareAfter}
            compareAriaLabel={ui.beforeAfterLabel}
          />
        </section>

        <section
          className="works-download-cta"
          data-scroll-section
          data-reveal
        >
          <div className="works-download-cta__top">
            <h3 className="works-download-cta__title">{ui.downloadPresentation}</h3>
            <Image
              src="/images/contacts/document-pdf.svg"
              alt=""
              width={32}
              height={32}
              className="works-download-cta__icon"
              aria-hidden
            />
          </div>
          <div className="works-download-cta__bottom">
            <p className="works-download-cta__hint">{ui.downloadHint}</p>
            <a
              href={site.files.presentation}
              className="works-download-cta__btn"
              download
            >
              {ui.download}
            </a>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
