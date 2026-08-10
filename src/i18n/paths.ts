import { defaultLocale, type Locale } from "./config";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export function localePath(locale: Locale, path: string) {
  const normalized = normalizePath(path);
  if (locale === defaultLocale) return normalized;
  if (normalized === "/") return `/${locale}/`;
  return `/${locale}${normalized}`;
}

export function stripLocalePrefix(pathname: string): {
  locale: Locale;
  path: string;
} {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  if (normalized === "/uz/" || normalized.startsWith("/uz/")) {
    const path = normalized.slice(3) || "/";
    return { locale: "uz", path: normalizePath(path) };
  }

  if (normalized === "/en/" || normalized.startsWith("/en/")) {
    const path = normalized.slice(3) || "/";
    return { locale: "en", path: normalizePath(path) };
  }

  return { locale: "ru", path: normalizePath(normalized) };
}

export function switchLocalePath(pathname: string, targetLocale: Locale) {
  const { path } = stripLocalePrefix(pathname);
  return localePath(targetLocale, path);
}

export function getLocalizedAlternates(path: string) {
  const normalized = normalizePath(path);

  return {
    ru: localePath("ru", normalized),
    uz: localePath("uz", normalized),
    en: localePath("en", normalized),
  };
}
