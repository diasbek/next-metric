/** Jump to the top instantly — used on client-side route changes without a hash. */
export function resetScrollPosition(): void {
  if (typeof window === "undefined") return;

  // "auto" would defer to the page's CSS `scroll-behavior: smooth`; the
  // direct scrollTop assignments below already force it instant, but pass
  // "instant" too so nothing here ever animates.
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Re-apply after layout/paint so Next.js cannot restore the previous offset. */
export function resetScrollPositionAfterPaint(): void {
  resetScrollPosition();
  requestAnimationFrame(() => {
    resetScrollPosition();
    requestAnimationFrame(resetScrollPosition);
  });
}

/** First hash segment only — never allow `#a#b#c` concatenations. */
export function getHashFromHref(href: string): string | null {
  const index = href.indexOf("#");
  if (index < 0) return null;
  const raw = href.slice(index + 1).trim();
  const hash = (raw.split("#")[0] ?? "").trim();
  return hash || null;
}

export function getPathnameFromHref(href: string): string {
  try {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return new URL(href).pathname || "/";
    }
  } catch {
    /* fall through */
  }
  const index = href.indexOf("#");
  const path = (index >= 0 ? href.slice(0, index) : href).trim();
  return path || "/";
}

/** Normalize pathnames for same-page comparisons (`/de` → `/de/`). */
export function normalizeClientPathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function isSameDocumentPath(href: string, pathname: string): boolean {
  return (
    normalizeClientPathname(getPathnameFromHref(href)) ===
    normalizeClientPathname(pathname)
  );
}

/**
 * Absolute same-document URL with a single hash.
 * Always built from location.pathname so hashes never stack
 * (`/#a` + `/#b` → `/#b`, never `/#a#b`).
 */
export function buildSameDocumentHashUrl(hash: string): string {
  const clean = hash.replace(/^#/, "").split("#")[0]?.trim() ?? "";
  const path = window.location.pathname || "/";
  const search = window.location.search || "";
  return clean ? `${path}${search}#${clean}` : `${path}${search}`;
}

function resolveHashTarget(hash: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const id = hash.replace(/^#/, "").split("#")[0]?.trim() ?? "";
  if (!id) return null;
  return document.getElementById(id);
}

export function scrollToHash(
  hash: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const el = resolveHashTarget(hash);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

/** Scroll to hash after layout settles (route transitions / hydration). */
export function scrollToHashAfterPaint(hash: string): void {
  const id = hash.replace(/^#/, "").split("#")[0]?.trim() ?? "";
  if (!id) return;

  const attempt = (): boolean => {
    const el = document.getElementById(id);
    if (!el) return false;
    // "auto" defers to the page's CSS `scroll-behavior` (smooth here), so a
    // "jump straight to it" call would silently animate over 1-2s instead —
    // and get restarted/cut short by the next settle call in the boot
    // sequence, landing well short of the target. "instant" always jumps,
    // regardless of CSS.
    el.scrollIntoView({ behavior: "instant", block: "start" });
    return true;
  };

  if (attempt()) return;

  requestAnimationFrame(() => {
    if (attempt()) return;
    requestAnimationFrame(() => {
      attempt();
      setTimeout(attempt, 50);
    });
  });
}

/** Replace stacked hashes in the address bar, then scroll to the last valid id. */
export function sanitizeLocationHash(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return null;
  if (!raw.includes("#")) return raw;

  const segments = raw.split("#").map((part) => part.trim()).filter(Boolean);
  const last = segments[segments.length - 1] ?? null;
  if (!last) return null;

  window.history.replaceState(
    null,
    "",
    buildSameDocumentHashUrl(last),
  );
  return last;
}

/** In-page section jump without Next.js router / page transitions. */
export function navigateSameDocumentHash(hash: string): void {
  const clean = hash.replace(/^#/, "").split("#")[0]?.trim() ?? "";
  if (!clean) return;
  window.history.pushState(null, "", buildSameDocumentHashUrl(clean));
  scrollToHash(clean, "smooth");
}

/** Top of page or in-page hash, depending on the current location. */
export function settleScrollAfterNavigation(href?: string): void {
  const sanitized = sanitizeLocationHash();
  const hash =
    (href ? getHashFromHref(href) : null) ??
    sanitized ??
    (typeof window !== "undefined"
      ? window.location.hash.replace(/^#/, "").split("#")[0] || null
      : null);

  if (hash) {
    scrollToHashAfterPaint(hash);
    return;
  }

  resetScrollPositionAfterPaint();
}
