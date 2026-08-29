import type { MetricHomeContent } from "@/data/metric-home";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPresentScalar(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

/**
 * Deep-merge one homepage section. Explicit arrays in the CMS payload always
 * win — including `[]` — so clearing Home → Case studies actually removes
 * cards instead of falling back to static defaults.
 */
function mergeSection(
  base: Record<string, unknown>,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...base };
  for (const key of Object.keys(payload)) {
    const candidate = payload[key];
    if (candidate === undefined) continue;

    if (Array.isArray(candidate)) {
      next[key] = candidate;
      continue;
    }

    if (isPlainObject(candidate) && isPlainObject(next[key])) {
      next[key] = mergeSection(next[key], candidate);
      continue;
    }

    if (isPresentScalar(candidate)) {
      next[key] = candidate;
    }
  }
  return next;
}

/**
 * Merge CMS payload over static defaults.
 * - Empty strings do not wipe defaults.
 * - Explicit arrays (including empty `caseStudies.items`) always win.
 */
export function mergeMetricHome(
  base: MetricHomeContent,
  payload: Partial<MetricHomeContent>,
): MetricHomeContent {
  const next = { ...base };
  for (const key of Object.keys(base) as Array<keyof MetricHomeContent>) {
    const candidate = payload[key];
    if (candidate === undefined || candidate === null) continue;

    const current = next[key];
    if (Array.isArray(candidate)) {
      (next as Record<string, unknown>)[key] = candidate;
      continue;
    }

    if (isPlainObject(candidate) && isPlainObject(current)) {
      (next as Record<string, unknown>)[key] = mergeSection(
        current as Record<string, unknown>,
        candidate,
      );
      continue;
    }

    if (isPresentScalar(candidate)) {
      (next as Record<string, unknown>)[key] = candidate;
    }
  }
  return next;
}

/** `items` from a CMS home payload when the key is present (even if `[]`). */
export function caseStudyItemsFromPayload(
  payload: Partial<MetricHomeContent> | Record<string, unknown> | null | undefined,
): MetricHomeContent["caseStudies"]["items"] | null {
  if (!payload || typeof payload !== "object") return null;
  const caseStudies = (payload as { caseStudies?: unknown }).caseStudies;
  if (!caseStudies || typeof caseStudies !== "object" || Array.isArray(caseStudies)) {
    return null;
  }
  const items = (caseStudies as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  return items as MetricHomeContent["caseStudies"]["items"];
}
