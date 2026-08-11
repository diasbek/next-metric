import type { CaseBlock, CaseStudy, Project } from "@/data/projects";

export type CmsLocale = "en" | "de";
export type PublishStatus = "draft" | "published";
export type LeadStatus = "new" | "read" | "archived";
export type MediaKind = "hero" | "gallery" | "before" | "after" | "cover";
export type ProjectBlockType = "gallery" | "before_after" | "youtube";

export type DbProject = {
  id: string;
  slug: string;
  status: PublishStatus;
  sort_order: number;
  sphere: string;
  featured: boolean;
  cover_image: string;
  og_image?: string;
  seo_indexable?: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbProjectTranslation = {
  project_id: string;
  locale: CmsLocale;
  title: string;
  description: string;
  tags: string[];
  case_year: string | null;
  case_task: string | null;
  case_solution: string | null;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
};

export type DbProjectMedia = {
  id: string;
  project_id: string;
  kind: MediaKind;
  url: string;
  sort_order: number;
  alt: string;
  block_id?: string | null;
};

export type DbProjectBlock = {
  id: string;
  project_id: string;
  type: ProjectBlockType;
  sort_order: number;
  youtube_url: string | null;
};

export type DbLead = {
  id: string;
  name: string;
  phone: string;
  message: string;
  /** Storage object path in the private metric-lead-attachments bucket. */
  attachment_path: string | null;
  status: LeadStatus;
  locale: string | null;
  created_at: string;
  consent_at?: string | null;
};

export type CaptchaProvider = "none" | "honeypot" | "turnstile" | "hcaptcha";

export type DbSiteSettings = {
  id: number;
  phone: string;
  email: string;
  telegram_url: string;
  instagram_url: string;
  presentation_url: string;
  brief_url: string;
  address_lines: string[];
  updated_at: string;
  telegram_bot_token: string;
  telegram_chat_ids: string[];
  telegram_notify_enabled: boolean;
  telegram_webhook_secret: string;
  captcha_provider: CaptchaProvider;
  captcha_site_key: string;
  captcha_secret_key: string;
  yandex_metrika_id: string;
  yandex_webmaster_verification: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  google_site_verification: string;
};

export type DbSiteSettingsTranslation = {
  locale: CmsLocale;
  address_lines: string[];
  presentation_url: string;
  brief_url: string;
  updated_at?: string;
};

export type DbPageSeo = {
  locale: CmsLocale;
  page_key: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string | null;
};

export type ProjectWithRelations = DbProject & {
  project_translations: DbProjectTranslation[];
  project_media: DbProjectMedia[];
  project_blocks?: DbProjectBlock[];
};

function buildBlocks(
  blocks: DbProjectBlock[] | undefined,
  media: DbProjectMedia[],
): CaseBlock[] {
  const sortedBlocks = (blocks ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  if (sortedBlocks.length > 0) {
    return sortedBlocks
      .map((block): CaseBlock | null => {
        if (block.type === "youtube") {
          const url = (block.youtube_url ?? "").trim();
          if (!url) return null;
          return { id: block.id, type: "youtube", youtubeUrl: url };
        }
        if (block.type === "before_after") {
          const before = media.find(
            (m) => m.block_id === block.id && m.kind === "before",
          );
          const after = media.find(
            (m) => m.block_id === block.id && m.kind === "after",
          );
          return {
            id: block.id,
            type: "before_after",
            beforeImage: before?.url,
            afterImage: after?.url,
          };
        }
        const images = media
          .filter((m) => m.block_id === block.id && m.kind === "gallery")
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((m) => m.url);
        return { id: block.id, type: "gallery", images };
      })
      .filter((b): b is CaseBlock => Boolean(b));
  }

  // Legacy fallback when blocks table is empty but media exists.
  const legacy: CaseBlock[] = [];
  const before = media.find((m) => m.kind === "before");
  const after = media.find((m) => m.kind === "after");
  if (before || after) {
    legacy.push({
      id: "legacy-ba",
      type: "before_after",
      beforeImage: before?.url,
      afterImage: after?.url,
    });
  }
  const gallery = media
    .filter((m) => m.kind === "gallery")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => m.url);
  if (gallery.length) {
    legacy.push({ id: "legacy-gallery", type: "gallery", images: gallery });
  }
  return legacy;
}

export function mapProjectRow(
  row: ProjectWithRelations,
  locale: CmsLocale,
): Project | null {
  const tr =
    row.project_translations.find((t) => t.locale === locale) ??
    row.project_translations.find((t) => t.locale === "en");
  if (!tr) return null;

  const hero = row.project_media
    .filter((m) => m.kind === "hero")
    .sort((a, b) => a.sort_order - b.sort_order)[0];

  const blocks = buildBlocks(row.project_blocks, row.project_media);

  let caseStudy: CaseStudy | undefined;
  const hasCaseCopy = Boolean(tr.case_year || tr.case_task || tr.case_solution);
  if (hasCaseCopy || blocks.length > 0 || hero) {
    caseStudy = {
      year: tr.case_year ?? "",
      task: tr.case_task ?? "",
      solution: tr.case_solution ?? "",
      heroImage: hero?.url,
      blocks,
    };
  }

  return {
    slug: row.slug,
    title: tr.title,
    description: tr.description,
    image: row.cover_image || hero?.url || "",
    tags: tr.tags ?? [],
    sphere: row.sphere,
    featured: row.featured,
    caseStudy,
    seo: {
      metaTitle: (tr.meta_title ?? "").trim(),
      metaDescription: (tr.meta_description ?? "").trim(),
      keywords: (tr.keywords ?? "").trim(),
      ogImage: (row.og_image ?? "").trim(),
      indexable: row.seo_indexable !== false,
    },
  };
}
