import type { Metadata } from "next";
import { SITE_CONFIG } from "./consts";
import type { Locale } from "@/i18n/config";
import { getRobotsMetadata } from "./seo/indexing";
import { OG_IMAGE_DIMENSIONS } from "./og/paths";

const DEFAULT_OG_IMAGE = "/og/ru/home/";

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
  const url = `${SITE_CONFIG.url}${path}`;
  const imagePath = options?.image ?? DEFAULT_OG_IMAGE;
  const imageUrl = imagePath.startsWith("http")
    ? imagePath
    : `${SITE_CONFIG.url}${imagePath}`;
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
      locale: options?.ogLocale ?? "ru_RU",
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
    statusBarStyle: "black-translucent",
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
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_CONFIG.url,
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
  title: "Страница не найдена — METRIC",
  description: "Запрошенная страница не существует.",
  robots: {
    index: false,
    follow: false,
  },
};
