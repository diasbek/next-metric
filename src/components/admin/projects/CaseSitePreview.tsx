"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { youtubeEmbedUrl } from "@/data/projects";
import { getWorkOgImagePath, ogEyebrows } from "@/utils/og/paths";
import type { AdminLocale } from "@/components/admin/ui/locales";
import { adminBtn } from "@/components/admin/ui/styles";
import { AdminSiteScaleFrame } from "@/components/admin/preview/AdminSiteScaleFrame";
import { useAdminT } from "@/i18n/admin";
import { orderedCaseContentBlocks } from "@/lib/cms/case-gallery";
import type { ProjectEditorData } from "./project-editor-types";

type Props = {
  draft: ProjectEditorData;
  /** Last saved snapshot — used for unsaved-copy badge. */
  saved: ProjectEditorData;
  locale: AdminLocale;
  /** Live generate preview (data URL) before/while Generate mode. */
  ogPreviewDataUrl?: string | null;
};

export function isProjectEditorDirty(
  draft: ProjectEditorData,
  saved: ProjectEditorData,
): boolean {
  if (
    draft.slug !== saved.slug ||
    draft.status !== saved.status ||
    draft.sphere !== saved.sphere ||
    draft.sort_order !== saved.sort_order ||
    draft.featured !== saved.featured ||
    draft.cover_image !== saved.cover_image ||
    draft.og_image !== saved.og_image ||
    draft.seo_indexable !== saved.seo_indexable
  ) {
    return true;
  }
  for (const locale of Object.keys(draft.translations) as AdminLocale[]) {
    const a = draft.translations[locale];
    const b = saved.translations[locale];
    if (!a || !b) return true;
    if (
      a.title !== b.title ||
      a.description !== b.description ||
      a.tags !== b.tags ||
      a.case_year !== b.case_year ||
      a.case_task !== b.case_task ||
      a.case_solution !== b.case_solution ||
      a.author !== b.author ||
      a.role !== b.role ||
      a.quote !== b.quote ||
      a.meta_title !== b.meta_title ||
      a.meta_description !== b.meta_description ||
      a.keywords !== b.keywords
    ) {
      return true;
    }
  }
  const draftReviews = draft.reviews
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const savedReviews = saved.reviews
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  if (draftReviews.length !== savedReviews.length) return true;
  for (let i = 0; i < draftReviews.length; i += 1) {
    const a = draftReviews[i];
    const b = savedReviews[i];
    if (a.id !== b.id || a.sort_order !== b.sort_order) return true;
    if (a.person_image !== b.person_image) return true;
    for (const locale of Object.keys(a.translations) as AdminLocale[]) {
      const at = a.translations[locale];
      const bt = b.translations[locale];
      if (!at || !bt) return true;
      if (
        at.author !== bt.author ||
        at.role !== bt.role ||
        at.quote !== bt.quote
      ) {
        return true;
      }
    }
  }
  return false;
}

function copyDirty(draft: ProjectEditorData, saved: ProjectEditorData): boolean {
  return isProjectEditorDirty(draft, saved);
}

function resolveOgCandidates(draft: ProjectEditorData, locale: AdminLocale): string[] {
  const custom = draft.og_image.trim();
  const cover = draft.cover_image.trim();
  const out: string[] = [];
  if (custom) out.push(custom);
  if (cover && cover !== custom) out.push(cover);
  // /og/.../works/[slug] only resolves published CMS cases — drafts 404.
  if (draft.status === "published" && draft.slug.trim()) {
    out.push(getWorkOgImagePath(locale, draft.slug));
  }
  return out;
}

function OgSharePreview({
  draft,
  locale,
  previewDataUrl,
}: {
  draft: ProjectEditorData;
  locale: AdminLocale;
  previewDataUrl?: string | null;
}) {
  const t = useAdminT();
  const tr = draft.translations[locale];
  const candidateKey = `${draft.og_image}|${draft.cover_image}|${draft.status}|${draft.slug}|${locale}|${previewDataUrl ?? ""}`;
  const candidates = useMemo(() => {
    if (previewDataUrl) return [previewDataUrl];
    return resolveOgCandidates(draft, locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateKey]);
  const [index, setIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);
  const [renderedKey, setRenderedKey] = useState(candidateKey);

  // Restart the candidate walk when the source list changes.
  if (renderedKey !== candidateKey) {
    setRenderedKey(candidateKey);
    setIndex(0);
    setFailedAll(false);
  }

  const src = !failedAll && index < candidates.length ? candidates[index] : null;
  const title =
    (tr.meta_title || tr.title || "").replace(/\s*—\s*METRIC$/i, "").trim() ||
    t.pages.project.titlePlaceholder;
  const description =
    (tr.meta_description || tr.description || "").trim() ||
    t.pages.project.descriptionPlaceholder;
  const eyebrow = ogEyebrows[locale].works;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#888" }}>{t.pages.project.ogImage}</span>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1200 / 630",
          border: "1px solid #333",
          background: "#111",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            onError={() => {
              setIndex((i) => {
                const next = i + 1;
                if (next >= candidates.length) setFailedAll(true);
                return next;
              });
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              width: "100%",
              height: "100%",
              background: "#fff",
              color: "#090909",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "14px 12px",
                minWidth: 0,
              }}
            >
              <strong
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "#ff3c82",
                  textTransform: "uppercase",
                }}
              >
                {eyebrow}
              </strong>
              <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.15,
                    overflowWrap: "anywhere",
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    lineHeight: 1.3,
                    color: "#444",
                    overflowWrap: "anywhere",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {description}
                </p>
              </div>
              <span style={{ fontSize: 10, color: "#888" }}>metric.graphics</span>
            </div>
            <div
              style={{
                background:
                  "linear-gradient(145deg, #f3e0ef, #ead4e8 40%, rgba(38,0,255,0.12))",
                borderLeft: "1px solid #eee",
              }}
            />
          </div>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
        {src ? t.settings.ogPreviewHint : t.pages.project.ogPreviewEmpty}
      </p>
    </div>
  );
}

export function CaseSitePreview({ draft, saved, locale, ogPreviewDataUrl }: Props) {
  const t = useAdminT();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const tr = draft.translations[locale];
  const unsaved = copyDirty(draft, saved);
  const contentBlocks = useMemo(
    () => orderedCaseContentBlocks(draft.blocks, draft.media),
    [draft.blocks, draft.media],
  );

  const designWidth = device === "desktop" ? 1280 : 390;
  const viewportWidth = device === "desktop" ? 380 : 280;
  const publicPath =
    locale === "en"
      ? `/works/${draft.slug}/`
      : `/${locale}/works/${draft.slug}/`;

  const pageTitle = tr.title.trim() || t.pages.project.titlePlaceholder;
  const tags = tr.tags
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const taskLabel = locale === "de" ? "Aufgabe:" : "Task:";
  const solutionLabel = locale === "de" ? "Lösung:" : "Solution:";
  const previewReviews = useMemo(
    () =>
      draft.reviews
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((review) => review.translations[locale])
        .filter((row) => Boolean(row.quote.trim() || row.author.trim() || row.role.trim())),
    [draft.reviews, locale],
  );

  return (
    <aside
      style={{
        position: "sticky",
        top: 72,
        alignSelf: "start",
        display: "grid",
        gap: 12,
        width: "100%",
        maxWidth: 420,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <strong style={{ fontSize: 13 }}>{t.pages.project.sitePreview}</strong>
        <div style={{ display: "flex", gap: 6 }}>
          {(["desktop", "mobile"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDevice(mode)}
              style={{
                ...adminBtn,
                padding: "6px 10px",
                fontSize: 12,
                background: device === mode ? "#fff" : "#1a1a1a",
                color: device === mode ? "#000" : "#fff",
              }}
            >
              {mode === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>
      </div>

      {unsaved ? (
        <p
          style={{
            margin: 0,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#3a2a00",
            border: "1px solid #a67c00",
            color: "#f5d78e",
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          {t.pages.project.previewUnsaved}
        </p>
      ) : null}
      <p style={{ margin: 0, fontSize: 11, color: "#777", lineHeight: 1.35 }}>
        {t.pages.project.previewMediaHint}
      </p>

      <div style={{ maxHeight: 640, overflow: "auto" }}>
        <AdminSiteScaleFrame
          designWidth={designWidth}
          viewportWidth={viewportWidth}
          className={[
            "admin-site-preview--case-page",
            device === "desktop"
              ? "admin-site-preview--case-page-desktop"
              : "admin-site-preview--case-page-mobile",
          ].join(" ")}
        >
          <article className="metric-case" style={{ paddingBlock: "40px 48px" }}>
            <div className="page-container metric-case__shell" style={{ paddingInline: 40 }}>
              <header className="metric-case__intro">
                <h1 className="metric-case__title font-display">{pageTitle}</h1>

                <div className="metric-case__grid">
                  <div className="metric-case__col metric-case__col--main">
                    {tr.case_task ? (
                      <div className="metric-case__brief">
                        <p className="metric-case__brief-label">{taskLabel}</p>
                        <p className="metric-case__brief-text">{tr.case_task}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="metric-case__col metric-case__col--aside">
                    <div className="metric-case__meta">
                      {tags.length ? (
                        <div className="metric-case__tags">
                          {tags.map((tag) => (
                            <span key={tag} className="metric-pill metric-case__tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {tr.description ? (
                        <p className="metric-case__lede">{tr.description}</p>
                      ) : null}
                    </div>
                    {tr.case_solution ? (
                      <div className="metric-case__brief">
                        <p className="metric-case__brief-label">{solutionLabel}</p>
                        <p className="metric-case__brief-text">{tr.case_solution}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </header>

              <div className="metric-case__content" style={{ marginTop: 40 }}>
                <div className="metric-case__stack">
                  {contentBlocks.map((block) => {
                    if (block.type === "gallery") {
                      if (!block.images.length) {
                        return (
                          <p
                            key={block.id}
                            style={{ margin: 0, padding: 24, color: "#999", fontSize: 14 }}
                          >
                            Gallery
                          </p>
                        );
                      }
                      return block.images.map((img, i) => (
                        <div
                          key={`${block.id}-${img.src}-${i}`}
                          className="metric-case__stack-item"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.src}
                            alt={img.alt || ""}
                            className="metric-case__stack-img"
                          />
                        </div>
                      ));
                    }
                    if (block.type === "before_after") {
                      return (
                        <div
                          key={block.id}
                          className="metric-case__stack-item metric-case__block--ba"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 4,
                          }}
                        >
                          {block.beforeImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={block.beforeImage}
                              alt={block.beforeAlt || "Before"}
                              className="metric-case__stack-img"
                            />
                          ) : (
                            <div style={{ minHeight: 120, background: "#eee" }} />
                          )}
                          {block.afterImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={block.afterImage}
                              alt={block.afterAlt || "After"}
                              className="metric-case__stack-img"
                            />
                          ) : (
                            <div style={{ minHeight: 120, background: "#eee" }} />
                          )}
                        </div>
                      );
                    }
                    const embed = youtubeEmbedUrl(block.youtubeUrl);
                    return (
                      <div key={block.id} className="metric-case__stack-item">
                        {embed ? (
                          <div className="metric-case__youtube">
                            <iframe src={embed} title="YouTube" />
                          </div>
                        ) : (
                          <p style={{ margin: 0, color: "#999", fontSize: 14 }}>YouTube</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {previewReviews.length ? (
                <div
                  className="metric-case__reviews metric-case__reviews--preview"
                  style={{ marginTop: 40 }}
                >
                  {previewReviews.map((review, index) => {
                    const name =
                      (review.author || tr.title || "").trim() ||
                      t.pages.project.titlePlaceholder;
                    const role = review.role.trim();
                    const titleKey = pageTitle.trim().toLowerCase();
                    const nameKey = name.toLowerCase();
                    const roleKey = role.toLowerCase();
                    const showCase = Boolean(titleKey) && titleKey !== nameKey;
                    const showRole =
                      Boolean(roleKey) &&
                      roleKey !== titleKey &&
                      roleKey !== nameKey;
                    return (
                      <blockquote key={`${index}-${name}`} className="metric-case__review">
                        {showCase ? (
                          <p className="metric-case__review-case">{pageTitle}</p>
                        ) : null}
                        <footer style={{ marginTop: 0, marginBottom: review.quote ? 16 : 0 }}>
                          {name ? (
                            <strong className="metric-case__review-name">{name}</strong>
                          ) : null}
                          {showRole ? (
                            <p className="metric-case__review-role">{role}</p>
                          ) : null}
                        </footer>
                        {review.quote ? (
                          <p className="metric-case__review-quote" style={{ fontSize: 22 }}>
                            {review.quote}
                          </p>
                        ) : null}
                      </blockquote>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </article>
        </AdminSiteScaleFrame>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <Link
          href={publicPath}
          target="_blank"
          rel="noreferrer"
          style={{ ...adminBtn, textDecoration: "none", justifySelf: "start" }}
        >
          {t.pages.project.openOnSite} →
        </Link>
        <span style={{ fontSize: 11, color: "#777" }}>{t.pages.project.previewLiveHint}</span>
      </div>

      <OgSharePreview draft={draft} locale={locale} previewDataUrl={ogPreviewDataUrl} />
    </aside>
  );
}
