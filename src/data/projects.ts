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
}

export const projects: Project[] = [
  {
    slug: "sushi-moto",
    title: "Sushi Moto",
    description: "Суши-ресторан с характером",
    image: "/images/projects/sushi-moto.webp",
    tags: ["Логотип", "Брендинг"],
    sphere: "Рестораны",
    featured: true,
    caseStudy: {
      year: "2025",
      task: "Создать узнаваемый образ суши-ресторана с характером и запоминающейся айдентикой.",
      solution:
        "Разработали логотип с персонажем сумо, фирменный стиль, носители и визуальную систему для ресторанной сети.",
      heroImage: "/images/case-studies/sushi-moto/hero.jpg",
      blocks: [
        {
          id: "ba",
          type: "before_after",
          beforeImage: "/images/case-studies/sushi-moto/gallery-4.jpg",
          afterImage: "/images/case-studies/sushi-moto/gallery-5.jpg",
        },
        {
          id: "gal",
          type: "gallery",
          images: [
            "/images/case-studies/sushi-moto/gallery-1.jpg",
            "/images/case-studies/sushi-moto/gallery-2.jpg",
            "/images/case-studies/sushi-moto/gallery-3.jpg",
            "/images/case-studies/sushi-moto/gallery-4.jpg",
            "/images/case-studies/sushi-moto/gallery-5.jpg",
            "/images/case-studies/sushi-moto/gallery-6.jpg",
          ],
        },
      ],
    },
  },
  {
    slug: "kidi-mart",
    title: "Kidi Mart",
    description: "Сеть магазинов для мам и детей",
    image: "/images/projects/kidi-mart.webp",
    tags: ["Логотип", "Фирменный стиль"],
    sphere: "Детские товары",
  },
  {
    slug: "murad",
    title: "Murad",
    description: "Поставщик медицинского оборудования для клиник и больниц.",
    image: "/images/projects/murad.webp",
    tags: ["Логотип", "Брендинг"],
    sphere: "Медицина",
  },
  {
    slug: "nazif",
    title: "Nazif",
    description: "Сеть магазинов для мам и детей",
    image: "/images/projects/nazif.webp",
    tags: ["Логотип", "Фирменный стиль"],
    sphere: "Ритейл",
  },
  {
    slug: "magic-toys",
    title: "Magic Toys",
    description: "Магазин детских игрушек.",
    image: "/images/projects/magic-toys.webp",
    tags: ["Логотип", "Фирменный стиль"],
    sphere: "Детские товары",
  },
  {
    slug: "difo",
    title: "Difo",
    description: "Учебный центр",
    image: "/images/projects/difo.webp",
    tags: ["Логотип", "Брендинг"],
    sphere: "Образование",
  },
  {
    slug: "eap",
    title: "EAP",
    description: "Поставщик медицинского оборудования для клиник и больниц.",
    image: "/images/projects/eap.webp",
    tags: ["Логотип", "Брендинг"],
    sphere: "Медицина",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNextProjects(slug: string, count = 2): Project[] {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return projects.slice(0, count);
  const next = projects.slice(index + 1, index + 1 + count);
  if (next.length < count) {
    return [...next, ...projects.slice(0, count - next.length)];
  }
  return next;
}

/** Extract YouTube video id from common URL shapes. */
export function parseYoutubeId(url: string): string | null {
  const raw = url.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "").split("/")[0] || null;
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const embed = u.pathname.match(/\/embed\/([^/]+)/);
    if (embed?.[1]) return embed[1];
    const shorts = u.pathname.match(/\/shorts\/([^/]+)/);
    if (shorts?.[1]) return shorts[1];
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = parseYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
