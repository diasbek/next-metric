import type { Metadata } from "next";
import { getPublicEnv } from "@/utils/env";

const PRODUCTION_HOSTS = new Set(["metric.agency", "www.metric.agency"]);

/** Apex host (no www) used for canonical URLs and redirects. */
export function getCanonicalSiteUrl(): string {
  const raw = getPublicEnv(
    "NEXT_PUBLIC_SITE_URL",
    "https://metric.agency",
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

/** True for production deploys targeting metric.agency (Hostinger, etc.). */
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

  try {
    const host = new URL(getCanonicalSiteUrl()).hostname.toLowerCase();
    return PRODUCTION_HOSTS.has(host);
  } catch {
    return false;
  }
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
