"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/i18n/types";
import type { WorksFilterOption } from "@/utils/works-filters";

interface WorksListingFiltersProps {
  ui: SiteContent["ui"];
  categoryOptions: readonly WorksFilterOption[];
  typeOptions: readonly WorksFilterOption[];
  category: string;
  type: string;
  pathname: string;
  categoryCounts?: Record<string, number>;
  typeCounts?: Record<string, number>;
  totalCount: number;
}

function Chip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="fb"
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
      {count != null ? <sup>{count}</sup> : null}
    </button>
  );
}

export function WorksListingFilters({
  ui,
  categoryOptions,
  typeOptions,
  category,
  type,
  pathname,
  categoryCounts = {},
  typeCounts = {},
  totalCount,
}: WorksListingFiltersProps) {
  const router = useRouter();
  const categoryValue = category || "";
  const typeValue = type || "";

  const updateFilter = useCallback(
    (key: "category" | "type", next: string) => {
      const nextCategory = key === "category" ? next : categoryValue;
      const nextType = key === "type" ? next : typeValue;
      const params = new URLSearchParams();
      if (nextCategory) params.set("category", nextCategory);
      if (nextType) params.set("type", nextType);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [categoryValue, pathname, router, typeValue],
  );

  return (
    <div className="flt" data-in="up">
      <div className="flt-r" role="group" aria-label={ui.filterSphere}>
        <span className="cap">{ui.filterSphere}</span>
        <Chip
          active={!categoryValue}
          label={ui.filterAll}
          count={totalCount}
          onClick={() => updateFilter("category", "")}
        />
        {categoryOptions.map((opt) => (
          <Chip
            key={opt.value}
            active={categoryValue === opt.value}
            label={opt.label}
            count={categoryCounts[opt.value] ?? 0}
            onClick={() => updateFilter("category", opt.value)}
          />
        ))}
      </div>
      <div className="flt-r" role="group" aria-label={ui.filterDirection}>
        <span className="cap">{ui.filterDirection}</span>
        <Chip
          active={!typeValue}
          label={ui.filterAll}
          count={null}
          onClick={() => updateFilter("type", "")}
        />
        {typeOptions.map((opt) => (
          <Chip
            key={opt.value}
            active={typeValue === opt.value}
            label={opt.label}
            count={typeCounts[opt.value] ?? 0}
            onClick={() => updateFilter("type", opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
