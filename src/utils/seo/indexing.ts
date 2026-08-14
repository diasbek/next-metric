import type { Metadata } from "next";
import { getPublicEnv } from "@/utils/env";

/** Canonical production apex + www. Staging / previews are never indexable. */
export const PRODUCTION_HOSTS = new Set([
  "metric.graphics",
  "www.metric.graphics",
]);

const NON_INDEXABLE_HOSTS = new Set([
  "metric.nocode.uz",
  "www.metric.nocode.uz",
  "localhost",
  "127.0.0.1",
]);

const PROD_SITE_FALLBACK = "https://metric.graphics";

/** Apex host (no www) used for canonical URLs and redirects. */
export function getCanonicalSiteUrl(): string {
  const raw = getPublicEnv(
    "NEXT_PUBLIC_SITE_URL",
    PROD_SITE_FALLBACK,
  ).replace(/\/$/, "");
  try {
    const parsed = new URL(raw);
    if (parsed.hostname.startsWith("www.")) {
      parsed.hostname = parsed.hostname.slice(4);
    }
    return parsed.origin;
  } catch {
    return raw.replace(/^https?:\/\/www\./i, (m) => m.replace("www.", ""));
  }
}

function hostnameFromSiteUrl(): string | null {
  try {
    return new URL(getCanonicalSiteUrl()).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** True for production deploys targeting metric.graphics (Hostinger, etc.). */
export function isIndexableDeployment(): boolean {
  const allowFlag = getPublicEnv("NEXT_PUBLIC_ALLOW_INDEXING");
  if (allowFlag === "true") return true;
  if (allowFlag === "false") return false;

  // Vercel preview / development — do not index
  if (process.env.VERCEL) {
    if (process.env.VERCEL_ENV !== "production") return false;
  } else if (process.env.NODE_ENV !== "production") {
    return false;
  }

  const host = hostnameFromSiteUrl();
  if (!host) return false;
  if (NON_INDEXABLE_HOSTS.has(host)) return false;
  if (host.endsWith(".vercel.app")) return false;

  return PRODUCTION_HOSTS.has(host);
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
