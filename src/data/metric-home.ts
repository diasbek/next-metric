import type { Locale } from "@/i18n/config";

const metricHomeEn = {
  hero: {
    titleLine1: "On Amazon,",
    titleLine2: "customers buy with their eyes first.",
    subtitle:
      "Strategic Amazon listing images and A+ Content designed to communicate value, inspire confidence, and turn attention into sales.",
    cta: "Build a Stronger Listing",
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
      label: "Official Service-Partner",
      text: "We are an official partner in the Amazon Service Provider Network (SPN).",
      icon: "/images/metric/icons/spn.svg",
    },
    {
      kind: "reviews" as const,
      label: "Based on verified client reviews",
      icon: "/images/metric/icons/trustpilot.svg",
    },
    {
      kind: "rating" as const,
      value: "5",
      labelLine1: "Excellent",
      labelLine2: "5.0 out of 5",
      icon: "/images/metric/icons/star.svg",
    },
    {
      kind: "stat" as const,
      value: "800+",
      labelLine1: "Sellers",
      labelLine2: "served",
    },
  ],
  categories: {
    titleLines: [
      "We help turn products into",
      {
        prefix: "Amazon ",
        accent: "bestsellers",
        suffix: " across",
        icon: true,
      },
      "categories.",
    ],
    images: [
      "/images/metric/categories/cat-1.jpg",
      "/images/metric/categories/cat-2.jpg",
      "/images/metric/categories/cat-3.jpg",
      "/images/metric/categories/cat-4.jpg",
      "/images/metric/categories/cat-5.jpg",
    ],
  },
  caseStudies: {
    title: "See how better visuals drive real Amazon results.",
    titleAccent: "Amazon results.",
    subtitle:
      "Explore how strategic Amazon listing images and A+ Content helped brands attract more attention, communicate value more clearly, and improve conversion.",
    moreLabel: "More Projects",
    viewLabel: "View Case-Study",
    items: [
      {
        slug: "vjm-store",
        tags: ["Listing", "Premium A+", "Home"],
        quote: "Conversion grew from 9.5% to 22% in three days",
        author: "VJM-STORE",
        role: "VJM-STORE, Amazon DE",
        description:
          "Visual identity and Amazon listing system for a drill brush attachment set — listing images, A+ Content, and EBC modules.",
        image: "/images/metric/case-detail/vjm-store/1.jpg",
      },
      {
        slug: "matolux",
        tags: ["Listing", "Agriculture", "Premium A+"],
        quote: "Your ideas really do make all the difference",
        author: "Markus Pfister",
        role: "MATOLUX, Mitgründer & Geschäftsführer",
        description: "Amazon listing redesign with Premium A+ Content",
        image: "/images/metric/cases/case-1.jpg",
      },
      {
        slug: "craftus",
        tags: ["Listing", "Agriculture", "Premium A+"],
        quote: "All performance figures have risen significantly",
        author: "Louis Bierbaum",
        role: "CRAFTUS, Mitgründer & Geschäftsführer",
        description: "Listing and A+ system for a growing Amazon brand",
        image: "/images/metric/cases/case-2.jpg",
      },
      {
        slug: "tobias",
        tags: ["Listing", "Agriculture", "Premium A+"],
        quote: "The conversion rate has increased by one and a half times",
        author: "Tobias Fraikin",
        role: "CRAFTUS, Mitgründer & Geschäftsführer",
        description: "Conversion-led Amazon visuals",
        image: "/images/metric/cases/case-3.jpg",
      },
    ],
  },
  services: {
    id: "services",
    titleLines: ["Everything your", "Amazon brand needs"],
    titleSuffix: "to convert",
    titleBracket: "[in one place]",
    subtitle:
      "Amazon listing images, A+ Content, Brand Stores, and advertising creatives built as one consistent visual system.",
    cta: "Book a Free Concept Call",
    items: [
      {
        n: "1",
        title: "Product images",
        image: "/images/metric/services/svc-1.png",
      },
      {
        n: "2",
        title: "A+ Content",
        image: "/images/metric/services/svc-2.png",
      },
      {
        n: "3",
        title: "Ad-Banner",
        image: "/images/metric/services/svc-3.png",
      },
      {
        n: "4",
        title: "BrandStore",
        image: "/images/metric/services/svc-4.png",
      },
    ],
  },
  workflow: {
    id: "workflow",
    titleLine1: "That’s how",
    titleLine2: "Metric are made",
    subtitle: "Unique visual worlds — hand-drawn.",
    cta: "Let’s Talk",
    note: "We’d be happy to present more projects in a personal call.",
    cards: [
      {
        title: "Launching has never been this easy!",
        body: "The product achieved bestseller status within just one week, supported by its distinctive composition and high-quality imagery.",
        image: "/images/metric/workflow/wf-1.png",
        layout: "media-top" as const,
      },
      {
        title: "A consistent bestseller and Amazon’s Choice",
        body: "Achieving a consistent conversion rate of 41% through image content tailored to the target audience and relevant to customers",
        image: "/images/metric/workflow/wf-2.png",
        layout: "media-bottom" as const,
      },
      {
        title: "Launch your first product with confidence",
        body: "Strategic visuals that make your product easy to understand—and easier to choose.",
        image: "/images/metric/workflow/wf-3.png",
        layout: "media-top" as const,
      },
    ],
  },
  faq: {
    id: "faq",
    title: "FAQ",
    subtitle:
      "Here you will find the most important answers about our Amazon product images, videos, and services.",
  },
  footer: {
    cities: ["London", "New York", "Austin", "Berlin"],
    links: [{ label: "Privacy Policy", href: "/privacy/" }],
    social: [
      { label: "Upwork", key: "upwork" as const },
      { label: "Facebook", key: "facebook" as const },
      { label: "Instagram", key: "instagram" as const },
      { label: "LinkedIn", key: "linkedin" as const },
    ],
    startCta: "Start Your Project",
  },
  nav: [
    { label: "Projects", href: "/#projects" },
    { label: "Case Studies", href: "/#case-studies" },
    { label: "Services", href: "/#services" },
    { label: "Workflow", href: "/#workflow" },
    { label: "FAQ", href: "/#faq" },
  ],
} as const;

const metricHomeDe = {
  ...metricHomeEn,
  hero: {
    ...metricHomeEn.hero,
    titleLine1: "Auf Amazon",
    titleLine2: "kaufen Kunden zuerst mit den Augen.",
    subtitle:
      "Strategische Amazon Listing-Bilder und A+ Content, die Wert kommunizieren, Vertrauen schaffen und Aufmerksamkeit in Verkäufe verwandeln.",
    cta: "Stärkeres Listing bauen",
    badgeLabel: "Klickrate:",
    redesignLabel: "Metric Redesign",
    redesignCaption: "Klickrate:",
  },
  trust: [
    {
      kind: "spn" as const,
      label: "Offizieller Service-Partner",
      text: "Wir sind offizieller Partner im Amazon Service Provider Network (SPN).",
      icon: "/images/metric/icons/spn.svg",
    },
    {
      kind: "reviews" as const,
      label: "Basierend auf verifizierten Kundenbewertungen",
      icon: "/images/metric/icons/trustpilot.svg",
    },
    {
      kind: "rating" as const,
      value: "5",
      labelLine1: "Ausgezeichnet",
      labelLine2: "5,0 von 5",
      icon: "/images/metric/icons/star.svg",
    },
    {
      kind: "stat" as const,
      value: "800+",
      labelLine1: "Seller",
      labelLine2: "betreut",
    },
  ],
  categories: {
    titleLines: [
      "Wir machen Produkte zu",
      {
        prefix: "Amazon-",
        accent: "Bestsellern",
        suffix: "",
        icon: true,
      },
      "in allen Kategorien.",
    ],
    images: metricHomeEn.categories.images,
  },
  caseStudies: {
    title: "So treiben bessere Visuals echte Amazon-Ergebnisse.",
    titleAccent: "Amazon-Ergebnisse.",
    subtitle:
      "Erfahren Sie, wie strategische Listing-Bilder und A+ Content Marken mehr Aufmerksamkeit, Klarheit und Conversion gebracht haben.",
    moreLabel: "Mehr Projekte",
    viewLabel: "Case Study ansehen",
    items: [
      {
        slug: "vjm-store",
        tags: ["Listing", "Premium A+", "Home"],
        quote: "Conversion stieg in drei Tagen von 9,5 % auf 22 %",
        author: "VJM-STORE",
        role: "VJM-STORE, Amazon DE",
        description:
          "Visuelle Identität und Amazon-Listing-System für ein Bohrbürsten-Set — Listing-Bilder, A+ Content und EBC-Module.",
        image: "/images/metric/case-detail/vjm-store/1.jpg",
      },
      {
        slug: "matolux",
        tags: ["Listing", "Agriculture", "Premium A+"],
        quote: "Eure Ideen machen wirklich den Unterschied",
        author: "Markus Pfister",
        role: "MATOLUX, Mitgründer & Geschäftsführer",
        description: "Amazon-Listing-Redesign mit Premium A+ Content",
        image: "/images/metric/cases/case-1.jpg",
      },
      {
        slug: "craftus",
        tags: ["Listing", "Agriculture", "Premium A+"],
        quote: "Alle Performance-Kennzahlen sind deutlich gestiegen",
        author: "Louis Bierbaum",
        role: "CRAFTUS, Mitgründer & Geschäftsführer",
        description: "Listing- und A+-System für eine wachsende Amazon-Marke",
        image: "/images/metric/cases/case-2.jpg",
      },
      {
        slug: "tobias",
        tags: ["Listing", "Agriculture", "Premium A+"],
        quote: "Die Conversion-Rate hat sich um das Eineinhalbfache erhöht",
        author: "Tobias Fraikin",
        role: "CRAFTUS, Mitgründer & Geschäftsführer",
        description: "Conversion-orientierte Amazon-Visuals",
        image: "/images/metric/cases/case-3.jpg",
      },
    ],
  },
  services: {
    ...metricHomeEn.services,
    titleLines: ["Alles, was Ihre", "Amazon-Marke braucht,"],
    titleSuffix: "",
    titleBracket: "[an einem Ort]",
    subtitle:
      "Listing-Bilder, A+ Content, Brand Stores und Anzeigen-Creatives als ein konsistentes visuelles System.",
    cta: "Kostenloses Konzeptgespräch",
    items: [
      { n: "1", title: "Produktbilder", image: "/images/metric/services/svc-1.png" },
      { n: "2", title: "A+ Content", image: "/images/metric/services/svc-2.png" },
      { n: "3", title: "Ad-Banner", image: "/images/metric/services/svc-3.png" },
      { n: "4", title: "BrandStore", image: "/images/metric/services/svc-4.png" },
    ],
  },
  workflow: {
    ...metricHomeEn.workflow,
    titleLine1: "So entsteht",
    titleLine2: "Metric",
    subtitle: "Einzigartige Bildwelten — handgezeichnet.",
    cta: "Lass uns sprechen",
    note: "Gerne stellen wir weitere Projekte in einem persönlichen Gespräch vor.",
    cards: [
      {
        title: "Launch war noch nie so einfach!",
        body: "Das Produkt erreichte innerhalb nur einer Woche den Bestseller-Status — dank markanter Komposition und hochwertiger Bildwelt.",
        image: "/images/metric/workflow/wf-1.png",
        layout: "media-top" as const,
      },
      {
        title: "Ein konsistenter Bestseller und Amazon’s Choice",
        body: "Konstante Conversion-Rate von 41% durch zielgruppengerechte Bildinhalte, die für Kunden relevant sind.",
        image: "/images/metric/workflow/wf-2.png",
        layout: "media-bottom" as const,
      },
      {
        title: "Starten Sie Ihr erstes Produkt mit Vertrauen",
        body: "Strategische Visuals, die Ihr Produkt leicht verständlich — und leichter wählbar — machen.",
        image: "/images/metric/workflow/wf-3.png",
        layout: "media-top" as const,
      },
    ],
  },
  faq: {
    id: "faq",
    title: "FAQ",
    subtitle:
      "Hier finden Sie die wichtigsten Antworten zu unseren Amazon-Produktbildern, Videos und Leistungen.",
  },
  footer: {
    ...metricHomeEn.footer,
    links: [{ label: "Datenschutz", href: "/privacy/" }],
    startCta: "Projekt starten",
  },
  nav: [
    { label: "Projekte", href: "/#projects" },
    { label: "Case Studies", href: "/#case-studies" },
    { label: "Leistungen", href: "/#services" },
    { label: "Ablauf", href: "/#workflow" },
    { label: "FAQ", href: "/#faq" },
  ],
} as const;

export type MetricHomeContent = typeof metricHomeEn;

/** @deprecated Prefer getMetricHome(locale) */
export const metricHome = metricHomeEn;

export function getMetricHome(locale: Locale): MetricHomeContent {
  return (locale === "de" ? metricHomeDe : metricHomeEn) as MetricHomeContent;
}

/** Plain JSON-serializable clone for CMS payload storage. */
export function toMetricHomePayload(
  content: MetricHomeContent,
): Record<string, unknown> {
  return JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
}
