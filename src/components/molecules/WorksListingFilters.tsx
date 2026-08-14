"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterDropdown } from "@/components/molecules/FilterDropdown";
import type { SiteContent } from "@/i18n/types";

interface WorksListingFiltersProps {
  ui: SiteContent["ui"];
  categoryOptions: readonly string[];
  typeOptions: readonly string[];
}

export function WorksListingFilters({
  ui,
  categoryOptions,
  typeOptions,
}: WorksListingFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category")?.trim() || ui.filterAll;
  const type = searchParams.get("type")?.trim() || ui.filterAll;

  const updateFilter = useCallback(
    (key: "category" | "type", next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!next || next === ui.filterAll) params.delete(key);
      else params.set(key, next);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, ui.filterAll],
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
            categoryOptions.includes(category) || category === ui.filterAll
              ? category
              : ui.filterAll
          }
          onChange={(value) => updateFilter("category", value)}
          allLabel={ui.filterAll}
        />
        <FilterDropdown
          label={ui.filterDirection}
          options={[ui.filterAll, ...typeOptions]}
          value={
            typeOptions.includes(type) || type === ui.filterAll
              ? type
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
