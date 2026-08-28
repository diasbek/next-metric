/**
 * Locale string fallbacks: prefer the active locale, then EN when empty.
 * Safe for client + server (no Node-only APIs).
 */

export function coalesceLocalized(
  ...values: Array<string | null | undefined>
): string {
  for (const value of values) {
    const trimmed = (value ?? "").trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Deep-merge: keep `primary` structure, but replace empty strings with
 * values from `fallback` (typically the EN locale). Arrays of objects are
 * merged by index; scalar arrays prefer primary when non-empty.
 */
export function deepFallbackEmpty<T>(primary: T, fallback: T): T {
  if (primary === fallback) return primary;

  if (typeof primary === "string" || typeof fallback === "string") {
    const p = typeof primary === "string" ? primary.trim() : "";
    if (p) return primary;
    return (fallback as T) ?? primary;
  }

  if (Array.isArray(primary)) {
    if (!Array.isArray(fallback) || fallback.length === 0) return primary;
    if (primary.length === 0) return fallback as T;
    const length = Math.max(primary.length, fallback.length);
    const next: unknown[] = [];
    for (let i = 0; i < length; i += 1) {
      const a = primary[i];
      const b = fallback[i];
      if (a === undefined) {
        next.push(b);
        continue;
      }
      if (b === undefined) {
        next.push(a);
        continue;
      }
      next.push(deepFallbackEmpty(a, b));
    }
    return next as T;
  }

  if (isPlainObject(primary) && isPlainObject(fallback)) {
    const keys = new Set([...Object.keys(primary), ...Object.keys(fallback)]);
    const next: Record<string, unknown> = { ...primary };
    for (const key of keys) {
      if (!(key in primary)) {
        next[key] = fallback[key];
        continue;
      }
      if (!(key in fallback)) continue;
      next[key] = deepFallbackEmpty(primary[key], fallback[key]);
    }
    return next as T;
  }

  if (primary == null || primary === "") return fallback;
  return primary;
}

export function pickTranslationRow<T extends { locale?: string }>(
  rows: T[] | null | undefined,
  locale: string,
): { primary: T | undefined; en: T | undefined } {
  const list = Array.isArray(rows) ? rows : [];
  return {
    primary: list.find((row) => row.locale === locale),
    en: list.find((row) => row.locale === "en"),
  };
}
