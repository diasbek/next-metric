import { stripLocalePrefix } from "@/i18n/paths";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  const withoutHash = path.split("#")[0] ?? path;
  return withoutHash.endsWith("/") ? withoutHash : `${withoutHash}/`;
}

function getHashSegment(value: string): string {
  const index = value.indexOf("#");
  if (index < 0) return "";
  return value.slice(index + 1).split("#")[0]?.trim() ?? "";
}

/**
 * Active nav helper. Path-only items use pathname; hash items
 * (`/#services`) also require the current location hash to match.
 */
export function isNavPathActive(
  pathname: string,
  itemPath: string,
  hash = "",
) {
  const itemHash = getHashSegment(itemPath);
  const { path } = stripLocalePrefix(pathname);
  const current = normalizePath(path);
  const targetBase = normalizePath(itemPath);

  if (itemHash) {
    if (current !== targetBase) return false;
    const currentHash = getHashSegment(
      hash.startsWith("#") ? hash : `#${hash}`,
    );
    return currentHash === itemHash;
  }

  if (targetBase === "/") {
    return current === "/" && !getHashSegment(hash);
  }

  if (targetBase === "/works/") {
    return current === "/works/" || current.startsWith("/works/");
  }

  return current === targetBase;
}
