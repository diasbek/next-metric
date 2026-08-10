export type ProjectTag = string;

export type CaseBlock =
  | { id: string; type: "gallery"; images: string[] }
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

export const projects: Project[] = [
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
          ],
        },
        {
          id: "ba",
          type: "before_after",
          beforeImage: "/images/metric/case-detail/imgRectangle71.jpg",
          afterImage: "/images/metric/case-detail/imgRectangle72.jpg",
        },
      ],
    },
  },
  {
    slug: "craftus",
    title: "CRAFTUS",
    description: "Listing and A+ system for a growing Amazon brand",
    image: "/images/metric/cases/case-2.jpg",
    tags: ["Listing", "Agriculture", "Premium A+"],
    sphere: "Agriculture",
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
          ],
        },
      ],
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
          ],
        },
      ],
    },
  },
];
