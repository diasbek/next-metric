import { getPublicEnv } from "./env";
import { getCanonicalSiteUrl } from "./seo/indexing";

export const SITE_CONFIG = {
  name: "METRIC",
  title: "METRIC — Amazon listing images & A+ Content",
  description:
    "Strategic Amazon listing images and A+ Content designed to communicate value, inspire confidence, and turn attention into sales.",
  url: getCanonicalSiteUrl(),
  // TODO: replace phone + social homepage stubs with real Metric contacts before launch.
  phone: "+987 778 99 88",
  email: getPublicEnv("NEXT_PUBLIC_CONTACT_EMAIL", "hello@metric.agency"),
  // Mirrors footer city list until a confirmed HQ address is provided.
  address: ["London", "New York", "Austin", "Berlin"],
  map: {
    center: [69.279737, 41.311151] as [number, number],
    zoom: 15,
  },
  social: {
    telegram: "https://t.me/metricagency",
    instagram: "https://www.instagram.com/metricagency",
    linkedin: "https://www.linkedin.com/",
    x: "https://x.com/",
    facebook: "https://www.facebook.com/",
  },
  files: {
    presentation: "/files/presentation.pdf",
    brief: "/files/brief.pdf",
  },
  nav: [
    { label: "Projects", href: "/#projects" },
    { label: "Case Studies", href: "/#case-studies" },
    { label: "Services", href: "/#services" },
    { label: "Workflow", href: "/#workflow" },
    { label: "FAQ", href: "/#faq" },
  ],
  // Labels mirrored in getMetricHome(locale).nav for DE.
  locales: ["en", "de"] as const,
  defaultLocale: "en" as const,
  themeColor: "#ff3c82",
  analytics: {
    yandexMetrikaId: getPublicEnv("NEXT_PUBLIC_YM_ID"),
    googleAnalyticsId: getPublicEnv("NEXT_PUBLIC_GA_ID"),
    googleTagManagerId: getPublicEnv("NEXT_PUBLIC_GTM_ID"),
  },
  seo: {
    googleSiteVerification: getPublicEnv("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"),
    yandexSiteVerification: getPublicEnv("NEXT_PUBLIC_YANDEX_SITE_VERIFICATION"),
  },
  build: {
    staticFilesDir: "public",
  },
} as const;

export const PAGE_META = {
  home: {
    title: "METRIC — Amazon listing images & A+ Content",
    description:
      "On Amazon, customers buy with their eyes first. Strategic listing images and A+ Content that turn attention into sales.",
  },
  agency: {
    title: "About — METRIC",
    description: "Amazon design partner for listing images, A+ Content, and Brand Stores.",
  },
  works: {
    title: "Projects — METRIC",
    description: "Amazon listing and A+ Content case studies by METRIC.",
  },
  services: {
    title: "Services — METRIC",
    description: "Product images, A+ Content, Ad Banner, and Brand Store design.",
  },
  contacts: {
    title: "Contact — METRIC",
    description: "Start your Amazon design project with METRIC.",
  },
} as const;
