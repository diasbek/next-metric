import { PageContainer } from "@/components/atoms/PageContainer";
import { MetricCaseCard } from "@/components/molecules/MetricCaseCard";
import { SiteBreadcrumbs } from "@/components/molecules/SiteBreadcrumbs";
import { WorksListingFilters } from "@/components/molecules/WorksListingFilters";
import type { LocalePageProps } from "@/i18n/props";
import { getLocalizedBreadcrumbs } from "@/i18n/page-seo";
import { localePath } from "@/i18n/paths";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";
import { getActiveTags } from "@/lib/cms/tags";
import { resolveTagDisplays } from "@/utils/tag-labels";
import {
  projectMatchesWorksFilters,
  worksFilterOptionsFromTaxonomy,
  WORKS_CATEGORY_VALUES,
  WORKS_TYPE_VALUES,
  type WorksFilterOption,
} from "@/utils/works-filters";

export async function WorksListingSection({
  locale,
  content,
  category = "",
  type = "",
}: LocalePageProps & { category?: string; type?: string }) {
  const { projects, ui } = content;
  const [home, taxonomy] = await Promise.all([
    getMetricHomeResolved(locale),
    getActiveTags(locale),
  ]);
  const homeCaseBySlug = new Map<string, (typeof home.caseStudies.items)[number]>(
    home.caseStudies.items.map((item) => [item.slug, item]),
  );
  const breadcrumbs = getLocalizedBreadcrumbs(locale, ["home", "works"]);

  const items = projects.map((project) => {
    const fromHome = homeCaseBySlug.get(project.slug);
    const rawTags = fromHome?.tags ?? project.tags;
    return {
      slug: project.slug,
      href: localePath(locale, `/works/${project.slug}/`),
      tags: resolveTagDisplays(rawTags, taxonomy),
      quote: fromHome?.quote ?? project.quote ?? project.title,
      author: fromHome?.author ?? project.author ?? project.title,
      role: fromHome?.role ?? project.role ?? project.description,
      image: fromHome?.image ?? project.image,
      imageAlt: project.title,
      sphere: project.sphere,
      rawTags,
    };
  });

  const usedSlugs = [
    ...projects.map((project) => project.sphere),
    ...items.flatMap((item) => item.rawTags),
  ];

  let categoryOptions: WorksFilterOption[] = worksFilterOptionsFromTaxonomy(
    taxonomy,
    "category",
    usedSlugs,
  );
  let typeOptions: WorksFilterOption[] = worksFilterOptionsFromTaxonomy(
    taxonomy,
    "type",
    usedSlugs,
  );

  if (!taxonomy.length) {
    const used = new Set(usedSlugs.map((s) => s.trim()).filter(Boolean));
    categoryOptions = WORKS_CATEGORY_VALUES.filter((v) => used.has(v)).map(
      (value) => ({ value, label: value }),
    );
    typeOptions = WORKS_TYPE_VALUES.filter((v) => used.has(v)).map((value) => ({
      value,
      label: value,
    }));
  }

  const filtered = items.filter((item) =>
    projectMatchesWorksFilters(
      {
        sphere: item.sphere,
        tags: item.rawTags,
      },
      category || null,
      type || null,
    ),
  );

  return (
    <div className="metric-works metric-case-studies bg-white pb-20 pt-10 md:pt-14">
      <PageContainer>
        <SiteBreadcrumbs items={breadcrumbs} className="mb-6" />
        <div className="metric-works__header mb-12 md:mb-16">
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
          <div className="metric-case-studies__list">
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
          <p className="works-filters__empty">{ui.filterEmpty}</p>
        )}
      </PageContainer>
    </div>
  );
}
