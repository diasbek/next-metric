import type { MetricHomeContent } from "@/data/metric-home";

function isPresentSection(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

/**
 * Merge CMS payload over static defaults; empty arrays/objects/strings do not wipe.
 * Pure module — safe to import from client components (admin preview).
 */
export function mergeMetricHome(
  base: MetricHomeContent,
  payload: Partial<MetricHomeContent>,
): MetricHomeContent {
  const next = { ...base };
  for (const key of Object.keys(base) as Array<keyof MetricHomeContent>) {
    const candidate = payload[key];
    if (isPresentSection(candidate)) {
      (next as Record<string, unknown>)[key] = candidate;
    }
  }
  return next;
}
