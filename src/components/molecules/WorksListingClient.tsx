"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MetricCaseCard } from "@/components/molecules/MetricCaseCard";
import { WorksListingFilters } from "@/components/molecules/WorksListingFilters";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import { projectMatchesWorksFilters } from "@/utils/works-filters";

export type WorksListingItem = {
  slug: string;
  href: string;
  tags: readonly string[];
  quote: string;
  author: string;
  role: string;
  image: string;
  imageAlt: string;
  sphere: string;
};

type WorksListingClientProps = {
  locale: Locale;
  ui: SiteContent["ui"];
  categoryOptions: readonly string[];
  typeOptions: readonly string[];
  items: readonly WorksListingItem[];
  viewLabel: string;
};

export function WorksListingClient({
  locale,
  ui,
  categoryOptions,
  typeOptions,
  items,
  viewLabel,
}: WorksListingClientProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category")?.trim() || "";
  const type = searchParams.get("type")?.trim() || "";

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        projectMatchesWorksFilters(
          { sphere: item.sphere, tags: item.tags },
          category || null,
          type || null,
        ),
      ),
    [items, category, type],
  );

  return (
    <>
      <WorksListingFilters
        ui={ui}
        categoryOptions={categoryOptions}
        typeOptions={typeOptions}
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
              viewLabel={viewLabel}
            />
          ))}
        </div>
      ) : (
        <p className="works-filters__empty" data-reveal>
          {ui.filterEmpty}
        </p>
      )}
    </>
  );
}
