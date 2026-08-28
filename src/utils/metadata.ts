import type { Metadata } from "next";
import { SITE_CONFIG } from "./consts";
import type { Locale } from "@/i18n/config";
import { withTrailingSlash } from "./seo/canonical-request";
import { getRobotsMetadata } from "./seo/indexing";
import { OG_IMAGE_DIMENSIONS, getDefaultOgImagePath } from "./og/paths";

const DEFAULT_OG_IMAGE = getDefaultOgImagePath();

function origin(): string {
  return SITE_CONFIG.url.replace(/\/$/, "");
}

/** Absolute page URL on the canonical origin, always with a trailing slash. */
export function canonicalPageUrl(path = ""): string {
  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf("?");
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  return `${origin()}${withTrailingSlash(pathname || "/")}${search}${hash}`;
}

export function createPageMetadata(
  title: string,
  description: string,
  path = "",
  options?: {
    image?: string;
    locale?: Locale;
    ogLocale?: string;
    alternates?: Record<string, string>;
    type?: "website" | "article";
    modifiedTime?: string;
    keywords?: string;
    robots?: Metadata["robots"];
  },
): Metadata {
  const url = canonicalPageUrl(path);
  const imagePath = options?.image ?? DEFAULT_OG_IMAGE;
  const imageUrl = imagePath.startsWith("http")
    ? imagePath
    : `${origin()}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  const modifiedTime = options?.modifiedTime;
  const keywords = options?.keywords
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    title: { absolute: title },
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: url,
      ...(options?.alternates ? { languages: options.alternates } : {}),
    },
    robots: options?.robots ?? getRobotsMetadata(),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: options?.ogLocale ?? "en_US",
      type: options?.type ?? "website",
      ...(modifiedTime ? { modifiedTime } : {}),
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: OG_IMAGE_DIMENSIONS.width,
          height: OG_IMAGE_DIMENSIONS.height,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    ...(modifiedTime
      ? {
          other: {
            "og:updated_time": modifiedTime,
          },
        }
      : {}),
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: SITE_CONFIG.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  manifest: "/manifest.json",
  robots: getRobotsMetadata(),
  alternates: {
    canonical: canonicalPageUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: canonicalPageUrl("/"),
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}${DEFAULT_OG_IMAGE}`,
        secureUrl: `${SITE_CONFIG.url}${DEFAULT_OG_IMAGE}`,
        width: OG_IMAGE_DIMENSIONS.width,
        height: OG_IMAGE_DIMENSIONS.height,
        alt: SITE_CONFIG.name,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}${DEFAULT_OG_IMAGE}`,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  other: {
    "theme-color": SITE_CONFIG.themeColor,
  },
};

export const notFoundMetadata: Metadata = {
  title: "Page not found — METRIC",
  description: "The requested page does not exist.",
  robots: {
    index: false,
    follow: false,
  },
};
