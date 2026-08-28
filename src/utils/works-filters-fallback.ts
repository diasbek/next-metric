import {
  directionFilters,
  sphereFilters,
} from "@/data/filters";

/** Static allow-lists — only used when CMS taxonomy is empty. */
export const WORKS_CATEGORY_VALUES = sphereFilters.filter(
  (value) => value !== "All",
) as readonly string[];

export const WORKS_TYPE_VALUES = directionFilters.filter(
  (value) => value !== "All",
) as readonly string[];
