import { VJM_STORE_FRAME_PATHS } from "./vjm-store-frames";

export type ProjectTag = string;

export type CaseGalleryImage = {
  url: string;
  width?: number | null;
  height?: number | null;
  alt?: string;
};

export type CaseBlock =
  | { id: string; type: "gallery"; images: CaseGalleryImage[] }
  | {
      id: string;
      type: "before_after";
      beforeImage?: string;
      afterImage?: string;
    }
  | { id: string; type: "youtube"; youtubeUrl: string };

export interface CaseStudy {
  year: string;
  task: string;
  solution: string;
  heroImage?: string;
  metricLabel?: string;
  metricValue?: string;
  blocks: CaseBlock[];
}

export interface ProjectSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  indexable: boolean;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  image: string;
  tags: ProjectTag[];
  sphere: string;
  featured?: boolean;
  caseStudy?: CaseStudy;
  seo?: ProjectSeo;
  quote?: string;
  author?: string;
  role?: string;
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Legacy static catalog — seed source / fallback when CMS is empty.
 * Public site is CMS-first via getProjectsForLocale.
 */
export const projects: Project[] = [
  {
    slug: "vjm-store",
    title: "VJM-STORE",
    description:
      "Visual identity and Amazon listing system for a drill brush attachment set — listing images, A+ Content, and EBC modules.",
    image: "/images/metric/case-detail/vjm-store/1.jpg",
    tags: ["Listing", "Premium A+", "Home"],
    sphere: "Home",
    quote: "Conversion grew from 9.5% to 22% in three days",
    author: "VJM-STORE",
    role: "VJM-STORE, Amazon DE",
    caseStudy: {
      year: "2026",
      task: "Create a cohesive visual identity and commercial image series for a drill brush kit on Amazon.",
      solution:
        "Delivered a full Metric system: hero listing visuals, feature slides, lifestyle frames, A+ Content modules, and EBC storytelling with measurable conversion uplift.",
      heroImage: "/images/metric/case-detail/vjm-store/1.jpg",
      metricLabel: "Conversion rate:",
      metricValue: "9,5% → 22%",
      blocks: [
        {
          id: "vjm-gal",
          type: "gallery",
          images: VJM_STORE_FRAME_PATHS.map((url) => ({ url })),
        },
      ],
    },
    seo: {
      metaTitle: "VJM-STORE — Amazon listing & A+ Content case study | METRIC",
      metaDescription:
        "How METRIC built a full Amazon visual system for VJM-STORE drill brush attachments — +132% conversion and 3× turnover growth.",
      keywords: "VJM-STORE, Amazon listing, A+ Content, EBC, drill brush, case study",
      ogImage: "/images/metric/case-detail/vjm-store/1.jpg",
      indexable: true,
    },
  },
  {
    slug: "matolux",
    title: "MATOLUX",
    description: "Amazon listing redesign with Premium A+ Content",
    image: "/images/metric/cases/case-1.jpg",
    tags: ["Listing", "Agriculture", "Premium A+"],
    sphere: "Agriculture",
    featured: true,
    quote: "Your ideas really do make all the difference",
    author: "Markus Pfister",
    role: "MATOLUX, Mitgründer & Geschäftsführer",
    caseStudy: {
      year: "2026",
      task: "Rebuild the Amazon listing visuals to communicate value and lift conversion.",
      solution:
        "Delivered a full Metric redesign: main images, lifestyle frames, Premium A+ modules, and consistent brand storytelling.",
      heroImage: "/images/metric/case-detail/imgRectangle58.jpg",
      metricLabel: "Click-through rate:",
      metricValue: "+132% CTR",
      blocks: [
        {
          id: "gal",
          type: "gallery",
          images: [
            "/images/metric/case-detail/imgRectangle58.jpg",
            "/images/metric/case-detail/imgRectangle59.jpg",
            "/images/metric/case-detail/imgRectangle68.jpg",
            "/images/metric/case-detail/imgRectangle69.jpg",
            "/images/metric/case-detail/imgRectangle70.jpg",
            "/images/metric/case-detail/imgRectangle71.jpg",
            "/images/metric/case-detail/imgRectangle72.jpg",
          ].map((url) => ({ url })),
        },
      ],
    },
    seo: {
      metaTitle: "MATOLUX — Amazon listing redesign & Premium A+ | METRIC",
      metaDescription:
        "METRIC rebuilt MATOLUX Amazon listing visuals and Premium A+ Content — stronger CTR and clearer product storytelling for agriculture buyers.",
      keywords: "MATOLUX, Amazon listing, Premium A+, agriculture, case study",
      ogImage: "/images/metric/cases/case-1.jpg",
      indexable: true,
    },
  },
  {
    slug: "craftus",
    title: "CRAFTUS",
    description: "Listing and A+ system for a growing Amazon brand",
    image: "/images/metric/cases/case-2.jpg",
    tags: ["Listing", "Agriculture", "Premium A+"],
    sphere: "Agriculture",
    author: "CRAFTUS",
    role: "Amazon brand",
    quote: "A coherent visual system that finally matched how we sell",
    caseStudy: {
      year: "2026",
      task: "Create a coherent visual system across listing and A+ Content.",
      solution:
        "Designed conversion-focused images and Premium A+ modules that clarified benefits and strengthened brand trust.",
      heroImage: "/images/metric/cases/case-2.jpg",
      metricLabel: "Click-through rate:",
      metricValue: "+98% CTR",
      blocks: [
        {
          id: "gal",
          type: "gallery",
          images: [
            "/images/metric/cases/case-2.jpg",
            "/images/metric/categories/cat-3.jpg",
          ].map((url) => ({ url })),
        },
      ],
    },
    seo: {
      metaTitle: "CRAFTUS — Amazon listing & A+ Content system | METRIC",
      metaDescription:
        "How METRIC designed a conversion-focused Amazon listing and Premium A+ system for CRAFTUS — clearer benefits and stronger brand trust.",
      keywords: "CRAFTUS, Amazon listing, A+ Content, agriculture, case study",
      ogImage: "/images/metric/cases/case-2.jpg",
      indexable: true,
    },
  },
  {
    slug: "tobias",
    title: "Home Essentials",
    description: "Conversion-led Amazon visuals",
    image: "/images/metric/cases/case-3.jpg",
    tags: ["Listing", "Home", "Premium A+"],
    sphere: "Home",
    featured: true,
    quote: "The conversion rate has increased by one and a half times",
    author: "Tobias Fraikin",
    role: "Brand founder",
    caseStudy: {
      year: "2026",
      task: "Improve listing clarity and conversion with stronger visuals.",
      solution:
        "Produced a Metric image set that highlights product benefits and drives higher conversion.",
      heroImage: "/images/metric/cases/case-3.jpg",
      metricLabel: "Conversion:",
      metricValue: "+1.5×",
      blocks: [
        {
          id: "gal",
          type: "gallery",
          images: [
            "/images/metric/cases/case-3.jpg",
            "/images/metric/categories/cat-4.jpg",
          ].map((url) => ({ url })),
        },
      ],
    },
    seo: {
      metaTitle: "Tobias / Home Essentials — Amazon visuals case study | METRIC",
      metaDescription:
        "METRIC produced conversion-led Amazon listing visuals for Tobias Fraikin’s Home Essentials brand — clearer benefits and +1.5× conversion.",
      keywords: "Tobias Fraikin, Home Essentials, Amazon listing, conversion, case study",
      ogImage: "/images/metric/cases/case-3.jpg",
      indexable: true,
    },
  },
];
