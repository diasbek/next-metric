import { defaultLocale, locales, type Locale } from "./config";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function localePathWithoutHash(locale: Locale, path: string): string {
  const normalized = normalizePath(path);
  if (locale === defaultLocale) return normalized;
  if (normalized === "/") return `/${locale}/`;
  return `/${locale}${normalized}`;
}

export function localePath(locale: Locale, path: string): string {
  if (path.includes("#")) {
    const hashIndex = path.indexOf("#");
    const base = path.slice(0, hashIndex) || "/";
    const hash = path.slice(hashIndex + 1).split("#")[0] ?? "";
    const localizedBase = localePathWithoutHash(locale, base || "/");
    const withSlash =
      localizedBase.endsWith("/") || localizedBase === "/"
        ? localizedBase
        : `${localizedBase}/`;
    return hash ? `${withSlash}#${hash}` : withSlash;
  }

  return localePathWithoutHash(locale, path);
}

export function stripLocalePrefix(pathname: string): {
  locale: Locale;
  path: string;
} {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    const prefix = `/${locale}/`;
    if (normalized === prefix || normalized.startsWith(prefix)) {
      const path = normalized.slice(prefix.length - 1) || "/";
      return { locale, path: normalizePath(path) };
    }
  }

  return { locale: defaultLocale, path: normalizePath(normalized) };
}

export function switchLocalePath(
  pathname: string,
  targetLocale: Locale,
  hash?: string | null,
) {
  const withoutHash = pathname.split("#")[0] ?? pathname;
  const { path } = stripLocalePrefix(withoutHash);
  const cleanHash =
    typeof hash === "string"
      ? hash.replace(/^#/, "").split("#")[0]?.trim() ?? ""
      : "";
  return localePath(
    targetLocale,
    cleanHash ? `${path}#${cleanHash}` : path,
  );
}

export function getLocalizedAlternates(path: string) {
  const normalized = normalizePath(path);
  const alternates: Record<string, string> = {
    "x-default": localePath(defaultLocale, normalized),
  };

  for (const locale of locales) {
    alternates[locale] = localePath(locale, normalized);
  }

  return alternates;
}
