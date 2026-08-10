import { stripLocalePrefix } from "@/i18n/paths";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function isNavPathActive(pathname: string, itemPath: string) {
  const { path } = stripLocalePrefix(pathname);
  const current = normalizePath(path);
  const target = normalizePath(itemPath);

  if (target === "/") {
    return current === "/";
  }

  if (target === "/works/") {
    return current === "/works/" || current.startsWith("/works/");
  }

  return current === target;
}
