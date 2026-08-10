import { getPublicEnv } from "./env";
import { getCanonicalSiteUrl } from "./seo/indexing";

export const SITE_CONFIG = {
  name: "METRIC",
  title: "METRIC — брендинговое агентство",
  description:
    "Брендинговое агентство в Ташкенте. Логотип, фирменный стиль и брендбук для сильных брендов.",
  url: getCanonicalSiteUrl(),
  phone: "+998 90 000 00 00",
  email: getPublicEnv("NEXT_PUBLIC_CONTACT_EMAIL", "hello@metric.agency"),
  address: [
    "Узбекистан, Ташкент",
  ],
  map: {
    // GeoJSON / Yandex order kept for CMS consistency: [lng, lat]
    // Leaflet converts to [lat, lng] in OfficeMap.
    center: [69.279737, 41.311151] as [number, number],
    zoom: 15,
  },
  social: {
    telegram: "https://t.me/metricagency",
    instagram: "https://www.instagram.com/metricagency",
  },
  files: {
    presentation: "/files/presentation.pdf",
    brief: "/files/brief.pdf",
  },
  nav: [
    { label: "Агентство", href: "/agency/" },
    { label: "Работы", href: "/works/" },
    { label: "Услуги", href: "/services/" },
    { label: "Контакты", href: "/contacts/" },
  ],
  locales: ["ru", "uz", "en"] as const,
  defaultLocale: "ru" as const,
  themeColor: "#2600ff",
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
    title: "METRIC — брендинговое агентство",
    description:
      "Каждый бренд — это история. Логотип, фирменный стиль и брендбук в Ташкенте.",
  },
  agency: {
    title: "Агентство — METRIC",
    description:
      "Брендинговая студия из Ташкента. Помогаем бизнесу выглядеть профессионально.",
  },
  works: {
    title: "Работы — METRIC",
    description: "Портфолио брендинговых проектов METRIC.",
  },
  services: {
    title: "Услуги — METRIC",
    description: "Логотип, фирменный стиль и брендбук. Цены и сроки.",
  },
  contacts: {
    title: "Контакты — METRIC",
    description: "Свяжитесь с нами. Ответим в течение часа.",
  },
} as const;
