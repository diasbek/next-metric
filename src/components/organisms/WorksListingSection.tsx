import { PageContainer } from "@/components/atoms/PageContainer";
import { MetricCaseCard } from "@/components/molecules/MetricCaseCard";
import { WorksListingFilters } from "@/components/molecules/WorksListingFilters";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";
import {
  uniqueWorksFilterOptions,
  WORKS_CATEGORY_VALUES,
  WORKS_TYPE_VALUES,
  projectMatchesWorksFilters,
} from "@/utils/works-filters";

const CATEGORY_ALLOW = new Set(WORKS_CATEGORY_VALUES);
const TYPE_ALLOW = new Set(WORKS_TYPE_VALUES);

export async function WorksListingSection({
  locale,
  content,
  category = "",
  type = "",
}: LocalePageProps & { category?: string; type?: string }) {
  const { projects, ui } = content;
  const home = await getMetricHomeResolved(locale);
  const homeCaseBySlug = new Map<string, (typeof home.caseStudies.items)[number]>(
    home.caseStudies.items.map((item) => [item.slug, item]),
  );

  const items = projects.map((project) => {
    const fromHome = homeCaseBySlug.get(project.slug);
    return {
      slug: project.slug,
      href: localePath(locale, `/works/${project.slug}/`),
      tags: fromHome?.tags ?? project.tags,
      quote: fromHome?.quote ?? project.quote ?? project.title,
      author: fromHome?.author ?? project.author ?? project.title,
      role: fromHome?.role ?? project.role ?? project.description,
      image: fromHome?.image ?? project.image,
      imageAlt: project.title,
      sphere: project.sphere,
    };
  });

  const categoryOptions = uniqueWorksFilterOptions(
    [
      ...projects.map((project) => project.sphere),
      ...items.flatMap((item) => item.tags),
    ],
    CATEGORY_ALLOW,
  );
  const typeOptions = uniqueWorksFilterOptions(
    items.flatMap((item) => item.tags),
    TYPE_ALLOW,
  );

  const filtered = items.filter((item) =>
    projectMatchesWorksFilters(
      { sphere: item.sphere, tags: item.tags },
      category || null,
      type || null,
    ),
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

        <WorksListingFilters
          ui={ui}
          categoryOptions={categoryOptions}
          typeOptions={typeOptions}
          category={category}
          type={type}
          pathname={localePath(locale, "/works/")}
        />

        {filtered.length ? (
          <div
            className="metric-case-studies__list"
            data-reveal-group="pop"
            data-reveal-stagger="0.12"
          >
            {filtered.map((item) => (
              <MetricCaseCard
                key={item.slug}
                locale={locale}
                href={item.href}
                tags={item.tags}
                quote={item.quote}
                author={item.author}
                role={item.role}
                image={item.image}
                imageAlt={item.imageAlt}
                viewLabel={home.caseStudies.viewLabel}
              />
            ))}
          </div>
        ) : (
          <p className="works-filters__empty" data-reveal>
            {ui.filterEmpty}
          </p>
        )}
      </PageContainer>
    </div>
  );
}
