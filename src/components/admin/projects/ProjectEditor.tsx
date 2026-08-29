"use client";

import { HardNavForm, runAdminMutation } from "@/components/admin/HardNavForm";
import { useDeferredValue, useEffect, useMemo, useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ImageField } from "@/components/admin/image-field";
import { LibraryImagePicker } from "@/components/admin/form/LibraryImagePicker";
import {
  MediaSourceTabs,
  type MediaSourceMode,
} from "@/components/admin/form/MediaSourceTabs";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid,
  useOrderedItems,
  usePersistReorder,
} from "@/components/admin/dnd";
import { CaseMediaAdd } from "@/components/admin/projects/CaseMediaAdd";
import { CaseSitePreview, isProjectEditorDirty } from "@/components/admin/projects/CaseSitePreview";
import type {
  LibraryItem,
  ProjectBlockDraft,
  ProjectEditorData,
  ProjectMediaDraft,
  ProjectReviewDraft,
  ProjectTranslationDraft,
  TagOption,
} from "@/components/admin/projects/project-editor-types";
import {
  clearProjectOgAction,
  deleteProjectAction,
  deleteProjectBlockAction,
  deleteProjectMediaAction,
  generateProjectOgAction,
  previewProjectOgAction,
  reorderProjectBlocksAction,
  reorderProjectMediaAction,
  saveProjectAction,
  updateProjectBlockYoutubeAction,
} from "@/app/admin/(dashboard)/works/actions";
import { OgModePanel, inferOgMode, type OgMode } from "@/components/admin/og/OgModePanel";
import { getWorkOgImagePath } from "@/utils/og/paths";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
} from "@/components/admin/ui/styles";
import { AdminConfirmModal } from "@/components/admin/ui/AdminConfirmModal";
import type { AdminLocale } from "@/components/admin/ui/locales";
import { ADMIN_LOCALES } from "@/components/admin/ui/locales";
import { ADMIN_TOPBAR_HEIGHT } from "@/components/admin/chrome/AdminTopBar";
import { ADMIN_MD_BREAKPOINT } from "@/components/admin/chrome/nav";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";
import { useAdminDesktop } from "@/components/admin/ui/useAdminDesktop";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

export type { ProjectEditorData } from "./project-editor-types";

type Props = {
  project: ProjectEditorData;
  library: LibraryItem[];
  tagOptions: TagOption[];
};

const sectionBox: CSSProperties = {
  border: "1px solid #333",
  padding: 18,
  display: "grid",
  gap: 14,
};

const sectionTitle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "0.02em",
};

const stickyBarBase: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  margin: "0 0 8px",
  border: "1px solid #333",
  background: "rgba(10,10,10,0.96)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  boxSizing: "border-box",
  width: "100%",
};

function isLocaleFilled(tr: ProjectTranslationDraft): boolean {
  return Boolean(tr.title.trim());
}

function emptyReviewTranslations(): ProjectReviewDraft["translations"] {
  return {
    en: { author: "", role: "", quote: "" },
    de: { author: "", role: "", quote: "" },
  };
}

function syncLegacyQuoteFields(
  translations: ProjectEditorData["translations"],
  reviews: ProjectReviewDraft[],
): ProjectEditorData["translations"] {
  const first = reviews
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0];
  const next = { ...translations };
  for (const loc of ADMIN_LOCALES) {
    const code = loc.code;
    const row = first?.translations[code];
    next[code] = {
      ...next[code],
      author: row?.author ?? "",
      role: row?.role ?? "",
      quote: row?.quote ?? "",
    };
  }
  return next;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function isAutoSlug(slug: string): boolean {
  return !slug.trim() || /^project-\d+$/.test(slug.trim());
}

function seoLenColor(length: number, soft: number, hard: number): string {
  if (length === 0) return "#666";
  if (length > hard) return "#f66";
  if (length > soft) return "#da6";
  return "#6a6";
}

function seoDescColor(length: number): string {
  if (length === 0) return "#666";
  if (length > 170) return "#f66";
  if (length < 120 || length > 160) return "#da6";
  return "#6a6";
}

function ReturnFields({
  locale,
  focus,
}: {
  locale: AdminLocale;
  focus?: string;
}) {
  return (
    <>
      <input type="hidden" name="return_locale" value={locale} />
      {focus ? <input type="hidden" name="return_focus" value={focus} /> : null}
    </>
  );
}

export function ProjectEditor({ project, library, tagOptions }: Props) {
  const t = useAdminT();
  const isDesktop = useAdminDesktop();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<AdminLocale>(() =>
    searchParams.get("locale") === "de" ? "de" : "en",
  );
  const [draft, setDraft] = useState(project);
  const previewDraft = useDeferredValue(draft);
  const [coverPreview, setCoverPreview] = useState(project.cover_image);
  const [coverBlobUrl, setCoverBlobUrl] = useState<string | null>(null);
  const [coverSource, setCoverSource] = useState<MediaSourceMode>("upload");
  const [coverLibraryUrl, setCoverLibraryUrl] = useState("");
  const [coverEditRequest, setCoverEditRequest] = useState<{
    url: string;
    fileName?: string;
    token: number;
  } | null>(null);
  const [ogSource, setOgSource] = useState<MediaSourceMode>("upload");
  const [ogLibraryUrl, setOgLibraryUrl] = useState("");
  const [ogMode, setOgMode] = useState<OgMode>(() => inferOgMode(project.og_image));
  const [ogPreviewDataUrl, setOgPreviewDataUrl] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(!isAutoSlug(project.slug));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, startDelete] = useTransition();
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const tr = draft.translations[locale];

  useUnsavedChangesGuard(isProjectEditorDirty(draft, project));

  const orderedReviews = useMemo(
    () => draft.reviews.slice().sort((a, b) => a.sort_order - b.sort_order),
    [draft.reviews],
  );

  const [renderedProject, setRenderedProject] = useState(project);
  const urlLocale = searchParams.get("locale");
  const [renderedUrlLocale, setRenderedUrlLocale] = useState(urlLocale);

  // Server sent a newer snapshot (save / revalidate) — rebuild the draft.
  if (renderedProject !== project) {
    setRenderedProject(project);
    setDraft(project);
    setCoverPreview(project.cover_image);
    setCoverLibraryUrl("");
    setOgLibraryUrl("");
    setCoverSource("upload");
    setOgSource("upload");
    setOgMode(inferOgMode(project.og_image));
    setOgPreviewDataUrl(null);
    setCoverBlobUrl(null);
  }

  if (renderedUrlLocale !== urlLocale) {
    setRenderedUrlLocale(urlLocale);
    if (urlLocale === "en" || urlLocale === "de") setLocale(urlLocale);
  }

  useEffect(() => {
    if (!coverBlobUrl?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(coverBlobUrl);
  }, [coverBlobUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const focus = searchParams.get("focus");
    const hash = window.location.hash.replace("#", "") || focus || "";
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [project.id, searchParams, project.media.length, project.blocks.length]);

  const sourceTabs = useMemo(
    () => {
      const tabs: { id: MediaSourceMode; label: string }[] = [
        { id: "upload", label: t.pages.project.addFromUpload },
        { id: "library", label: t.pages.project.addFromLibrary },
        { id: "url", label: t.pages.project.addFromUrl },
      ];
      return tabs;
    },
    [t.pages.project.addFromUpload, t.pages.project.addFromLibrary, t.pages.project.addFromUrl],
  );

  const filled = useMemo(
    () => ADMIN_LOCALES.filter((l) => isLocaleFilled(draft.translations[l.code])).length,
    [draft.translations],
  );

  const orderedBlocks = useMemo(
    () => draft.blocks.slice().sort((a, b) => a.sort_order - b.sort_order),
    [draft.blocks],
  );
  const [ordered, setOrdered] = useOrderedItems(orderedBlocks);
  const { pending, saved, onDragEnd } = usePersistReorder(
    orderedBlocks,
    ordered,
    (next) => {
      setOrdered(next);
      setDraft((prev) => ({
        ...prev,
        blocks: next.map((b, i) => ({ ...b, sort_order: i })),
      }));
    },
    reorderProjectBlocksAction,
  );

  const updateLocale = (patch: Partial<ProjectTranslationDraft>) => {
    setDraft((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...prev.translations[locale], ...patch },
      },
    }));
  };

  const setReviews = (nextReviews: ProjectReviewDraft[]) => {
    const normalized = nextReviews.map((review, index) => ({
      ...review,
      sort_order: index,
    }));
    setDraft((prev) => ({
      ...prev,
      reviews: normalized,
      translations: syncLegacyQuoteFields(prev.translations, normalized),
    }));
  };

  const addReview = () => {
    setReviews([
      ...orderedReviews,
      {
        id: `temp-${crypto.randomUUID()}`,
        sort_order: orderedReviews.length,
        person_image: "",
        translations: emptyReviewTranslations(),
      },
    ]);
  };

  const updateReviewLocale = (
    reviewId: string,
    patch: Partial<ProjectReviewDraft["translations"][AdminLocale]>,
  ) => {
    setReviews(
      orderedReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              translations: {
                ...review.translations,
                [locale]: { ...review.translations[locale], ...patch },
              },
            }
          : review,
      ),
    );
  };

  const updateReviewPersonImage = (reviewId: string, person_image: string) => {
    setReviews(
      orderedReviews.map((review) =>
        review.id === reviewId ? { ...review, person_image } : review,
      ),
    );
  };

  const moveReview = (index: number, dir: -1 | 1) => {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= orderedReviews.length) return;
    const next = orderedReviews.slice();
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setReviews(next);
  };

  const removeReview = (reviewId: string) => {
    setReviews(orderedReviews.filter((review) => review.id !== reviewId));
    setDeleteReviewId(null);
  };

  const onTitleChange = (title: string) => {
    updateLocale({ title });
    if (!slugLocked) {
      const next = slugify(title);
      if (next) setDraft((p) => ({ ...p, slug: next }));
    }
  };

  const fillSeoFromCase = () => {
    const title = tr.title.trim();
    const description = tr.description.trim();
    updateLocale({
      meta_title: tr.meta_title.trim() || (title ? `${title} — METRIC` : ""),
      meta_description: tr.meta_description.trim() || description.slice(0, 160),
      keywords:
        tr.keywords.trim() ||
        [
          draft.sphere,
          ...tagOptions
            .filter((tag) => draft.typeTagIds.includes(tag.id))
            .map((tag) => tag.slug),
        ]
          .filter(Boolean)
          .join(", "),
    });
    if (!draft.og_image && draft.cover_image) {
      setDraft((p) => ({ ...p, og_image: p.cover_image }));
      setOgMode("custom");
    }
  };

  const switchLocale = (code: AdminLocale) => {
    setLocale(code);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("locale", code);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const metaTitleLen = (tr.meta_title || (tr.title ? `${tr.title} — METRIC` : "")).length;
  const metaDescLen = (tr.meta_description || tr.description).length;
  const seoWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!tr.meta_title.trim()) warnings.push(t.pages.project.seoWarnTitleEmpty);
    else if (metaTitleLen > 60) warnings.push(t.pages.project.seoWarnTitleLong);
    if (!tr.meta_description.trim() && !tr.description.trim()) {
      warnings.push(t.pages.project.seoWarnDescEmpty);
    } else if (metaDescLen < 120 || metaDescLen > 160) {
      warnings.push(t.pages.project.seoWarnDescRange);
    }
    if (!draft.og_image.trim() && !draft.cover_image.trim()) {
      warnings.push(t.pages.project.seoWarnOg);
    }
    if (draft.status === "published" && !draft.seo_indexable) {
      warnings.push(t.pages.project.seoWarnNoindexPublished);
    }
    return warnings;
  }, [
    tr.meta_title,
    tr.meta_description,
    tr.description,
    metaTitleLen,
    metaDescLen,
    draft.og_image,
    draft.cover_image,
    draft.status,
    draft.seo_indexable,
    t.pages.project,
  ]);
  const publicPath =
    locale === "de"
      ? `metric.graphics/de/works/${draft.slug || "…"}/`
      : `metric.graphics/works/${draft.slug || "…"}/`;

  const categoryOptions = useMemo(
    () => tagOptions.filter((tag) => tag.kind === "category"),
    [tagOptions],
  );
  const typeOptions = useMemo(
    () => tagOptions.filter((tag) => tag.kind === "type"),
    [tagOptions],
  );

  const coverPreviewTags = useMemo(() => {
    const selected = [
      ...categoryOptions.filter((tag) => tag.id === draft.categoryTagId),
      ...typeOptions.filter((tag) => draft.typeTagIds.includes(tag.id)),
    ];
    return selected.map((tag) => tag.slug).slice(0, 4);
  }, [categoryOptions, typeOptions, draft.categoryTagId, draft.typeTagIds]);
  const coverCaseChrome = {
    previewTitle: tr.title || t.pages.project.title,
    previewSubtitle:
      tr.description.trim() || t.pages.project.descriptionPlaceholder,
    previewTags: coverPreviewTags,
    previewCta: locale === "de" ? "Case ansehen" : "View case",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 380px)",
        gap: 24,
        alignItems: "start",
      }}
      className="admin-project-editor"
    >
      <style>{`
        @media (max-width: 960px) {
          .admin-project-editor {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: ${ADMIN_MD_BREAKPOINT}px) {
          .admin-project-sticky-island {
            position: sticky;
            top: ${ADMIN_TOPBAR_HEIGHT}px;
            z-index: 40;
          }
        }
      `}</style>

      <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
          <Link href="/admin/works/" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>
            ← {t.pages.works.title}
          </Link>
          <span style={{ color: "#555", fontSize: 13 }}>
            {formatAdminMessage(t.pages.project.description, { filled })}
          </span>
        </div>

        <HardNavForm
          action={saveProjectAction}
          encType="multipart/form-data"
          style={{ display: "grid", gap: 16 }}
        >
          <input type="hidden" name="id" value={draft.id} />
          <input
            type="hidden"
            name="reviews_json"
            value={JSON.stringify(
              orderedReviews.map((review, index) => ({
                id: review.id,
                sort_order: index,
                person_image: review.person_image.startsWith("blob:")
                  ? (project.reviews.find((r) => r.id === review.id)
                      ?.person_image ?? "")
                  : review.person_image,
                translations: review.translations,
              })),
            )}
          />
          <ReturnFields locale={locale} />
          {ADMIN_LOCALES.map((l) => {
            const row = draft.translations[l.code];
            const first = orderedReviews[0]?.translations[l.code];
            return (
              <div key={l.code} style={{ display: "none" }} aria-hidden>
                <input type="hidden" name={`${l.code}_title`} value={row.title} />
                <input type="hidden" name={`${l.code}_description`} value={row.description} />
                <input type="hidden" name={`${l.code}_case_year`} value={row.case_year} />
                <input type="hidden" name={`${l.code}_case_task`} value={row.case_task} />
                <input type="hidden" name={`${l.code}_case_solution`} value={row.case_solution} />
                <input
                  type="hidden"
                  name={`${l.code}_author`}
                  value={first?.author ?? row.author}
                />
                <input
                  type="hidden"
                  name={`${l.code}_role`}
                  value={first?.role ?? row.role}
                />
                <input
                  type="hidden"
                  name={`${l.code}_quote`}
                  value={first?.quote ?? row.quote}
                />
                <input type="hidden" name={`${l.code}_meta_title`} value={row.meta_title} />
                <input
                  type="hidden"
                  name={`${l.code}_meta_description`}
                  value={row.meta_description}
                />
                <input type="hidden" name={`${l.code}_keywords`} value={row.keywords} />
              </div>
            );
          })}

          <div
            className="admin-project-sticky-island"
            style={{
              ...stickyBarBase,
              ...(isDesktop
                ? {
                    position: "sticky",
                    top: ADMIN_TOPBAR_HEIGHT,
                    zIndex: 40,
                  }
                : null),
            }}
          >
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {ADMIN_LOCALES.map((l) => {
                const active = locale === l.code;
                const ok = isLocaleFilled(draft.translations[l.code]);
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => switchLocale(l.code)}
                    style={{
                      ...adminBtn,
                      background: active ? "#fff" : "#1a1a1a",
                      color: active ? "#000" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: ok ? "#3d3" : "#555",
                      }}
                    />
                    {l.short}
                  </button>
                );
              })}
              <select
                name="status"
                value={draft.status}
                onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
                style={{ ...adminInput, width: "auto", margin: 0 }}
              >
                <option value="draft">{t.common.draft}</option>
                <option value="published">{t.common.published}</option>
                <option value="archived">{t.pages.works.archived}</option>
              </select>
            </div>
            <button type="submit" style={{ ...adminBtnPrimary, padding: "10px 18px" }}>
              {t.pages.project.save}
            </button>
          </div>

          <section style={sectionBox}>
            <h2 style={sectionTitle}>1. {t.pages.project.general}</h2>
            <div className="admin-form-2col">
              <label style={{ fontSize: 13 }}>
                {t.pages.project.slug}
                <input
                  name="slug"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    setDraft((p) => ({ ...p, slug: e.target.value }));
                  }}
                  style={adminInput}
                />
                <span style={{ fontSize: 11, color: "#666" }}>
                  /works/{draft.slug || "…"}/
                </span>
              </label>
              <label style={{ fontSize: 13 }}>
                {t.pages.project.category}
                <select
                  name="category_tag_id"
                  value={draft.categoryTagId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const slug =
                      categoryOptions.find((tag) => tag.id === id)?.slug ?? "";
                    setDraft((p) => ({
                      ...p,
                      categoryTagId: id,
                      sphere: slug,
                    }));
                  }}
                  style={adminInput}
                >
                  <option value="">{t.pages.project.categoryNone}</option>
                  {categoryOptions.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: 13 }}>
                {t.common.position}
                <input
                  name="sort_order"
                  type="number"
                  value={draft.sort_order}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      sort_order: Number(e.target.value) || 0,
                    }))
                  }
                  style={adminInput}
                />
              </label>
            </div>
            <label style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                name="featured"
                checked={draft.featured}
                onChange={(e) => setDraft((p) => ({ ...p, featured: e.target.checked }))}
              />
              {t.pages.project.featured}
            </label>

            <MediaSourceTabs
              mode={coverSource}
              onChange={setCoverSource}
              tabs={sourceTabs}
              label={t.common.cover}
            >
              {coverLibraryUrl ? (
                <input type="hidden" name="cover_from_library" value={coverLibraryUrl} />
              ) : null}
              {coverSource === "upload" ? (
                <ImageField
                  key="project-cover"
                  name="cover_file"
                  preset="projectCover"
                  currentUrl={coverPreview || null}
                  label={t.common.cover}
                  editRequest={coverEditRequest}
                  {...coverCaseChrome}
                  onReady={(file) => {
                    if (!file) {
                      setCoverBlobUrl(null);
                      setCoverPreview(draft.cover_image);
                      return;
                    }
                    setCoverLibraryUrl("");
                    const blob = URL.createObjectURL(file);
                    setCoverBlobUrl(blob);
                    setCoverPreview(blob);
                  }}
                />
              ) : null}
              {coverSource === "library" ? (
                library.length > 0 ? (
                  <LibraryImagePicker
                    name="_cover_library_pick"
                    items={library}
                    label={t.pages.project.fromLibrary}
                    noneLabel={t.pages.project.noneOption}
                    hint={t.pages.project.libraryClickToAdd}
                    showClear={false}
                    onSelect={(url) => {
                      if (!url) return;
                      // Open crop to case-card master — don't use library URL as-is.
                      setCoverLibraryUrl("");
                      setCoverEditRequest({
                        url,
                        fileName: "cover-library",
                        token: Date.now(),
                      });
                      setCoverSource("upload");
                    }}
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                    {t.pages.project.libraryEmpty}{" "}
                    <Link href="/admin/media/" style={{ color: "#8af" }}>
                      {t.pages.project.openMediaLibrary}
                    </Link>
                  </p>
                )
              ) : null}
              {coverSource === "url" ? (
                <label style={{ fontSize: 13 }}>
                  {t.pages.project.coverUrl}
                  <input
                    name="cover_image"
                    value={draft.cover_image}
                    onChange={(e) => {
                      setCoverLibraryUrl("");
                      setDraft((p) => ({ ...p, cover_image: e.target.value }));
                      setCoverPreview(e.target.value);
                    }}
                    style={adminInput}
                    placeholder={t.pages.project.urlPlaceholder}
                  />
                </label>
              ) : (
                <input type="hidden" name="cover_image" value={draft.cover_image} />
              )}
            </MediaSourceTabs>
          </section>

          <section style={sectionBox}>
            <h2 style={sectionTitle}>2. {t.pages.project.caseText}</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
              {t.pages.project.caseTextHint}
            </p>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.title}
              <input
                value={tr.title}
                onChange={(e) => onTitleChange(e.target.value)}
                style={adminInput}
                placeholder={t.pages.project.titlePlaceholder}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.descriptionLabel}
              <textarea
                value={tr.description}
                onChange={(e) => updateLocale({ description: e.target.value })}
                style={{ ...adminInput, minHeight: 80 }}
                placeholder={t.pages.project.descriptionPlaceholder}
              />
            </label>
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <h3 style={{ ...sectionTitle, fontSize: 14 }}>
                  {t.pages.project.reviews}
                </h3>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#888" }}>
                  {t.pages.project.reviewsHint}
                </p>
              </div>
              {orderedReviews.map((review, index) => {
                const row = review.translations[locale];
                return (
                  <div
                    key={review.id}
                    style={{
                      border: "1px solid #333",
                      padding: 12,
                      display: "grid",
                      gap: 10,
                      background: "#111",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <strong style={{ fontSize: 13 }}>
                          {formatAdminMessage(t.pages.project.reviewLabel, {
                            n: String(index + 1),
                          })}
                        </strong>
                        {index === 0 ? (
                          <span style={{ fontSize: 11, color: "#8af" }}>
                            {t.pages.project.primaryReviewHint}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          style={adminBtn}
                          disabled={index === 0}
                          onClick={() => moveReview(index, -1)}
                        >
                          {t.pages.project.moveReviewUp}
                        </button>
                        <button
                          type="button"
                          style={adminBtn}
                          disabled={index === orderedReviews.length - 1}
                          onClick={() => moveReview(index, 1)}
                        >
                          {t.pages.project.moveReviewDown}
                        </button>
                        <button
                          type="button"
                          style={{ ...adminBtn, color: "#f66", borderColor: "#633" }}
                          onClick={() => setDeleteReviewId(review.id)}
                        >
                          {t.pages.project.deleteReview}
                        </button>
                      </div>
                    </div>
                    <div className="admin-form-2col">
                      <label style={{ fontSize: 13 }}>
                        {t.pages.project.author}
                        <input
                          value={row.author}
                          onChange={(e) =>
                            updateReviewLocale(review.id, { author: e.target.value })
                          }
                          style={adminInput}
                          placeholder={t.pages.project.authorPlaceholder}
                        />
                      </label>
                      <label style={{ fontSize: 13 }}>
                        {t.pages.project.role}
                        <input
                          value={row.role}
                          onChange={(e) =>
                            updateReviewLocale(review.id, { role: e.target.value })
                          }
                          style={adminInput}
                          placeholder={t.pages.project.rolePlaceholder}
                        />
                      </label>
                    </div>
                    <label style={{ fontSize: 13 }}>
                      {t.pages.project.quote}
                      <textarea
                        value={row.quote}
                        onChange={(e) =>
                          updateReviewLocale(review.id, { quote: e.target.value })
                        }
                        style={{ ...adminInput, minHeight: 64 }}
                        placeholder={t.pages.project.quotePlaceholder}
                      />
                    </label>
                    <ImageField
                      key={`${review.id}-avatar`}
                      name={`review_${index}_person_file`}
                      preset="avatar"
                      currentUrl={
                        review.person_image.startsWith("blob:")
                          ? project.reviews.find((r) => r.id === review.id)
                              ?.person_image || null
                          : review.person_image || null
                      }
                      label={t.common.photo}
                      previewTitle={row.author || t.pages.project.authorPlaceholder}
                      previewSubtitle={row.role || t.pages.project.rolePlaceholder}
                      previewQuote={row.quote || t.pages.project.quotePlaceholder}
                      onReady={(file) => {
                        if (!file) {
                          updateReviewPersonImage(review.id, "");
                          return;
                        }
                        const blob = URL.createObjectURL(file);
                        updateReviewPersonImage(review.id, blob);
                      }}
                    />
                  </div>
                );
              })}
              <button type="button" style={adminBtn} onClick={addReview}>
                {t.pages.project.addReview}
              </button>
            </div>
            <div className="admin-form-2col">
              <fieldset style={{ margin: 0, border: 0, padding: 0 }}>
                <legend style={{ fontSize: 13, marginBottom: 6 }}>
                  {t.pages.project.types}
                </legend>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  {typeOptions.map((tag) => {
                    const checked = draft.typeTagIds.includes(tag.id);
                    return (
                      <label
                        key={tag.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          color: "#ddd",
                          border: "1px solid #333",
                          padding: "6px 10px",
                          cursor: "pointer",
                          background: checked ? "#1a1a2a" : "transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="type_tag_ids"
                          value={tag.id}
                          checked={checked}
                          onChange={(e) => {
                            const on = e.target.checked;
                            setDraft((p) => ({
                              ...p,
                              typeTagIds: on
                                ? [...p.typeTagIds, tag.id]
                                : p.typeTagIds.filter((id) => id !== tag.id),
                            }));
                          }}
                        />
                        {tag.label}
                      </label>
                    );
                  })}
                  {!typeOptions.length ? (
                    <span style={{ fontSize: 12, color: "#888" }}>
                      <Link href="/admin/tags/" style={{ color: "#8af" }}>
                        {t.pages.tags.title}
                      </Link>
                    </span>
                  ) : null}
                </div>
              </fieldset>
              <label style={{ fontSize: 13 }}>
                {t.pages.project.caseYear}
                <input
                  value={tr.case_year}
                  onChange={(e) => updateLocale({ case_year: e.target.value })}
                  style={adminInput}
                  placeholder="2026"
                />
                <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "#777" }}>
                  {t.pages.project.caseYearNotOnSite}
                </span>
              </label>
            </div>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.caseTask}
              <textarea
                value={tr.case_task}
                onChange={(e) => updateLocale({ case_task: e.target.value })}
                style={{ ...adminInput, minHeight: 72 }}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.caseSolution}
              <textarea
                value={tr.case_solution}
                onChange={(e) => updateLocale({ case_solution: e.target.value })}
                style={{ ...adminInput, minHeight: 72 }}
              />
            </label>
          </section>

          <section id="gallery" style={sectionBox}>
            <h2 style={sectionTitle}>3. {t.pages.project.contentBlocks}</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
              {t.pages.project.contentBlocksHint}
            </p>

            <ReorderStatus pending={pending} saved={saved} />
            <SortableCardGrid
              items={ordered}
              onDragEnd={onDragEnd}
              style={{ gridTemplateColumns: "1fr" }}
              renderItem={(block) => (
                <SortableCard id={block.id}>
                  <BlockCard
                      block={block}
                      projectId={draft.id}
                      media={draft.media}
                      library={library}
                      title={tr.title}
                      locale={locale}
                      onMediaChange={(nextMedia) =>
                        setDraft((prev) => ({ ...prev, media: nextMedia }))
                      }
                      onYoutubeChange={(url) => {
                        setDraft((prev) => ({
                          ...prev,
                          blocks: prev.blocks.map((b) =>
                            b.id === block.id ? { ...b, youtube_url: url } : b,
                          ),
                        }));
                      }}
                    />
                </SortableCard>
              )}
            />
          </section>

          <section style={sectionBox}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <h2 style={sectionTitle}>4. {t.pages.project.seoSection}</h2>
              <button type="button" style={adminBtn} onClick={fillSeoFromCase}>
                {t.pages.project.fillSeo}
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
              {t.pages.project.seoHint}
            </p>
            {seoWarnings.length ? (
              <ul
                style={{
                  margin: 0,
                  padding: "10px 12px 10px 28px",
                  background: "#1a1510",
                  border: "1px solid #543",
                  color: "#eca",
                  fontSize: 12,
                  lineHeight: 1.45,
                }}
              >
                {seoWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
            <label style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                name="seo_indexable"
                checked={draft.seo_indexable}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, seo_indexable: e.target.checked }))
                }
                value="on"
              />
              {t.pages.project.seoIndexable}
            </label>
            {!draft.seo_indexable ? (
              <input type="hidden" name="seo_indexable" value="off" />
            ) : null}
            <label style={{ fontSize: 13 }}>
              {t.pages.project.metaTitle}
              <input
                value={tr.meta_title}
                onChange={(e) => updateLocale({ meta_title: e.target.value })}
                style={adminInput}
                placeholder={tr.title ? `${tr.title} — METRIC` : "… — METRIC"}
              />
              <span style={{ fontSize: 11, color: seoLenColor(metaTitleLen, 60, 70) }}>
                {metaTitleLen}/60
              </span>
            </label>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.metaDescription}
              <textarea
                value={tr.meta_description}
                onChange={(e) => updateLocale({ meta_description: e.target.value })}
                style={{ ...adminInput, minHeight: 72 }}
                placeholder={tr.description}
              />
              <span style={{ fontSize: 11, color: seoDescColor(metaDescLen) }}>
                {metaDescLen}/160
              </span>
            </label>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.keywords}
              <input
                value={tr.keywords}
                onChange={(e) => updateLocale({ keywords: e.target.value })}
                style={adminInput}
                placeholder="Amazon listing, A+ Content, …"
              />
            </label>
            <div
              style={{
                border: "1px solid #2a2a2a",
                padding: 12,
                background: "#0c0c0c",
                fontSize: 13,
              }}
            >
              <p style={{ margin: "0 0 4px", color: "#1a0dab", fontSize: 16 }}>
                {tr.meta_title || (tr.title ? `${tr.title} — METRIC` : "METRIC")}
              </p>
              <p style={{ margin: "0 0 4px", color: "#006621", fontSize: 12 }}>
                {publicPath}
              </p>
              <p style={{ margin: 0, color: "#545454", fontSize: 13 }}>
                {tr.meta_description || tr.description || "…"}
              </p>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 13 }}>{t.pages.project.ogImage}</span>
              <OgModePanel
                mode={ogMode}
                onModeChange={setOgMode}
                ogImageUrl={draft.og_image}
                onOgImageUrlChange={(url) => {
                  setOgLibraryUrl("");
                  setDraft((p) => ({ ...p, og_image: url }));
                }}
                previewDataUrl={ogPreviewDataUrl}
                onPreviewDataUrlChange={setOgPreviewDataUrl}
                previewKey={[
                  locale,
                  tr.meta_title,
                  tr.title,
                  tr.meta_description,
                  tr.description,
                  coverPreview || draft.cover_image,
                ].join("|")}
                runPreview={async () => {
                  const result = await previewProjectOgAction({
                    locale,
                    title: tr.meta_title.trim() || tr.title,
                    description: tr.meta_description.trim() || tr.description,
                    coverUrl: coverPreview || draft.cover_image,
                  });
                  if (!result.ok || !result.dataUrl) {
                    return { ok: false, error: result.ok ? t.og.previewError : result.error };
                  }
                  return { ok: true, dataUrl: result.dataUrl };
                }}
                runGenerate={async () => {
                  const result = await generateProjectOgAction({
                    projectId: draft.id,
                    locale,
                    title: tr.meta_title.trim() || tr.title,
                    description: tr.meta_description.trim() || tr.description,
                    coverUrl: coverPreview || draft.cover_image,
                  });
                  if (!result.ok || !result.ogImageUrl) {
                    return {
                      ok: false,
                      error: result.ok ? t.og.previewError : result.error,
                    };
                  }
                  return { ok: true, ogImageUrl: result.ogImageUrl };
                }}
                runClear={async () => {
                  const result = await clearProjectOgAction({ projectId: draft.id });
                  if (!result.ok) return { ok: false, error: result.error };
                  return { ok: true };
                }}
                dynamicOgPath={
                  draft.slug.trim() ? getWorkOgImagePath(locale, draft.slug) : null
                }
                dynamicDisabledReason={
                  draft.status !== "published" ? t.og.autoDraftHint : null
                }
                customSlot={
                  <MediaSourceTabs
                    mode={ogSource}
                    onChange={setOgSource}
                    tabs={sourceTabs}
                    label={t.pages.project.ogImage}
                  >
                    {ogLibraryUrl ? (
                      <input type="hidden" name="og_from_library" value={ogLibraryUrl} />
                    ) : null}
                    {ogSource === "upload" ? (
                      <ImageField
                        key={draft.og_image || draft.cover_image || "og-empty"}
                        name="og_file"
                        preset="ogSocial"
                        currentUrl={draft.og_image || draft.cover_image || null}
                        label={t.pages.project.ogImage}
                        onReady={(file) => {
                          if (file) setOgLibraryUrl("");
                        }}
                      />
                    ) : null}
                    {ogSource === "library" ? (
                      library.length > 0 ? (
                        <LibraryImagePicker
                          name="_og_library_pick"
                          items={library}
                          label={t.pages.project.fromLibrary}
                          noneLabel={t.pages.project.noneOption}
                          hint={t.pages.project.libraryClickToAdd}
                          showClear={false}
                          onSelect={(url) => {
                            if (!url) return;
                            setOgLibraryUrl(url);
                            setDraft((p) => ({ ...p, og_image: url }));
                            setOgSource("upload");
                            setOgMode("custom");
                          }}
                        />
                      ) : (
                        <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                          {t.pages.project.libraryEmpty}{" "}
                          <Link href="/admin/media/" style={{ color: "#8af" }}>
                            {t.pages.project.openMediaLibrary}
                          </Link>
                        </p>
                      )
                    ) : null}
                    {ogSource === "url" ? (
                      <label style={{ fontSize: 13 }}>
                        {t.pages.project.ogImageUrl}
                        <input
                          name="og_image"
                          value={draft.og_image}
                          onChange={(e) => {
                            setOgLibraryUrl("");
                            setDraft((p) => ({ ...p, og_image: e.target.value }));
                            setOgMode(inferOgMode(e.target.value));
                          }}
                          style={adminInput}
                          placeholder={t.pages.project.urlPlaceholder}
                        />
                      </label>
                    ) : (
                      <input type="hidden" name="og_image" value={draft.og_image} />
                    )}
                  </MediaSourceTabs>
                }
              />
              {ogMode !== "custom" ? (
                <input type="hidden" name="og_image" value={draft.og_image} />
              ) : null}
            </div>
          </section>
        </HardNavForm>

        <button
          type="button"
          style={{ ...adminBtn, color: "#f66", borderColor: "#633" }}
          onClick={() => setDeleteOpen(true)}
        >
          {t.common.delete}
        </button>
      </div>

      <AdminConfirmModal
        open={deleteOpen}
        title={t.pages.works.confirmDeleteTitle}
        body={t.pages.works.confirmDeleteBody.replace(
          "{title}",
          draft.translations.en?.title || draft.slug,
        )}
        confirmLabel={t.common.delete}
        tone="danger"
        busy={deleteBusy}
        onCancel={() => {
          if (!deleteBusy) setDeleteOpen(false);
        }}
        onConfirm={() => {
          const fd = new FormData();
          fd.set("id", draft.id);
          startDelete(async () => {
            await runAdminMutation(deleteProjectAction, fd, {
              successMessage: t.pages.works.deletedToast,
              fallbackError: t.common.actionFailed,
            });
          });
        }}
      />

      <AdminConfirmModal
        open={Boolean(deleteReviewId)}
        title={t.pages.project.deleteReview}
        body={t.pages.project.deleteReviewConfirm}
        confirmLabel={t.common.delete}
        tone="danger"
        onCancel={() => setDeleteReviewId(null)}
        onConfirm={() => {
          if (deleteReviewId) removeReview(deleteReviewId);
        }}
      />

      <CaseSitePreview
        draft={previewDraft}
        saved={project}
        locale={locale}
        ogPreviewDataUrl={ogMode === "generate" ? ogPreviewDataUrl : null}
      />
    </div>
  );
}

function BlockCard({
  block,
  projectId,
  media,
  library,
  title,
  locale,
  onMediaChange,
  onYoutubeChange,
}: {
  block: ProjectBlockDraft;
  projectId: string;
  media: ProjectEditorData["media"];
  library: LibraryItem[];
  title: string;
  locale: AdminLocale;
  onMediaChange: (media: ProjectMediaDraft[]) => void;
  onYoutubeChange?: (url: string) => void;
}) {
  const t = useAdminT();
  const label =
    block.type === "gallery"
      ? t.pages.project.gallery
      : block.type === "before_after"
        ? t.pages.project.beforeAfter
        : "YouTube";

  const blockMedia = media.filter((m) => m.block_id === block.id);
  const galleryItems = useMemo(
    () =>
      media
        .filter((m) => m.block_id === block.id && m.kind === "gallery")
        .sort((a, b) => a.sort_order - b.sort_order),
    [media, block.id],
  );
  const [orderedGallery, setOrderedGallery] = useOrderedItems(galleryItems);
  const {
    pending: galleryPending,
    saved: gallerySaved,
    onDragEnd: onGalleryDragEnd,
  } = usePersistReorder(
    galleryItems,
    orderedGallery,
    (next) => {
      setOrderedGallery(next);
      const others = media.filter(
        (m) => !(m.block_id === block.id && m.kind === "gallery"),
      );
      onMediaChange([
        ...others,
        ...next.map((item, index) => ({ ...item, sort_order: index })),
      ]);
    },
    reorderProjectMediaAction,
  );

  return (
    <article
      style={{
        border: "1px solid #2a2a2a",
        padding: 12,
        background: "#0c0c0c",
        display: "grid",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "center",
        }}
      >
        <strong style={{ fontSize: 13 }}>{label}</strong>
        <HardNavForm action={deleteProjectBlockAction}>
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="block_id" value={block.id} />
          <ReturnFields locale={locale} focus="gallery" />
          <button
            type="submit"
            style={{ ...adminBtn, color: "#f66", borderColor: "#633", padding: "6px 10px" }}
          >
            {t.common.delete}
          </button>
        </HardNavForm>
      </div>

      {block.type === "youtube" ? (
        <HardNavForm action={updateProjectBlockYoutubeAction} style={{ display: "grid", gap: 8 }}>
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="block_id" value={block.id} />
          <ReturnFields locale={locale} focus="gallery" />
          <label style={{ fontSize: 13 }}>
            {t.pages.project.youtubeUrl}
            <input
              name="youtube_url"
              defaultValue={block.youtube_url}
              onChange={(e) => onYoutubeChange?.(e.target.value)}
              style={adminInput}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </label>
          <button type="submit" style={adminBtn}>
            {t.common.save}
          </button>
        </HardNavForm>
      ) : null}

      {block.type === "before_after" ? (
        <div className="admin-form-2col" style={{ alignItems: "start" }}>
          {(["before", "after"] as const).map((kind) => {
            const current = blockMedia.find((m) => m.kind === kind);
            const sideLabel =
              kind === "before"
                ? t.pages.project.beforeImage
                : t.pages.project.afterImage;
            return (
              <div key={kind} style={{ display: "grid", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{sideLabel}</p>
                {current ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={current.url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: 180,
                        objectFit: "contain",
                        background: "#111",
                      }}
                    />
                    <HardNavForm action={deleteProjectMediaAction}>
                      <input type="hidden" name="project_id" value={projectId} />
                      <input type="hidden" name="media_id" value={current.id} />
                      <ReturnFields locale={locale} focus="gallery" />
                      <button
                        type="submit"
                        style={{ ...adminBtn, color: "#f66", borderColor: "#633" }}
                      >
                        {t.common.delete}
                      </button>
                    </HardNavForm>
                  </>
                ) : null}
                <CaseMediaAdd
                  projectId={projectId}
                  blockId={block.id}
                  kind={kind}
                  library={library}
                  locale={locale}
                  replacing={!!current}
                  previewTitle={title}
                  previewSubtitle={sideLabel}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      {block.type === "gallery" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
            {t.pages.project.galleryHint}
          </p>
          <CaseMediaAdd
            projectId={projectId}
            blockId={block.id}
            kind="gallery"
            library={library}
            locale={locale}
            existingUrls={galleryItems.map((item) => item.url)}
            previewTitle={title}
          />
          <ReorderStatus pending={galleryPending} saved={gallerySaved} />
          <SortableCardGrid
            items={orderedGallery}
            onDragEnd={onGalleryDragEnd}
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 8,
            }}
            renderItem={(item) => (
              <SortableCard id={item.id}>
                <div style={{ display: "grid", gap: 4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: 140,
                      objectFit: "contain",
                      background: "#111",
                      display: "block",
                    }}
                  />
                  <HardNavForm action={deleteProjectMediaAction}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="media_id" value={item.id} />
                    <ReturnFields locale={locale} focus="gallery" />
                    <button
                      type="submit"
                      style={{
                        ...adminBtn,
                        color: "#f66",
                        borderColor: "#633",
                        padding: 4,
                        fontSize: 11,
                      }}
                    >
                      {t.common.delete}
                    </button>
                  </HardNavForm>
                </div>
              </SortableCard>
            )}
          />
        </div>
      ) : null}
    </article>
  );
}
