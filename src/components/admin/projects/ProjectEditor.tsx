"use client";

import { HardNavForm } from "@/components/admin/HardNavForm";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
import { CaseSitePreview } from "@/components/admin/projects/CaseSitePreview";
import type {
  LibraryItem,
  ProjectBlockDraft,
  ProjectEditorData,
  ProjectMediaDraft,
  ProjectTranslationDraft,
} from "@/components/admin/projects/project-editor-types";
import {
  addProjectBlockAction,
  deleteProjectAction,
  deleteProjectBlockAction,
  deleteProjectMediaAction,
  reorderProjectBlocksAction,
  reorderProjectMediaAction,
  saveProjectAction,
  updateProjectBlockYoutubeAction,
} from "@/app/admin/(dashboard)/works/actions";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
} from "@/components/admin/ui/styles";
import type { AdminLocale } from "@/components/admin/ui/locales";
import { ADMIN_LOCALES } from "@/components/admin/ui/locales";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

export type { ProjectEditorData } from "./project-editor-types";

type Props = {
  project: ProjectEditorData;
  library: LibraryItem[];
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

const stickyBar: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  margin: "0 0 8px",
  border: "1px solid #333",
  background: "rgba(10,10,10,0.94)",
  backdropFilter: "blur(8px)",
};

function isLocaleFilled(tr: ProjectTranslationDraft): boolean {
  return Boolean(tr.title.trim());
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

export function ProjectEditor({ project, library }: Props) {
  const t = useAdminT();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<AdminLocale>(() =>
    searchParams.get("locale") === "de" ? "de" : "en",
  );
  const [draft, setDraft] = useState(project);
  const [coverPreview, setCoverPreview] = useState(project.cover_image);
  const [coverBlobUrl, setCoverBlobUrl] = useState<string | null>(null);
  const [coverSource, setCoverSource] = useState<MediaSourceMode>("upload");
  const [ogSource, setOgSource] = useState<MediaSourceMode>("upload");
  const [slugLocked, setSlugLocked] = useState(!isAutoSlug(project.slug));
  const tr = draft.translations[locale];

  useEffect(() => {
    setDraft(project);
    setCoverPreview(project.cover_image);
    setCoverBlobUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, [project]);

  useEffect(() => {
    const fromUrl = searchParams.get("locale");
    if (fromUrl === "en" || fromUrl === "de") setLocale(fromUrl);
  }, [searchParams]);

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
        [tr.tags, draft.sphere].filter(Boolean).join(", "),
    });
    if (!draft.og_image && draft.cover_image) {
      setDraft((p) => ({ ...p, og_image: p.cover_image }));
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
  const publicPath =
    locale === "de"
      ? `metric.graphics/de/works/${draft.slug || "…"}/`
      : `metric.graphics/works/${draft.slug || "…"}/`;

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
          <ReturnFields locale={locale} />
          {ADMIN_LOCALES.map((l) => {
            const row = draft.translations[l.code];
            return (
              <div key={l.code} style={{ display: "none" }} aria-hidden>
                <input type="hidden" name={`${l.code}_title`} value={row.title} />
                <input type="hidden" name={`${l.code}_description`} value={row.description} />
                <input type="hidden" name={`${l.code}_tags`} value={row.tags} />
                <input type="hidden" name={`${l.code}_case_year`} value={row.case_year} />
                <input type="hidden" name={`${l.code}_case_task`} value={row.case_task} />
                <input type="hidden" name={`${l.code}_case_solution`} value={row.case_solution} />
                <input type="hidden" name={`${l.code}_author`} value={row.author} />
                <input type="hidden" name={`${l.code}_role`} value={row.role} />
                <input type="hidden" name={`${l.code}_quote`} value={row.quote} />
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

          <div style={stickyBar}>
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
                {t.pages.project.sphere}
                <input
                  name="sphere"
                  value={draft.sphere}
                  onChange={(e) => setDraft((p) => ({ ...p, sphere: e.target.value }))}
                  style={adminInput}
                  placeholder="Home, Tools, …"
                />
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
              {coverSource === "upload" ? (
                <ImageField
                  name="cover_file"
                  preset="projectCover"
                  currentUrl={coverPreview || null}
                  label={t.common.cover}
                  previewTitle={tr.title || t.pages.project.title}
                  onReady={(file) => {
                    if (coverBlobUrl?.startsWith("blob:")) {
                      URL.revokeObjectURL(coverBlobUrl);
                    }
                    if (!file) {
                      setCoverBlobUrl(null);
                      setCoverPreview(draft.cover_image);
                      return;
                    }
                    const blob = URL.createObjectURL(file);
                    setCoverBlobUrl(blob);
                    setCoverPreview(blob);
                  }}
                />
              ) : null}
              {coverSource === "library" ? (
                library.length > 0 ? (
                  <LibraryImagePicker
                    name="cover_from_library"
                    items={library}
                    label={t.pages.project.fromLibrary}
                    noneLabel={t.pages.project.noneOption}
                    onSelect={(url) => {
                      setDraft((p) => ({ ...p, cover_image: url }));
                      setCoverPreview(url);
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
            <div className="admin-form-2col">
              <label style={{ fontSize: 13 }}>
                {t.pages.project.author}
                <input
                  value={tr.author}
                  onChange={(e) => updateLocale({ author: e.target.value })}
                  style={adminInput}
                  placeholder={t.pages.project.authorPlaceholder}
                />
              </label>
              <label style={{ fontSize: 13 }}>
                {t.pages.project.role}
                <input
                  value={tr.role}
                  onChange={(e) => updateLocale({ role: e.target.value })}
                  style={adminInput}
                  placeholder={t.pages.project.rolePlaceholder}
                />
              </label>
            </div>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.descriptionLabel}
              <textarea
                value={tr.description}
                onChange={(e) => updateLocale({ description: e.target.value })}
                style={{ ...adminInput, minHeight: 80 }}
                placeholder={t.pages.project.descriptionPlaceholder}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.quote}
              <textarea
                value={tr.quote}
                onChange={(e) => updateLocale({ quote: e.target.value })}
                style={{ ...adminInput, minHeight: 64 }}
                placeholder={t.pages.project.quotePlaceholder}
              />
            </label>
            <div className="admin-form-2col">
              <label style={{ fontSize: 13 }}>
                {t.pages.project.tags}
                <input
                  value={tr.tags}
                  onChange={(e) => updateLocale({ tags: e.target.value })}
                  style={adminInput}
                  placeholder="Listing, Premium A+, Home"
                />
              </label>
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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(
                [
                  ["gallery", t.pages.project.addGalleryBlock],
                  ["before_after", t.pages.project.addBeforeAfterBlock],
                  ["youtube", t.pages.project.addYoutubeBlock],
                ] as const
              ).map(([type, label]) => (
                <HardNavForm key={type} action={addProjectBlockAction}>
                  <input type="hidden" name="project_id" value={draft.id} />
                  <input type="hidden" name="type" value={type} />
                  <ReturnFields locale={locale} focus="gallery" />
                  <button type="submit" style={adminBtn}>
                    {label}
                  </button>
                </HardNavForm>
              ))}
            </div>

            <ReorderStatus pending={pending} saved={saved} />
            <SortableCardGrid
              items={ordered}
              onDragEnd={onDragEnd}
              style={{ gridTemplateColumns: "1fr" }}
              renderItem={(block) => (
                <SortableCard id={block.id} onActivate={() => undefined}>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
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
                  </div>
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
              <span style={{ fontSize: 11, color: seoLenColor(metaDescLen, 155, 170) }}>
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
            <MediaSourceTabs
              mode={ogSource}
              onChange={setOgSource}
              tabs={sourceTabs}
              label={t.pages.project.ogImage}
            >
              {ogSource === "upload" ? (
                <ImageField
                  name="og_file"
                  preset="ogSocial"
                  currentUrl={draft.og_image || draft.cover_image || null}
                  label={t.pages.project.ogImage}
                />
              ) : null}
              {ogSource === "library" ? (
                library.length > 0 ? (
                  <LibraryImagePicker
                    name="og_from_library"
                    items={library}
                    label={t.pages.project.fromLibrary}
                    noneLabel={t.pages.project.noneOption}
                    onSelect={(url) => {
                      setDraft((p) => ({ ...p, og_image: url }));
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
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, og_image: e.target.value }))
                    }
                    style={adminInput}
                    placeholder={t.pages.project.urlPlaceholder}
                  />
                </label>
              ) : (
                <input type="hidden" name="og_image" value={draft.og_image} />
              )}
            </MediaSourceTabs>
          </section>

          <button type="submit" style={{ ...adminBtnPrimary, padding: 14, fontSize: 14 }}>
            {t.pages.project.save}
          </button>
        </HardNavForm>

        <HardNavForm action={deleteProjectAction}>
          <input type="hidden" name="id" value={draft.id} />
          <button
            type="submit"
            style={{ ...adminBtn, color: "#f66", borderColor: "#633" }}
            onClick={(e) => {
              if (!confirm(t.common.deleteConfirm)) e.preventDefault();
            }}
          >
            {t.common.delete}
          </button>
        </HardNavForm>
      </div>

      <CaseSitePreview draft={draft} saved={project} locale={locale} />
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
          <ReorderStatus pending={galleryPending} saved={gallerySaved} />
          <SortableCardGrid
            items={orderedGallery}
            onDragEnd={onGalleryDragEnd}
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 8,
            }}
            renderItem={(item) => (
              <SortableCard id={item.id} onActivate={() => undefined}>
                <div
                  style={{ display: "grid", gap: 4 }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
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
          <CaseMediaAdd
            projectId={projectId}
            blockId={block.id}
            kind="gallery"
            library={library}
            locale={locale}
            previewTitle={title}
          />
        </div>
      ) : null}
    </article>
  );
}
