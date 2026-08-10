"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { youtubeEmbedUrl } from "@/data/projects";
import { getWorkOgImagePath } from "@/utils/og/paths";
import type { AdminLocale } from "@/components/admin/ui/locales";
import { adminBtn } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";
import type { ProjectEditorData, ProjectBlockDraft } from "./project-editor-types";

type Props = {
  draft: ProjectEditorData;
  locale: AdminLocale;
};

export function CaseSitePreview({ draft, locale }: Props) {
  const t = useAdminT();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const tr = draft.translations[locale];
  const hero =
    draft.media.find((m) => m.kind === "hero")?.url || draft.cover_image;
  const blocks = useMemo(
    () =>
      draft.blocks
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    [draft.blocks],
  );

  const designWidth = device === "desktop" ? 1280 : 390;
  const viewportWidth = device === "desktop" ? 380 : 280;
  const scale = viewportWidth / designWidth;
  const publicPath =
    locale === "en"
      ? `/works/${draft.slug}/`
      : `/${locale}/works/${draft.slug}/`;

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

      <div
        style={{
          border: "1px solid #333",
          background: "#050505",
          padding: 12,
          overflow: "hidden",
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
              // zoom shrinks layout box (Chromium/WebKit admin UIs)
              zoom: scale,
              background: "#000",
              color: "#fff",
              fontSize: 16,
              lineHeight: 1.4,
            }}
          >
            <div style={{ padding: 28, display: "grid", gap: 16 }}>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 600 }}>
                {tr.title || t.pages.project.titlePlaceholder}
              </p>
              {tr.case_year ? (
                <p style={{ margin: 0, color: "#888" }}>{tr.case_year}</p>
              ) : null}
              <p style={{ margin: 0, color: "#ccc", fontSize: 18 }}>
                {tr.description || t.pages.project.descriptionPlaceholder}
              </p>
              {tr.tags ? (
                <p style={{ margin: 0, color: "#777", fontSize: 14 }}>{tr.tags}</p>
              ) : null}
              {tr.case_task ? (
                <div>
                  <p style={{ margin: "0 0 6px", color: "#888", fontSize: 12 }}>
                    {t.pages.project.caseTask}
                  </p>
                  <p style={{ margin: 0 }}>{tr.case_task}</p>
                </div>
              ) : null}
              {tr.case_solution ? (
                <div>
                  <p style={{ margin: "0 0 6px", color: "#888", fontSize: 12 }}>
                    {t.pages.project.caseSolution}
                  </p>
                  <p style={{ margin: 0 }}>{tr.case_solution}</p>
                </div>
              ) : null}
            </div>

            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero}
                alt=""
                style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  height: 280,
                  background: "#161616",
                  display: "grid",
                  placeItems: "center",
                  color: "#555",
                }}
              >
                Hero
              </div>
            )}

            {blocks.map((block) => (
              <BlockPreview key={block.id} block={block} media={draft.media} />
            ))}
          </div>
        </div>
      </div>

      <Link
        href={publicPath}
        target="_blank"
        rel="noreferrer"
        style={{ ...adminBtn, textDecoration: "none", justifySelf: "start" }}
      >
        {t.pages.project.openOnSite} →
      </Link>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#888" }}>OG</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            draft.og_image ||
            getWorkOgImagePath(
              locale,
              draft.slug,
            )
          }
          alt="OG preview"
          style={{
            width: "100%",
            aspectRatio: "1200 / 630",
            objectFit: "cover",
            border: "1px solid #333",
            background: "#111",
          }}
        />
      </div>
    </aside>
  );
}

function BlockPreview({
  block,
  media,
}: {
  block: ProjectBlockDraft;
  media: ProjectEditorData["media"];
}) {
  if (block.type === "youtube") {
    const embed = youtubeEmbedUrl(block.youtube_url || "");
    return (
      <div style={{ padding: 20 }}>
        {embed ? (
          <div style={{ aspectRatio: "16/9", background: "#111" }}>
            <iframe
              src={embed}
              title="preview"
              style={{ width: "100%", height: "100%", border: 0 }}
            />
          </div>
        ) : (
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>YouTube</p>
        )}
      </div>
    );
  }

  if (block.type === "before_after") {
    const before = media.find((m) => m.block_id === block.id && m.kind === "before");
    const after = media.find((m) => m.block_id === block.id && m.kind === "after");
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          padding: 20,
        }}
      >
        {before ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={before.url}
            alt=""
            style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }}
          />
        ) : (
          <div style={{ aspectRatio: "1", background: "#1a1a1a" }} />
        )}
        {after ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={after.url}
            alt=""
            style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }}
          />
        ) : (
          <div style={{ aspectRatio: "1", background: "#1a1a1a" }} />
        )}
      </div>
    );
  }

  const images = media
    .filter((m) => m.block_id === block.id && m.kind === "gallery")
    .sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div style={{ display: "grid", gap: 10, padding: 20 }}>
      {images.map((img) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.id}
          src={img.url}
          alt=""
          style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover" }}
        />
      ))}
      {images.length === 0 ? (
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Gallery</p>
      ) : null}
    </div>
  );
}
