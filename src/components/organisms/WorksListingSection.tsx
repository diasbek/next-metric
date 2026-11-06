import { TransitionLink } from "@/components/atoms/TransitionLink";
import { WorksListingFilters } from "@/components/molecules/WorksListingFilters";
import type { LocalePageProps } from "@/i18n/props";
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

function pad(n: number) {
  return String(n).padStart(2, "0");
}

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
  const de = locale === "de";

  const items = projects.map((project) => {
    const rawTags = project.tags;
    const peek =
      project.peekImages && project.peekImages.length > 1
        ? project.peekImages.join(",")
        : "";
    return {
      slug: project.slug,
      href: localePath(locale, `/works/${project.slug}/`),
      tags: resolveTagDisplays(rawTags, taxonomy),
      title: project.title,
      description: project.description ?? "",
      image: project.image,
      imageAlt: project.title,
      sphere: project.sphere,
      peek,
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

  const categoryCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  for (const item of items) {
    for (const opt of categoryOptions) {
      if (
        projectMatchesWorksFilters(
          { sphere: item.sphere, tags: item.rawTags },
          opt.value,
          null,
        )
      ) {
        categoryCounts[opt.value] = (categoryCounts[opt.value] ?? 0) + 1;
      }
    }
    for (const opt of typeOptions) {
      if (
        projectMatchesWorksFilters(
          { sphere: item.sphere, tags: item.rawTags },
          null,
          opt.value,
        )
      ) {
        typeCounts[opt.value] = (typeCounts[opt.value] ?? 0) + 1;
      }
    }
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
    <div className="metric-works">
      <header className="ph wrap">
        <p className="cap" data-in="fade">
          {de ? "Projekte" : "Projects"} · {pad(items.length)}
        </p>
        <h1 className="d1" data-in="chars">
          {de ? (
            <>
              Ausgewählte <em>Projekte</em>
            </>
          ) : (
            <>
              Selected <em>projects</em>
            </>
          )}
        </h1>
        <div className="ph-f" data-in="up">
          <p className="cap">
            {de
              ? "Amazon-Listing-Bilder · Premium A+ · 3D"
              : "Amazon listing images · Premium A+ · 3D"}
          </p>
          <p className="lead">{home.caseStudies.subtitle}</p>
        </div>
        <WorksListingFilters
          ui={ui}
          categoryOptions={categoryOptions}
          typeOptions={typeOptions}
          category={category}
          type={type}
          pathname={localePath(locale, "/works/")}
          categoryCounts={categoryCounts}
          typeCounts={typeCounts}
          totalCount={items.length}
        />
      </header>

      <div className="wrap">
        {filtered.length ? (
          <div className="wk-g" id="wk-g">
            {filtered.map((item) => (
              <article className="wk" data-reveal="up" key={item.slug}>
                <TransitionLink
                  href={item.href}
                  className="sc-m"
                  data-cur={de ? "Fall ansehen" : "View case"}
                  {...(item.peek ? { "data-peek": item.peek } : {})}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                </TransitionLink>
                {item.tags.length ? (
                  <div className="tags">
                    {item.tags.map((tag) => (
                      <span className="tag" key={tag.slug}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                ) : null}
                <h3>{item.title}</h3>
                {item.description ? <p>{item.description}</p> : null}
                <div>
                  <TransitionLink className="lnk" href={item.href}>
                    {home.caseStudies.viewLabel}{" "}
                    <span className="ar" aria-hidden="true">
                      →
                    </span>
                  </TransitionLink>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="wk-e">
            {ui.filterEmpty}{" "}
            <TransitionLink className="lnk" href={localePath(locale, "/works/")}>
              {ui.filterClear}
            </TransitionLink>
          </p>
        )}
      </div>
    </div>
  );
}
