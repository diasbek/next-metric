export const CANONICAL_HOST = "metric.graphics";

const APEX_ALIASES = new Set([
  "www.metric.graphics",
  "metric.agency",
  "www.metric.agency",
  "metric.uz",
  "www.metric.uz",
]);

const LEGACY_LOCALE_PREFIXES = ["en", "uz", "ru"] as const;

/** Old marketing URLs that now live on the homepage. */
const MOVED_PAGES: Record<string, string> = {
  "/agency/": "/#workflow",
  "/services/": "/#services",
  "/contacts/": "/?brief=1",
  "/de/agency/": "/de/#workflow",
  "/de/services/": "/de/#services",
  "/de/contacts/": "/de/?brief=1",
};

export function isFileLikePath(pathname: string): boolean {
  const last = pathname.split("/").filter(Boolean).pop() ?? "";
  return last.includes(".");
}

export function collapseDuplicateSlashes(pathname: string): string {
  if (!pathname) return "/";
  if (pathname === "/") return "/";
  return pathname.replace(/\/{2,}/g, "/") || "/";
}

/** HTML routes keep a trailing slash; files (sitemap.xml, favicon.ico) do not. */
export function withTrailingSlash(pathname: string): string {
  const collapsed = collapseDuplicateSlashes(pathname);
  if (collapsed === "/") return "/";
  if (isFileLikePath(collapsed)) return collapsed.replace(/\/+$/, "");
  return collapsed.endsWith("/") ? collapsed : `${collapsed}/`;
}

export function stripLegacyLocalePrefix(pathname: string): string {
  const collapsed = collapseDuplicateSlashes(pathname);
  for (const locale of LEGACY_LOCALE_PREFIXES) {
    if (collapsed === `/${locale}` || collapsed === `/${locale}/`) return "/";
    const prefix = `/${locale}/`;
    if (collapsed.startsWith(prefix)) {
      const rest = collapsed.slice(prefix.length);
      return rest ? `/${rest}` : "/";
    }
  }
  return collapsed;
}

export type CanonicalRequest = {
  /** hostname without port */
  hostname: string;
  /** ":3000" or "" */
  port: string;
  pathname: string;
  search: string;
  protocol: string;
};

export function parseHostHeader(hostHeader: string): {
  hostname: string;
  port: string;
} {
  const raw = hostHeader.split(",")[0]?.trim() ?? "";
  const [hostname = "", maybePort] = raw.split(":");
  return {
    hostname: hostname.toLowerCase(),
    port: maybePort ? `:${maybePort}` : "",
  };
}

export function getCanonicalRedirectUrl(
  request: CanonicalRequest,
): string | null {
  const { hostname } = request;
  if (!hostname) return null;

  const incomingSearch = request.search || "";
  const incomingPath = request.pathname || "/";
  const path = withTrailingSlash(
    stripLegacyLocalePrefix(collapseDuplicateSlashes(incomingPath)),
  );
  const moved = MOVED_PAGES[path];

  const isAlias = APEX_ALIASES.has(hostname);
  const isPublicApex = isAlias || hostname === CANONICAL_HOST;
  // Public hosts are always HTTPS in Location. Do not use the internal
  // request protocol — behind a reverse proxy it is often `http`, which
  // would 308 in a loop or leak http:// URLs.
  const publicProto = isPublicApex
    ? "https"
    : request.protocol.replace(/:$/, "").toLowerCase();
  const targetHost = isAlias ? CANONICAL_HOST : hostname;
  const targetPort = isAlias ? "" : request.port;
  const targetOrigin = `${publicProto}://${targetHost}${targetPort}`;
  const target =
    moved && (moved.includes("?") || moved.includes("#"))
      ? `${targetOrigin}${moved}`
      : `${targetOrigin}${path}${incomingSearch}`;

  const incoming = `${publicProto}://${hostname}${request.port}${incomingPath}${incomingSearch}`;
  if (incoming === target) return null;
  return target;
}

export function getCanonicalRedirectFromHeaders(
  headers: Headers,
  nextUrl: URL,
): string | null {
  const forwardedHost =
    headers.get("x-forwarded-host") ?? headers.get("host") ?? "";
  const { hostname, port } = parseHostHeader(forwardedHost);
  const forwardedProto = headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  return getCanonicalRedirectUrl({
    hostname,
    port,
    pathname: nextUrl.pathname,
    search: nextUrl.search,
    protocol: forwardedProto || nextUrl.protocol.replace(":", ""),
  });
}
