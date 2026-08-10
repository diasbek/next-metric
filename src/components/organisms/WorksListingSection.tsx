import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";

export async function WorksListingSection({ locale, content }: LocalePageProps) {
  const { projects, ui } = content;
  const home = await getMetricHomeResolved(locale);

  return (
    <div className="metric-works bg-white pb-20 pt-10 md:pt-14">
      <PageContainer>
        <div className="metric-works__header mb-12 md:mb-16" data-reveal>
          <h1 className="metric-works__title font-display text-foreground">
            {ui.allProjects}
          </h1>
          <p className="metric-works__subtitle">
            {home.caseStudies.subtitle}
          </p>
        </div>

        <div className="metric-works-grid" data-reveal-group>
          {projects.map((project) => (
            <TransitionLink
              key={project.slug}
              href={localePath(locale, `/works/${project.slug}/`)}
              className="metric-work-card group"
              data-reveal
            >
              <div className="metric-work-card__media">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="metric-work-card__body">
                <div className="mb-4 flex flex-wrap gap-[5px]">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="metric-pill border-foreground text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="metric-work-card__title">{project.title}</h2>
                <p className="metric-work-card__desc">{project.description}</p>
                <Button as="span" variant="dark" className="mt-6 inline-flex">
                  {home.caseStudies.viewLabel}
                </Button>
              </div>
            </TransitionLink>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
