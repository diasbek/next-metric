"use client";

import { useEffect, useState } from "react";
import { FilterDropdown } from "@/components/molecules/FilterDropdown";
import type { SiteContent } from "@/i18n/types";

interface WorksListingFiltersProps {
  ui: SiteContent["ui"];
  sphereFilters: readonly string[];
  directionFilters: readonly string[];
}

export function WorksListingFilters({
  ui,
  sphereFilters,
  directionFilters,
}: WorksListingFiltersProps) {
  const [sphere, setSphere] = useState(ui.filterAll);
  const [direction, setDirection] = useState(ui.filterAll);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-work-item]");

    items.forEach((item) => {
      const itemSphere = item.dataset.sphere ?? "";
      const itemTags = (item.dataset.tags ?? "").split("|");
      const sphereMatch = sphere === ui.filterAll || itemSphere === sphere;
      const directionMatch =
        direction === ui.filterAll || itemTags.includes(direction);

      item.style.display = sphereMatch && directionMatch ? "" : "none";
    });

    window.dispatchEvent(new CustomEvent("metric:works-filter"));
  }, [sphere, direction, ui.filterAll]);

  return (
    <div className="works-filters flex flex-wrap gap-3" data-reveal-group="pop">
      <FilterDropdown
        label={ui.filterSphere}
        options={sphereFilters}
        value={sphere}
        onChange={setSphere}
        allLabel={ui.filterAll}
      />
      <FilterDropdown
        label={ui.filterDirection}
        options={directionFilters}
        value={direction}
        onChange={setDirection}
        allLabel={ui.filterAll}
      />
    </div>
  );
}
