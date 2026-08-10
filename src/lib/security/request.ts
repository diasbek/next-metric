/** Never leak internal/DB errors to anonymous clients. */
export function publicErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

export function clampText(value: string, max: number): string {
  return value.slice(0, max);
}

export function isAllowedOrigin(
  request: Request,
  allowed: string[],
): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "none") {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (!origin && !referer) {
    // Prefer denying bare requests without browser context in production
    return process.env.NODE_ENV !== "production";
  }
  const candidates = [origin, referer].filter(Boolean) as string[];
  return candidates.some((value) => {
    try {
      const href = new URL(value).origin;
      return allowed.some((a) => a === href);
    } catch {
      return false;
    }
  });
}
