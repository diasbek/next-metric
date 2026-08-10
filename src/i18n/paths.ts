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
    const [base = "/", hash = ""] = path.split("#");
    const localizedBase = localePathWithoutHash(locale, base || "/");
    const withSlash =
      localizedBase.endsWith("/") || localizedBase === "/"
        ? localizedBase
        : `${localizedBase}/`;
    return `${withSlash}#${hash}`;
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

export function switchLocalePath(pathname: string, targetLocale: Locale) {
  const { path } = stripLocalePrefix(pathname);
  return localePath(targetLocale, path);
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
