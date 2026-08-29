import type { AdminLocale } from "@/components/admin/ui/locales";
import type { ProjectBlockType } from "@/lib/cms/types";

export type ProjectTranslationDraft = {
  locale: AdminLocale;
  title: string;
  description: string;
  tags: string;
  case_year: string;
  case_task: string;
  case_solution: string;
  author: string;
  role: string;
  quote: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
};

export type ProjectMediaDraft = {
  id: string;
  kind: string;
  url: string;
  alt: string;
  sort_order: number;
  block_id: string | null;
  width?: number | null;
  height?: number | null;
};

export type ProjectBlockDraft = {
  id: string;
  type: ProjectBlockType;
  sort_order: number;
  youtube_url: string;
};

export type ProjectReviewLocaleDraft = {
  author: string;
  role: string;
  quote: string;
};

export type ProjectReviewDraft = {
  /** Client temp id (temp-…) or persisted uuid. */
  id: string;
  sort_order: number;
  person_image: string;
  translations: Record<AdminLocale, ProjectReviewLocaleDraft>;
};

export type ProjectEditorData = {
  id: string;
  slug: string;
  status: string;
  sphere: string;
  categoryTagId: string;
  typeTagIds: string[];
  sort_order: number;
  featured: boolean;
  cover_image: string;
  og_image: string;
  seo_indexable: boolean;
  translations: Record<AdminLocale, ProjectTranslationDraft>;
  media: ProjectMediaDraft[];
  blocks: ProjectBlockDraft[];
  reviews: ProjectReviewDraft[];
};

export type LibraryItem = { path: string; url: string };

export type TagOption = {
  id: string;
  slug: string;
  label: string;
  kind: "category" | "type";
};
