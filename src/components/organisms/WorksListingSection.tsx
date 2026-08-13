import { PageContainer } from "@/components/atoms/PageContainer";
import { MetricCaseCard } from "@/components/molecules/MetricCaseCard";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";

export async function WorksListingSection({ locale, content }: LocalePageProps) {
  const { projects, ui } = content;
  const home = await getMetricHomeResolved(locale);
  const homeCaseBySlug = new Map<string, (typeof home.caseStudies.items)[number]>(
    home.caseStudies.items.map((item) => [item.slug, item]),
  );

  return (
    <div className="metric-works metric-case-studies bg-white pb-20 pt-10 md:pt-14">
      <PageContainer>
        <div className="metric-works__header mb-12 md:mb-16" data-reveal>
          <h1 className="metric-works__title font-display text-foreground">
            {ui.allProjects}
          </h1>
          <p className="metric-works__subtitle">{home.caseStudies.subtitle}</p>
        </div>

        <div
          className="metric-case-studies__list"
          data-reveal-group="pop"
          data-reveal-stagger="0.12"
        >
          {projects.map((project) => {
            const fromHome = homeCaseBySlug.get(project.slug);
            return (
              <MetricCaseCard
                key={project.slug}
                href={localePath(locale, `/works/${project.slug}/`)}
                tags={fromHome?.tags ?? project.tags}
                quote={fromHome?.quote ?? project.quote ?? project.title}
                author={fromHome?.author ?? project.author ?? project.title}
                role={fromHome?.role ?? project.role ?? project.description}
                image={fromHome?.image ?? project.image}
                imageAlt={project.title}
                viewLabel={home.caseStudies.viewLabel}
              />
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}
