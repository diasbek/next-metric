import type { Metadata } from "next";

/** Public origin used for canonical, Open Graph, sitemap, robots, JSON-LD. */
export const CANONICAL_SITE_URL = "https://metric.graphics";

/** Canonical production apex + www. Staging / previews are never indexable. */
export const PRODUCTION_HOSTS = new Set([
  "metric.graphics",
  "www.metric.graphics",
]);

const STAGING_HOSTS = new Set([
  "metric.nocode.uz",
  "www.metric.nocode.uz",
  "localhost",
  "127.0.0.1",
]);

/**
 * Always the live SEO host. Hostinger env (`NEXT_PUBLIC_SITE_URL`) is
 * ignored — that value cannot be changed on production and previously
 * leaked metric.nocode.uz into canonical / robots.
 */
export function getCanonicalSiteUrl(): string {
  return CANONICAL_SITE_URL;
}

export function isStagingHost(host: string | null | undefined): boolean {
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  if (!hostname) return false;
  if (STAGING_HOSTS.has(hostname)) return true;
  if (hostname.endsWith(".vercel.app")) return true;
  return false;
}

/**
 * True for Hostinger / production Node (`next start`).
 * Ignores NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_ALLOW_INDEXING — those
 * were set to staging values on the live box and cannot be edited there.
 * Vercel previews and `next dev` stay out of the index.
 */
export function isIndexableDeployment(): boolean {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }
  if (process.env.NODE_ENV === "development") return false;
  return true;
}

export function getRobotsMetadata(): Metadata["robots"] {
  if (isIndexableDeployment()) {
    return {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    };
  }

  return {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  };
}
