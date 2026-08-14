import { Suspense } from "react";
import { PageContainer } from "@/components/atoms/PageContainer";
import {
  WorksListingClient,
  type WorksListingItem,
} from "@/components/molecules/WorksListingClient";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";
import {
  uniqueWorksFilterOptions,
  WORKS_CATEGORY_VALUES,
  WORKS_TYPE_VALUES,
} from "@/utils/works-filters";

const CATEGORY_ALLOW = new Set(WORKS_CATEGORY_VALUES);
const TYPE_ALLOW = new Set(WORKS_TYPE_VALUES);

export async function WorksListingSection({ locale, content }: LocalePageProps) {
  const { projects, ui } = content;
  const home = await getMetricHomeResolved(locale);
  const homeCaseBySlug = new Map<string, (typeof home.caseStudies.items)[number]>(
    home.caseStudies.items.map((item) => [item.slug, item]),
  );

  const items: WorksListingItem[] = projects.map((project) => {
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

  return (
    <div className="metric-works metric-case-studies bg-white pb-20 pt-10 md:pt-14">
      <PageContainer>
        <div className="metric-works__header mb-12 md:mb-16" data-reveal>
          <h1 className="metric-works__title font-display text-foreground">
            {ui.allProjects}
          </h1>
          <p className="metric-works__subtitle">{home.caseStudies.subtitle}</p>
        </div>

        <Suspense fallback={null}>
          <WorksListingClient
            locale={locale}
            ui={ui}
            categoryOptions={categoryOptions}
            typeOptions={typeOptions}
            items={items}
            viewLabel={home.caseStudies.viewLabel}
          />
        </Suspense>
      </PageContainer>
    </div>
  );
}
