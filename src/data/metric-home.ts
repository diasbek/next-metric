import type { Locale } from "@/i18n/config";

const PROTO_CAT_IMAGES = [
  "/images/metric/proto/c1.webp",
  "/images/metric/proto/c2.webp",
  "/images/metric/proto/c3.webp",
  "/images/metric/proto/c4.webp",
  "/images/metric/proto/c5.webp",
  "/images/metric/proto/c6.webp",
  "/images/metric/proto/c7.webp",
  "/images/metric/proto/c8.webp",
  "/images/metric/proto/c9.webp",
] as const;

const CASE_LINEUP = [
  "impact-pro-mount-360",
  "impact-flexlock",
  "nurada-garage-protection",
  "klipp-nagelknipser",
  "qorux-bamboo-socks",
] as const;

const metricHomeEn = {
  hero: {
    titleLine1: "On Amazon, customers buy with their",
    titleLine2: "eyes first.",
    subtitle:
      "Strategic Amazon listing images and A+ Content designed to communicate value, inspire confidence, and turn attention into sales.",
    cta: "Build a stronger listing",
    hint: "Move the cursor: your gaze leaves heat",
    badgeValue: "9.5%",
    badgeLabel: "Click-through rate:",
    redesignLabel: "Metric Redesign",
    redesignValue: "22%",
    redesignDelta: "+132% CTR",
    redesignCaption: "Click-through rate:",
    product1: "/images/metric/hero/product-1.jpg",
    product2: "/images/metric/hero/product-2.jpg",
  },
  trust: [
    {
      kind: "spn" as const,
      label: "Official service partner",
      text: "An official partner in the Amazon Service Provider Network.",
      icon: "/images/metric/icons/spn.svg",
    },
    {
      kind: "reviews" as const,
      label: "Verified client reviews",
      value: "5.0",
      text: "Excellent: 5.0 out of 5 on Trustpilot.",
      icon: "/images/metric/icons/trustpilot.svg",
    },
    {
      kind: "stat" as const,
      label: "Sellers served",
      value: "800",
      suffix: "+",
      text: "Amazon sellers and brands we have worked with.",
      num: 800,
    },
    {
      kind: "stat" as const,
      label: "Click-through rate",
      value: "132",
      prefix: "+",
      suffix: "%",
      text: "9.5% → 22% CTR after a Metric redesign.",
      num: 132,
    },
  ],
  categories: {
    titleLines: [
      "We help turn products into",
      {
        prefix: "",
        accent: "Amazon bestsellers",
        suffix: " across categories.",
        icon: true,
      },
    ],
    lead:
      "Main images from Metric projects in home, beauty, automotive, apparel, sports and more. Drag the ring, or just scroll.",
    images: [...PROTO_CAT_IMAGES],
  },
  caseStudies: {
    title: "See how better visuals drive real Amazon results.",
    titleAccent: "Amazon results.",
    subtitle:
      "Explore how strategic Amazon listing images and A+ Content helped brands attract more attention, communicate value more clearly, and improve conversion.",
    moreLabel: "More projects",
    viewLabel: "View case study",
    items: CASE_LINEUP.map((slug) => ({
      slug,
      tags: [] as string[],
      quote: "",
      author: "",
      role: "",
      description: "",
      image: "",
    })),
  },
  services: {
    id: "services",
    titleLines: ["Everything your Amazon brand needs to convert"],
    titleSuffix: "",
    titleBracket: "[in one place]",
    subtitle:
      "Amazon listing images, A+ Content, Brand Stores, and advertising creatives built as one consistent visual system.",
    cta: "Book a free concept call",
    alsoLabel: "Also on request",
    also: [
      "3D product visualization",
      "Existing listing redesign",
      "Complete Amazon brand design",
      "Ongoing design support",
    ],
    tellUs: "Tell us about your product",
    items: [
      {
        n: "1",
        title: "Product images",
        body: "Main image, infographics and lifestyle scenes: the gallery that has to sell before anyone reads a word.",
        image: "/images/metric/services/svc-1.png",
      },
      {
        n: "2",
        title: "A+ Content",
        body: "Standard and Premium A+ modules that tell the brand story under the buy box and answer the last questions.",
        image: "/images/metric/services/svc-2.png",
      },
      {
        n: "3",
        title: "Ad-Banner",
        body: "Sponsored Brands and display creatives in the same visual language as the listing they send traffic to.",
        image: "/images/metric/services/svc-3.png",
      },
      {
        n: "4",
        title: "BrandStore",
        body: "A Brand Store that brings the catalogue together and keeps shoppers inside your brand.",
        image: "/images/metric/services/svc-4.png",
      },
    ],
  },
  band: {
    rowA: [
      "Listing images",
      "A+ Content",
      "Brand Store",
      "Ad banners",
      "3D modeling",
    ],
    rowB: [
      "Main images",
      "Infographics",
      "Lifestyle scenes",
      "A+ modules",
      "Brand Store",
      "Ad creatives",
      "3D renders",
      "Ready for Seller Central",
    ],
  },
  workflow: {
    id: "workflow",
    titleLine1: "That’s how",
    titleLine2: "Metric are made",
    subtitle:
      "Unique visual worlds — hand-drawn. Every listing gets its own composition, built around what the shopper needs to see first.",
    cta: "Let’s talk",
    note: "We’d be happy to present more projects in a personal call.",
    cards: [
      {
        title: "Launching has never been this easy!",
        body: "The product achieved bestseller status within just one week, supported by its distinctive composition and high-quality imagery.",
        image: "/images/metric/workflow/wf-1.png",
        layout: "media-top" as const,
        k: "1 week",
        kl: "to bestseller",
      },
      {
        title: "A consistent bestseller and Amazon’s Choice",
        body: "Achieving a consistent conversion rate of 41% through image content tailored to the target audience and relevant to customers.",
        image: "/images/metric/workflow/wf-2.png",
        layout: "media-bottom" as const,
        k: "41%",
        kl: "conversion rate",
      },
      {
        title: "Launch your first product with confidence",
        body: "Strategic visuals that make your product easy to understand — and easier to choose.",
        image: "/images/metric/workflow/wf-3.png",
        layout: "media-top" as const,
        k: "",
        kl: "",
      },
    ],
  },
  faq: {
    id: "faq",
    title: "FAQ",
    subtitle:
      "The most important answers about our Amazon product images, videos, and services.",
  },
  footer: {
    cities: ["London", "New York", "Austin", "Berlin"],
    links: [{ label: "Privacy Policy", href: "/privacy/" }],
    social: [
      { label: "Upwork", key: "upwork" as const },
      { label: "LinkedIn", key: "linkedin" as const },
      { label: "Instagram", key: "instagram" as const },
      { label: "Facebook", key: "facebook" as const },
    ],
    startCta: "Start your project",
  },
  nav: [
    { label: "Projects", href: "/works/" },
    { label: "Case studies", href: "/#cases" },
    { label: "Services", href: "/#services" },
    { label: "Workflow", href: "/#workflow" },
    { label: "FAQ", href: "/#faq" },
  ],
  process: {
    title: "From brief to final files in 7 business days",
    titleAccent: "7 business days",
    note: "Most projects · 3D, Premium A+ and Brand Store work can take longer",
    steps: [
      {
        h: "Brief",
        p: "A short brief on the product, the audience and the result you want.",
      },
      {
        h: "Concept",
        p: "A visual direction for the whole listing before production starts.",
      },
      {
        h: "Production",
        p: "3D, photo work, infographics and copy built as one system.",
      },
      {
        h: "Revisions",
        p: "Structured feedback rounds against clear milestones.",
      },
      { h: "Final delivery", p: "Files ready for Seller Central." },
    ],
  },
  ctr: {
    kicker: "Same product · new visuals",
    title: "Better images. More clicks.",
    titleAccent: "More clicks.",
    body: "The same listing before and after a Metric redesign: the click-through rate went from 9.5% to 22%. Shoppers decide in the search results, long before they read a bullet point.",
    beforeLabel: "Before",
    afterLabel: "Metric redesign",
  },
} as const;

const metricHomeDe = {
  ...metricHomeEn,
  hero: {
    ...metricHomeEn.hero,
    titleLine1: "Auf Amazon kaufen Kunden zuerst mit den",
    titleLine2: "Augen.",
    subtitle:
      "Strategische Amazon-Listing-Bilder und A+ Content, die Wert kommunizieren, Vertrauen schaffen und Aufmerksamkeit in Umsatz verwandeln.",
    cta: "Stärkeres Listing aufbauen",
    hint: "Tippen Sie die Ergebnisse, um den Blick zu steuern",
    badgeLabel: "Klickrate:",
    redesignLabel: "Metric Redesign",
    redesignCaption: "Klickrate:",
  },
  trust: [
    {
      kind: "spn" as const,
      label: "Offizieller Servicepartner",
      text: "Offizieller Partner im Amazon Service Provider Network.",
      icon: "/images/metric/icons/spn.svg",
    },
    {
      kind: "reviews" as const,
      label: "Verifizierte Kundenbewertungen",
      value: "5.0",
      text: "Ausgezeichnet: 5,0 von 5 bei Trustpilot.",
      icon: "/images/metric/icons/trustpilot.svg",
    },
    {
      kind: "stat" as const,
      label: "Betreute Seller",
      value: "800",
      suffix: "+",
      text: "Amazon-Seller und Marken, mit denen wir gearbeitet haben.",
      num: 800,
    },
    {
      kind: "stat" as const,
      label: "Klickrate",
      value: "132",
      prefix: "+",
      suffix: "%",
      text: "9,5 % → 22 % CTR nach einem Metric-Redesign.",
      num: 132,
    },
  ],
  categories: {
    titleLines: [
      "Wir machen Produkte zu",
      {
        prefix: "",
        accent: "Amazon-Bestsellern",
        suffix: " in allen Kategorien.",
        icon: true,
      },
    ],
    lead:
      "Hauptbilder aus Metric-Projekten in Haushalt, Beauty, Auto, Mode, Sport und mehr. Ziehen Sie den Ring oder scrollen Sie einfach.",
    images: [...PROTO_CAT_IMAGES],
  },
  caseStudies: {
    title: "So sorgen bessere Visuals für echte Amazon-Ergebnisse.",
    titleAccent: "Amazon-Ergebnisse.",
    subtitle:
      "Entdecken Sie, wie strategische Amazon-Listing-Bilder und A+ Content Marken geholfen haben, mehr Aufmerksamkeit zu gewinnen, Mehrwert klarer zu vermitteln und die Conversion zu steigern.",
    moreLabel: "Weitere Projekte",
    viewLabel: "Fallstudie ansehen",
    items: CASE_LINEUP.map((slug) => ({
      slug,
      tags: [] as string[],
      quote: "",
      author: "",
      role: "",
      description: "",
      image: "",
    })),
  },
  services: {
    ...metricHomeEn.services,
    titleLines: ["Alles, was Ihre Amazon-Marke zum Verkaufen braucht"],
    titleSuffix: "",
    titleBracket: "[an einem Ort]",
    subtitle:
      "Amazon-Listing-Bilder, A+ Content, Brand Stores und Werbe-Creatives als ein konsistentes visuelles System.",
    cta: "Kostenloses Konzeptgespräch buchen",
    alsoLabel: "Auf Anfrage",
    also: [
      "3D-Produktvisualisierung",
      "Redesign bestehender Listings",
      "Komplettes Amazon-Markendesign",
      "Laufende Design-Betreuung",
    ],
    tellUs: "Erzählen Sie uns von Ihrem Produkt",
    items: [
      {
        n: "1",
        title: "Produktbilder",
        body: "Hauptbild, Infografiken und Lifestyle-Szenen: die Galerie, die verkaufen muss, bevor jemand ein Wort liest.",
        image: "/images/metric/services/svc-1.png",
      },
      {
        n: "2",
        title: "A+ Content",
        body: "Standard- und Premium-A+-Module, die unter der Buy Box die Markengeschichte erzählen und die letzten Fragen beantworten.",
        image: "/images/metric/services/svc-2.png",
      },
      {
        n: "3",
        title: "Anzeigen-Banner",
        body: "Sponsored-Brands- und Display-Creatives in derselben visuellen Sprache wie das Listing, auf das sie Traffic lenken.",
        image: "/images/metric/services/svc-3.png",
      },
      {
        n: "4",
        title: "BrandStore",
        body: "Ein Brand Store, der den Katalog zusammenführt und Käufer in Ihrer Marke hält.",
        image: "/images/metric/services/svc-4.png",
      },
    ],
  },
  band: {
    rowA: [
      "Listing-Bilder",
      "A+ Content",
      "Brand Store",
      "Anzeigenbanner",
      "3D-Modellierung",
    ],
    rowB: [
      "Hauptbilder",
      "Infografiken",
      "Lifestyle-Szenen",
      "A+-Module",
      "Brand Store",
      "Werbe-Creatives",
      "3D-Renderings",
      "Bereit für Seller Central",
    ],
  },
  workflow: {
    ...metricHomeEn.workflow,
    titleLine1: "So entstehen",
    titleLine2: "Metric-Visuals",
    subtitle:
      "Einzigartige visuelle Welten — von Hand gezeichnet. Jedes Listing erhält eine eigene Komposition, aufgebaut um das, was der Käufer zuerst sehen muss.",
    cta: "Lassen Sie uns sprechen",
    note: "Gerne stellen wir weitere Projekte in einem persönlichen Gespräch vor.",
    cards: [
      {
        title: "Der Start war noch nie so einfach!",
        body: "Das Produkt erreichte bereits innerhalb einer Woche den Bestseller-Status – dank seiner markanten Komposition und hochwertigen Bildsprache.",
        image: "/images/metric/workflow/wf-1.png",
        layout: "media-top" as const,
        k: "1 Woche",
        kl: "bis zum Bestseller",
      },
      {
        title: "Dauerhafter Bestseller und Amazon’s Choice",
        body: "Eine konstante Conversion-Rate von 41 % durch zielgruppengerechte Bildinhalte, die für Kunden relevant sind.",
        image: "/images/metric/workflow/wf-2.png",
        layout: "media-bottom" as const,
        k: "41%",
        kl: "Conversion-Rate",
      },
      {
        title: "Starten Sie Ihr erstes Produkt mit Zuversicht",
        body: "Strategische Visuals, die Ihr Produkt leicht verständlich machen – und leichter wählbar.",
        image: "/images/metric/workflow/wf-3.png",
        layout: "media-top" as const,
        k: "",
        kl: "",
      },
    ],
  },
  faq: {
    id: "faq",
    title: "FAQ",
    subtitle:
      "Die wichtigsten Antworten zu unseren Amazon-Produktbildern, Videos und Leistungen.",
  },
  footer: {
    ...metricHomeEn.footer,
    links: [{ label: "Datenschutz", href: "/privacy/" }],
    startCta: "Projekt starten",
  },
  nav: [
    { label: "Projekte", href: "/works/" },
    { label: "Fallstudien", href: "/#cases" },
    { label: "Leistungen", href: "/#services" },
    { label: "Ablauf", href: "/#workflow" },
    { label: "FAQ", href: "/#faq" },
  ],
  process: {
    title: "Vom Briefing bis zu den fertigen Dateien in 7 Werktagen",
    titleAccent: "7 Werktagen",
    note: "Die meisten Projekte · 3D, Premium A+ und Brand Store können länger dauern",
    steps: [
      {
        h: "Briefing",
        p: "Ein kurzes Briefing zu Produkt, Zielgruppe und gewünschtem Ergebnis.",
      },
      {
        h: "Konzept",
        p: "Eine visuelle Richtung für das gesamte Listing, bevor die Produktion beginnt.",
      },
      {
        h: "Produktion",
        p: "3D, Fotoarbeit, Infografiken und Texte als ein System umgesetzt.",
      },
      {
        h: "Korrekturen",
        p: "Strukturierte Feedbackrunden entlang klarer Meilensteine.",
      },
      { h: "Finale Lieferung", p: "Dateien bereit für Seller Central." },
    ],
  },
  ctr: {
    kicker: "Gleiches Produkt · neue Visuals",
    title: "Bessere Bilder. Mehr Klicks.",
    titleAccent: "Mehr Klicks.",
    body: "Dasselbe Listing vor und nach einem Metric-Redesign: Die Klickrate stieg von 9,5 % auf 22 %. Käufer entscheiden in den Suchergebnissen, lange bevor sie einen Bullet Point lesen.",
    beforeLabel: "Vorher",
    afterLabel: "Metric-Redesign",
  },
} as const;

/** One homepage case card — length varies (CMS may clear the lineup). */
export type MetricHomeCaseStudyItem = {
  slug: string;
  tags: string[];
  quote: string;
  author: string;
  role: string;
  description: string;
  image: string;
  title?: string;
  /** Category / sphere label for the pin cap (proto `cat`). */
  category?: string;
};

type MetricHomeBase = typeof metricHomeEn;

export type MetricHomeContent = {
  [K in keyof MetricHomeBase]: K extends "caseStudies"
    ? Omit<MetricHomeBase["caseStudies"], "items"> & {
        items: MetricHomeCaseStudyItem[];
      }
    : MetricHomeBase[K];
};

/** @deprecated Prefer getMetricHome(locale) */
export const metricHome = metricHomeEn;

export function getMetricHome(locale: Locale): MetricHomeContent {
  return (
    locale === "de" ? metricHomeDe : metricHomeEn
  ) as unknown as MetricHomeContent;
}

/** Plain JSON-serializable clone for CMS payload storage. */
export function toMetricHomePayload(
  content: MetricHomeContent,
): Record<string, unknown> {
  return JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
}
