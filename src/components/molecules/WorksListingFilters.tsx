"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FilterDropdown } from "@/components/molecules/FilterDropdown";
import type { SiteContent } from "@/i18n/types";

interface WorksListingFiltersProps {
  ui: SiteContent["ui"];
  categoryOptions: readonly string[];
  typeOptions: readonly string[];
  category: string;
  type: string;
  pathname: string;
}

export function WorksListingFilters({
  ui,
  categoryOptions,
  typeOptions,
  category,
  type,
  pathname,
}: WorksListingFiltersProps) {
  const router = useRouter();
  const categoryValue = category || ui.filterAll;
  const typeValue = type || ui.filterAll;

  const updateFilter = useCallback(
    (key: "category" | "type", next: string) => {
      const nextCategory = key === "category" ? next : categoryValue;
      const nextType = key === "type" ? next : typeValue;
      const params = new URLSearchParams();
      if (nextCategory && nextCategory !== ui.filterAll) {
        params.set("category", nextCategory);
      }
      if (nextType && nextType !== ui.filterAll) {
        params.set("type", nextType);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [categoryValue, pathname, router, typeValue, ui.filterAll],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActive =
    (category && category !== ui.filterAll) || (type && type !== ui.filterAll);

  return (
    <div className="works-filters" data-reveal>
      <div className="works-filters__row">
        <FilterDropdown
          label={ui.filterSphere}
          options={[ui.filterAll, ...categoryOptions]}
          value={
            categoryOptions.includes(categoryValue) || categoryValue === ui.filterAll
              ? categoryValue
              : ui.filterAll
          }
          onChange={(value) => updateFilter("category", value)}
          allLabel={ui.filterAll}
        />
        <FilterDropdown
          label={ui.filterDirection}
          options={[ui.filterAll, ...typeOptions]}
          value={
            typeOptions.includes(typeValue) || typeValue === ui.filterAll
              ? typeValue
              : ui.filterAll
          }
          onChange={(value) => updateFilter("type", value)}
          allLabel={ui.filterAll}
        />
        {hasActive ? (
          <button
            type="button"
            className="works-filters__clear"
            onClick={clearFilters}
          >
            {ui.filterClear}
          </button>
        ) : null}
      </div>
    </div>
  );
}
