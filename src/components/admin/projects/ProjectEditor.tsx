"use client";

import { HardNavForm } from "@/components/admin/HardNavForm";
import { useMemo, useState, type CSSProperties } from "react";
import { ImageField } from "@/components/admin/image-field";
import { LibraryImagePicker } from "@/components/admin/form/LibraryImagePicker";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid,
  useOrderedItems,
  usePersistReorder,
} from "@/components/admin/dnd";
import { CaseSitePreview } from "@/components/admin/projects/CaseSitePreview";
import type {
  LibraryItem,
  ProjectBlockDraft,
  ProjectEditorData,
  ProjectTranslationDraft,
} from "@/components/admin/projects/project-editor-types";
import {
  addProjectBlockAction,
  addProjectMediaAction,
  deleteProjectAction,
  deleteProjectBlockAction,
  deleteProjectMediaAction,
  reorderProjectBlocksAction,
  saveProjectAction,
  updateProjectBlockYoutubeAction,
} from "@/app/admin/(dashboard)/works/actions";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
} from "@/components/admin/ui/styles";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
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

function isLocaleFilled(tr: ProjectTranslationDraft): boolean {
  return Boolean(tr.title.trim() && tr.description.trim());
}

export function ProjectEditor({ project, library }: Props) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("ru");
  const [draft, setDraft] = useState(project);
  const [coverPreview, setCoverPreview] = useState(project.cover_image);
  const tr = draft.translations[locale];

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

  const heroMedia = draft.media.find((m) => m.kind === "hero");

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

      <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
        <AdminPageHeader
          title={tr.title || t.pages.project.title}
          description={formatAdminMessage(t.pages.project.description, { filled })}
        />

        <HardNavForm
          action={saveProjectAction}
          encType="multipart/form-data"
          style={{ display: "grid", gap: 20 }}
        >
          <input type="hidden" name="id" value={draft.id} />
          {ADMIN_LOCALES.map((l) => {
            const row = draft.translations[l.code];
            return (
              <div key={l.code} style={{ display: "none" }} aria-hidden>
                <input type="hidden" name={`${l.code}_title`} value={row.title} />
                <input
                  type="hidden"
                  name={`${l.code}_description`}
                  value={row.description}
                />
                <input type="hidden" name={`${l.code}_tags`} value={row.tags} />
                <input
                  type="hidden"
                  name={`${l.code}_case_year`}
                  value={row.case_year}
                />
                <input
                  type="hidden"
                  name={`${l.code}_case_task`}
                  value={row.case_task}
                />
                <input
                  type="hidden"
                  name={`${l.code}_case_solution`}
                  value={row.case_solution}
                />
                <input
                  type="hidden"
                  name={`${l.code}_meta_title`}
                  value={row.meta_title}
                />
                <input
                  type="hidden"
                  name={`${l.code}_meta_description`}
                  value={row.meta_description}
                />
                <input
                  type="hidden"
                  name={`${l.code}_keywords`}
                  value={row.keywords}
                />
              </div>
            );
          })}

          <section style={sectionBox}>
            <h2 style={sectionTitle}>1. {t.pages.project.general}</h2>
            <div className="admin-form-2col">
              <label style={{ fontSize: 13 }}>
                {t.pages.project.slug}
                <input
                  name="slug"
                  value={draft.slug}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, slug: e.target.value }))
                  }
                  style={adminInput}
                />
              </label>
              <label style={{ fontSize: 13 }}>
                Status
                <select
                  name="status"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, status: e.target.value }))
                  }
                  style={adminInput}
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
              </label>
              <label style={{ fontSize: 13 }}>
                {t.pages.project.sphere}
                <input
                  name="sphere"
                  value={draft.sphere}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, sphere: e.target.value }))
                  }
                  style={adminInput}
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
                onChange={(e) =>
                  setDraft((p) => ({ ...p, featured: e.target.checked }))
                }
              />
              {t.pages.project.featured}
            </label>

            <ImageField
              name="cover_file"
              preset="projectCover"
              currentUrl={coverPreview || null}
              label={t.common.cover}
              previewTitle={tr.title || t.pages.project.title}
              onReady={(file) => {
                if (!file) return;
                setCoverPreview(URL.createObjectURL(file));
              }}
            />
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
              />
            </label>
            {library.length > 0 ? (
              <LibraryImagePicker
                name="cover_from_library"
                items={library}
                label={t.pages.project.fromLibrary}
                noneLabel={t.pages.project.noneOption}
                onSelect={(url) => {
                  if (!url) return;
                  setDraft((p) => ({ ...p, cover_image: url }));
                  setCoverPreview(url);
                }}
              />
            ) : null}
          </section>

          <section style={sectionBox}>
            <h2 style={sectionTitle}>2. {t.pages.project.caseText}</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ADMIN_LOCALES.map((l) => {
                const active = locale === l.code;
                const ok = isLocaleFilled(draft.translations[l.code]);
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLocale(l.code)}
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
                        background: ok ? "#3d3" : "#555",
                      }}
                    />
                    {l.short}
                  </button>
                );
              })}
            </div>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.title}
              <input
                value={tr.title}
                onChange={(e) => updateLocale({ title: e.target.value })}
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
            <label style={{ fontSize: 13 }}>
              {t.pages.project.tags}
              <input
                value={tr.tags}
                onChange={(e) => updateLocale({ tags: e.target.value })}
                style={adminInput}
              />
            </label>
            <div className="admin-form-2col">
              <label style={{ fontSize: 13 }}>
                {t.pages.project.caseYear}
                <input
                  value={tr.case_year}
                  onChange={(e) => updateLocale({ case_year: e.target.value })}
                  style={adminInput}
                />
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

          <button type="submit" style={{ ...adminBtnPrimary, padding: 14, fontSize: 14 }}>
            {t.pages.project.save}
          </button>

          <section style={sectionBox}>
            <h2 style={sectionTitle}>4. {t.pages.project.seoSection}</h2>
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
                placeholder={tr.title || `${tr.title} — METRIC`}
              />
              <span style={{ fontSize: 11, color: "#666" }}>
                {(tr.meta_title || tr.title).length}/60
              </span>
            </label>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.metaDescription}
              <textarea
                value={tr.meta_description}
                onChange={(e) =>
                  updateLocale({ meta_description: e.target.value })
                }
                style={{ ...adminInput, minHeight: 72 }}
                placeholder={tr.description}
              />
              <span style={{ fontSize: 11, color: "#666" }}>
                {(tr.meta_description || tr.description).length}/160
              </span>
            </label>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.keywords}
              <input
                value={tr.keywords}
                onChange={(e) => updateLocale({ keywords: e.target.value })}
                style={adminInput}
                placeholder="logo, branding, …"
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
                {tr.meta_title || `${tr.title || "METRIC"} — METRIC`}
              </p>
              <p style={{ margin: "0 0 4px", color: "#006621", fontSize: 12 }}>
                metric.agency/works/{draft.slug}/
              </p>
              <p style={{ margin: 0, color: "#545454", fontSize: 13 }}>
                {tr.meta_description || tr.description || "…"}
              </p>
            </div>
            <label style={{ fontSize: 13 }}>
              {t.pages.project.ogImage}
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
            <ImageField
              name="og_file"
              preset="free"
              currentUrl={draft.og_image || null}
              label={t.pages.project.ogImage}
            />
            {library.length > 0 ? (
              <LibraryImagePicker
                name="og_from_library"
                items={library}
                label={t.pages.project.fromLibrary}
                noneLabel={t.pages.project.noneOption}
                onSelect={(url) => {
                  if (!url) return;
                  setDraft((p) => ({ ...p, og_image: url }));
                }}
              />
            ) : null}
          </section>

          <button type="submit" style={{ ...adminBtnPrimary, padding: 14, fontSize: 14 }}>
            {t.pages.project.save}
          </button>
        </HardNavForm>

        <section style={sectionBox}>
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
                <button type="submit" style={adminBtn}>
                  {label}
                </button>
              </HardNavForm>
            ))}
          </div>

          <HardNavForm
            action={addProjectMediaAction}
            encType="multipart/form-data"
            style={{ display: "grid", gap: 10, borderTop: "1px solid #222", paddingTop: 12 }}
          >
            <input type="hidden" name="project_id" value={draft.id} />
            <input type="hidden" name="kind" value="hero" />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
              {t.pages.project.heroImage}
            </p>
            {heroMedia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroMedia.url}
                alt=""
                style={{ width: "100%", maxWidth: 360, aspectRatio: "16/9", objectFit: "cover" }}
              />
            ) : null}
            <ImageField name="file" preset="projectCase" label={t.common.file} />
            <button type="submit" style={adminBtn}>
              {heroMedia ? t.pages.project.replaceImage : t.pages.project.addMedia}
            </button>
          </HardNavForm>

          <ReorderStatus pending={pending} saved={saved} />
          <SortableCardGrid
            items={ordered}
            onDragEnd={onDragEnd}
            style={{
              gridTemplateColumns: "1fr",
            }}
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

      <CaseSitePreview draft={draft} locale={locale} />
    </div>
  );
}

function BlockCard({
  block,
  projectId,
  media,
  library,
  title,
  onYoutubeChange,
}: {
  block: ProjectBlockDraft;
  projectId: string;
  media: ProjectEditorData["media"];
  library: LibraryItem[];
  title: string;
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
                      style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
                    />
                    <HardNavForm action={deleteProjectMediaAction}>
                      <input type="hidden" name="project_id" value={projectId} />
                      <input type="hidden" name="media_id" value={current.id} />
                      <button type="submit" style={{ ...adminBtn, color: "#f66", borderColor: "#633" }}>
                        {t.common.delete}
                      </button>
                    </HardNavForm>
                  </>
                ) : null}
                <HardNavForm
                  action={addProjectMediaAction}
                  encType="multipart/form-data"
                  style={{ display: "grid", gap: 8 }}
                >
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="block_id" value={block.id} />
                  <input type="hidden" name="kind" value={kind} />
                  <ImageField
                    name="file"
                    preset="projectCase"
                    label={current ? t.pages.project.replaceImage : t.common.file}
                    previewTitle={title}
                    previewSubtitle={sideLabel}
                  />
                  {library.length > 0 ? (
                    <LibraryImagePicker
                      name="library_url"
                      items={library}
                      label={t.pages.project.fromLibrary}
                      noneLabel={t.pages.project.noneOption}
                    />
                  ) : null}
                  <button type="submit" style={adminBtn}>
                    {current ? t.pages.project.replaceImage : t.pages.project.addMedia}
                  </button>
                </HardNavForm>
              </div>
            );
          })}
        </div>
      ) : null}

      {block.type === "gallery" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 8,
            }}
          >
            {blockMedia
              .filter((m) => m.kind === "gallery")
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((item) => (
                <div key={item.id} style={{ display: "grid", gap: 4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }}
                  />
                  <HardNavForm action={deleteProjectMediaAction}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="media_id" value={item.id} />
                    <button type="submit" style={{ ...adminBtn, color: "#f66", borderColor: "#633", padding: 4, fontSize: 11 }}>
                      {t.common.delete}
                    </button>
                  </HardNavForm>
                </div>
              ))}
          </div>
          <HardNavForm
            action={addProjectMediaAction}
            encType="multipart/form-data"
            style={{ display: "grid", gap: 8 }}
          >
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="block_id" value={block.id} />
            <input type="hidden" name="kind" value="gallery" />
            <ImageField name="file" preset="projectCase" label={t.common.file} previewTitle={title} />
            <label style={{ fontSize: 13 }}>
              URL
              <input name="url" style={adminInput} placeholder={t.pages.project.urlPlaceholder} />
            </label>
            {library.length > 0 ? (
              <LibraryImagePicker
                name="library_url"
                items={library}
                label={t.pages.project.fromLibrary}
                noneLabel={t.pages.project.noneOption}
              />
            ) : null}
            <button type="submit" style={adminBtn}>
              {t.pages.project.addMedia}
            </button>
          </HardNavForm>
        </div>
      ) : null}
    </article>
  );
}
