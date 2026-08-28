"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ImagePreset, SurfaceKind } from "./presets";
import { CASE_CARD_MEDIA_ASPECT_CSS } from "./presets";

type SurfacePreviewProps = {
  surface: SurfaceKind;
  imageUrl: string | null;
  /** Optional text chrome from the entity being edited */
  title?: string;
  subtitle?: string;
  quote?: string;
  author?: string;
  role?: string;
  tags?: string[];
  ctaLabel?: string;
  /** Highlight as live editing target */
  interactive?: boolean;
  children?: ReactNode;
  className?: string;
};

const pageShell: CSSProperties = {
  background: "#050505",
  border: "1px solid #2a2a2a",
  padding: 12,
  color: "#fff",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflow: "hidden",
};

/** Mirrors public `.metric-case-card` (works / home) — light card on dark admin chrome. */
function CaseCardChrome({
  imageUrl,
  quote,
  author,
  role,
  tags,
  ctaLabel,
  layout,
  interactive,
  children,
}: {
  imageUrl: string | null;
  quote: string;
  author: string;
  role: string;
  tags: string[];
  ctaLabel: string;
  layout: "desktop" | "mobile";
  interactive?: boolean;
  children?: ReactNode;
}) {
  const ring = interactive
    ? { outline: "1px solid #2600ff", outlineOffset: 2 }
    : {};

  const media = (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: CASE_CARD_MEDIA_ASPECT_CSS,
        overflow: "hidden",
        borderRadius: layout === "desktop" ? 20 : 16,
        background: "#111",
        flexShrink: 0,
      }}
    >
      {children ?? <CoverImage url={imageUrl} />}
    </div>
  );

  const body = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: layout === "desktop" ? 16 : 14,
        minWidth: 0,
        padding: layout === "desktop" ? "4px 4px 4px 0" : 0,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {(tags.length ? tags : ["Listing"]).map((tag) => (
          <span
            key={tag}
            style={{
              border: "1px solid #111",
              padding: "6px 10px",
              fontSize: 11,
              color: "#111",
              background: "transparent",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: layout === "desktop" ? 22 : 18,
            fontWeight: 600,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: "#111",
            overflowWrap: "anywhere",
          }}
        >
          {quote}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: layout === "desktop" ? 14 : 13,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "#111",
            overflowWrap: "anywhere",
          }}
        >
          {author}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: layout === "desktop" ? 12 : 12,
            letterSpacing: "-0.02em",
            color: "#333",
            overflowWrap: "anywhere",
          }}
        >
          {role}
        </p>
      </div>
      <span
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          padding: "10px 16px",
          fontSize: 12,
          fontWeight: 600,
          color: "#fff",
          background: "#111",
          border: "1px solid #111",
        }}
      >
        {ctaLabel}
      </span>
    </div>
  );

  return (
    <div
      className="admin-surface-preview"
      style={{
        ...pageShell,
        ...ring,
        background: "#f3f3f3",
        border: "1px solid #ddd",
        maxWidth: layout === "mobile" ? 240 : "100%",
      }}
    >
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#666" }}>
        {layout === "desktop"
          ? "Works → case card (desktop)"
          : "Works → case card (mobile)"}
        {" · "}
        3000 × 2347
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: layout === "desktop" ? "1fr 1.05fr" : "1fr",
          gap: layout === "desktop" ? 16 : 12,
          alignItems: "stretch",
          background: "#fff",
          borderRadius: layout === "desktop" ? 24 : 20,
          padding: layout === "desktop" ? 20 : 14,
          overflow: "hidden",
        }}
      >
        {layout === "desktop" ? (
          <>
            {body}
            {media}
          </>
        ) : (
          <>
            {media}
            {body}
          </>
        )}
      </div>
    </div>
  );
}

function Frame({
  aspect,
  children,
  label,
}: {
  aspect?: string;
  children: ReactNode;
  label?: string;
}) {
  return (
    <div style={{ display: "grid", gap: 8, minWidth: 0, maxWidth: "100%" }}>
      {label ? (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#777",
          }}
        >
          {label}
        </p>
      ) : null}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          ...(aspect ? { aspectRatio: aspect } : { minHeight: 120 }),
          overflow: "hidden",
          background: "#000",
          border: "1px solid #222",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CoverImage({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "#555",
          fontSize: 13,
        }}
      >
        No image
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}

export function SurfacePreview({
  surface,
  imageUrl,
  title = "Project title",
  subtitle = "Short description as on the site",
  quote,
  author,
  role,
  tags,
  ctaLabel = "View case",
  interactive = false,
  children,
}: SurfacePreviewProps) {
  const ring = interactive
    ? { outline: "1px solid #2600ff", outlineOffset: 2 }
    : {};

  if (surface === "worksHero") {
    return (
      <CaseCardChrome
        imageUrl={imageUrl}
        quote={quote?.trim() || title}
        author={author?.trim() || title}
        role={role?.trim() || subtitle}
        tags={tags?.filter(Boolean) ?? []}
        ctaLabel={ctaLabel}
        layout="desktop"
        interactive={interactive}
      >
        {children}
      </CaseCardChrome>
    );
  }

  if (surface === "projectCard") {
    return (
      <CaseCardChrome
        imageUrl={imageUrl}
        quote={quote?.trim() || title}
        author={author?.trim() || title}
        role={role?.trim() || subtitle}
        tags={tags?.filter(Boolean) ?? []}
        ctaLabel={ctaLabel}
        layout="mobile"
        interactive={interactive}
      >
        {children}
      </CaseCardChrome>
    );
  }

  if (surface === "caseFigure") {
    return (
      <div className="admin-surface-preview" style={{ ...pageShell, ...ring }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>
          Case study → gallery
        </p>
        <Frame label="Free aspect">
          {children ?? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl ?? ""}
              alt=""
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                maxHeight: 360,
                objectFit: "contain",
                background: "#000",
              }}
            />
          )}
        </Frame>
      </div>
    );
  }

  if (surface === "teamMember") {
    return (
      <div className="admin-surface-preview" style={{ ...pageShell, ...ring, maxWidth: 180 }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>
          Agency → Team
        </p>
        <div style={{ overflow: "hidden", lineHeight: 0, background: "#000" }}>
          <div style={{ position: "relative", aspectRatio: "1 / 1" }}>
            {children ?? <CoverImage url={imageUrl} />}
          </div>
        </div>
        <p style={{ margin: "16px 0 0", fontSize: 13, color: "#fff", overflowWrap: "anywhere" }}>
          {subtitle}
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 18,
            fontWeight: 500,
            overflowWrap: "anywhere",
          }}
        >
          {title}
        </p>
      </div>
    );
  }

  if (surface === "testimonial") {
    return (
      <div className="admin-surface-preview" style={{ ...pageShell, ...ring }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>
          Agency → Testimonials
        </p>
        <article
          style={{
            border: "1px solid rgba(255,255,255,0.3)",
            padding: 16,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 20,
            minWidth: 0,
          }}
        >
          <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 500,
                overflowWrap: "anywhere",
              }}
            >
              {subtitle}
            </p>
            <p
              className="admin-surface-preview__quote"
              style={{ margin: 0, fontWeight: 500, lineHeight: 1.25 }}
            >
              «{quote ?? "Quote text appears here as on the Agency page"}»
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div
              style={{
                position: "relative",
                width: 56,
                height: 56,
                overflow: "hidden",
                flexShrink: 0,
                background: "#111",
                border: interactive ? "1px solid #2600ff" : "1px solid #333",
              }}
            >
              {children ?? <CoverImage url={imageUrl} />}
            </div>
            <span style={{ fontSize: 13, color: "#aaa", overflowWrap: "anywhere" }}>
              {title}
            </span>
          </div>
        </article>
      </div>
    );
  }

  if (surface === "logoBadge") {
    return (
      <div className="admin-surface-preview" style={{ ...pageShell, ...ring }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>
          Testimonials → logo
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid rgba(255,255,255,0.3)",
            padding: 12,
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 96,
              height: 48,
              background: "#111",
              overflow: "hidden",
            }}
          >
            {children ??
              (imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span style={{ color: "#555", fontSize: 11 }}>Logo</span>
              ))}
          </div>
          <span style={{ fontSize: 13, color: "#aaa" }}>{title || "Client"}</span>
        </div>
      </div>
    );
  }

  // free
  return (
    <div className="admin-surface-preview" style={{ ...pageShell, ...ring }}>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>Media</p>
      <Frame aspect="4 / 3">
        {children ?? <CoverImage url={imageUrl} />}
      </Frame>
    </div>
  );
}

/** Mobile case-card peek (same public MetricCaseCard, stacked). */
export function ProjectCardPeek({
  imageUrl,
  title,
  quote,
  author,
  role,
  tags,
  ctaLabel,
}: {
  imageUrl: string | null;
  title?: string;
  quote?: string;
  author?: string;
  role?: string;
  tags?: string[];
  ctaLabel?: string;
}) {
  return (
    <SurfacePreview
      surface="projectCard"
      imageUrl={imageUrl}
      title={title ?? "Case"}
      quote={quote}
      author={author}
      role={role}
      tags={tags}
      ctaLabel={ctaLabel}
    />
  );
}

export function surfaceAspectCss(preset: ImagePreset): string | undefined {
  if (!preset.aspect) return undefined;
  if (preset.surface === "worksHero" || preset.surface === "projectCard") {
    return CASE_CARD_MEDIA_ASPECT_CSS;
  }
  if (preset.surface === "teamMember" || preset.surface === "testimonial") return "1 / 1";
  if (preset.key === "ogSocial") return "1200 / 630";
  return `${Math.round(preset.aspect * 1000)} / 1000`;
}
