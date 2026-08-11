export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function readString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === "string" ? v : "";
}

export function readStringArray(
  obj: Record<string, unknown>,
  key: string,
): string[] {
  const v = obj[key];
  return Array.isArray(v) ? v.map((item) => String(item ?? "")) : [];
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function patchSection(
  payload: Record<string, unknown>,
  section: string,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...payload,
    [section]: {
      ...asRecord(payload[section]),
      ...patch,
    },
  };
}

export function replaceSection(
  payload: Record<string, unknown>,
  section: string,
  next: unknown,
): Record<string, unknown> {
  return {
    ...payload,
    [section]: next,
  };
}

export const METRIC_HOME_SECTIONS = [
  "hero",
  "trust",
  "categories",
  "case-studies",
  "services",
  "workflow",
  "faq",
  "nav-footer",
  "advanced",
] as const;

export type MetricHomeSectionId = (typeof METRIC_HOME_SECTIONS)[number];

export function isMetricHomeSection(value: string): value is MetricHomeSectionId {
  return (METRIC_HOME_SECTIONS as readonly string[]).includes(value);
}
