"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { youtubeEmbedUrl } from "@/data/projects";
import { getWorkOgImagePath, ogEyebrows } from "@/utils/og/paths";
import type { AdminLocale } from "@/components/admin/ui/locales";
import { adminBtn } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";
import { orderedCaseContentBlocks } from "@/lib/cms/case-gallery";
import type { ProjectEditorData } from "./project-editor-types";

type Props = {
  draft: ProjectEditorData;
  /** Last saved snapshot — used for unsaved-copy badge. */
  saved: ProjectEditorData;
  locale: AdminLocale;
};

function copyDirty(draft: ProjectEditorData, saved: ProjectEditorData): boolean {
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
  return false;
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
}: {
  draft: ProjectEditorData;
  locale: AdminLocale;
}) {
  const t = useAdminT();
  const tr = draft.translations[locale];
  const candidateKey = `${draft.og_image}|${draft.cover_image}|${draft.status}|${draft.slug}|${locale}`;
  const candidates = useMemo(
    () => resolveOgCandidates(draft, locale),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [candidateKey],
  );
  const [index, setIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFailedAll(false);
  }, [candidateKey]);

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

export function CaseSitePreview({ draft, saved, locale }: Props) {
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
  const scale = viewportWidth / designWidth;
  const publicPath =
    locale === "en"
      ? `/works/${draft.slug}/`
      : `/${locale}/works/${draft.slug}/`;

  const authorName = (tr.author || tr.title || "").trim() || t.pages.project.titlePlaceholder;
  const tags = tr.tags
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

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

      <div
        style={{
          border: "1px solid #333",
          background: "#fafafa",
          padding: 12,
          overflow: "hidden",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            width: viewportWidth,
            maxWidth: "100%",
            margin: "0 auto",
            maxHeight: 640,
            overflow: "auto",
          }}
        >
          <div
            style={{
              width: designWidth,
              zoom: scale,
              background: "#fff",
              color: "#111",
              fontSize: 16,
              lineHeight: 1.4,
            }}
          >
            <div style={{ padding: "28px 28px 0", display: "grid", gap: 20 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 48,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                {authorName}
              </h1>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: device === "desktop" ? "1.2fr 1fr" : "1fr",
                  gap: 24,
                }}
              >
                <div style={{ display: "grid", gap: 16 }}>
                  {tr.role ? (
                    <p style={{ margin: 0, fontSize: 18, color: "#444" }}>{tr.role}</p>
                  ) : null}
                  {tr.case_task ? (
                    <div>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: 12,
                          color: "#888",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {t.pages.project.caseTask}
                      </p>
                      <p style={{ margin: 0, fontSize: 16 }}>{tr.case_task}</p>
                    </div>
                  ) : null}
                </div>
                <div style={{ display: "grid", gap: 16 }}>
                  {tags.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "#f0f0f0",
                            fontSize: 13,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {tr.description ? (
                    <p style={{ margin: 0, fontSize: 16, color: "#333" }}>{tr.description}</p>
                  ) : null}
                  {tr.case_solution ? (
                    <div>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: 12,
                          color: "#888",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {t.pages.project.caseSolution}
                      </p>
                      <p style={{ margin: 0, fontSize: 16 }}>{tr.case_solution}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28, display: "grid", gap: 0 }}>
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
                  return (
                    <div key={block.id} style={{ display: "grid", gap: 0 }}>
                      {block.images.map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={`${img.src}-${i}`}
                          src={img.src}
                          alt={img.alt || ""}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            verticalAlign: "top",
                          }}
                        />
                      ))}
                    </div>
                  );
                }
                if (block.type === "before_after") {
                  return (
                    <div
                      key={block.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 4,
                        padding: "12px 0",
                      }}
                    >
                      {block.beforeImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={block.beforeImage}
                          alt={block.beforeAlt || "Before"}
                          style={{ width: "100%", height: "auto", display: "block" }}
                        />
                      ) : (
                        <div style={{ minHeight: 120, background: "#eee" }} />
                      )}
                      {block.afterImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={block.afterImage}
                          alt={block.afterAlt || "After"}
                          style={{ width: "100%", height: "auto", display: "block" }}
                        />
                      ) : (
                        <div style={{ minHeight: 120, background: "#eee" }} />
                      )}
                    </div>
                  );
                }
                const embed = youtubeEmbedUrl(block.youtubeUrl);
                return (
                  <div key={block.id} style={{ padding: "12px 0" }}>
                    {embed ? (
                      <div style={{ aspectRatio: "16/9", background: "#111" }}>
                        <iframe
                          src={embed}
                          title="YouTube"
                          style={{ width: "100%", height: "100%", border: 0 }}
                        />
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: "#999", fontSize: 14 }}>YouTube</p>
                    )}
                  </div>
                );
              })}
            </div>

            {tr.quote ? (
              <div style={{ padding: 28, display: "grid", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 20, lineHeight: 1.3 }}>{tr.quote}</p>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{authorName}</p>
                  {tr.role ? (
                    <p style={{ margin: 0, fontSize: 14, color: "#666" }}>{tr.role}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
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

      <OgSharePreview draft={draft} locale={locale} />
    </aside>
  );
}
