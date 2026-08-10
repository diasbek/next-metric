"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ImagePreset, SurfaceKind } from "./presets";

type SurfacePreviewProps = {
  surface: SurfaceKind;
  imageUrl: string | null;
  /** Optional text chrome from the entity being edited */
  title?: string;
  subtitle?: string;
  quote?: string;
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
          aspectRatio: aspect,
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
  quote = "Quote text appears here as on the Agency page",
  interactive = false,
  children,
}: SurfacePreviewProps) {
  const ring = interactive
    ? { outline: "1px solid #2600ff", outlineOffset: 2 }
    : {};

  if (surface === "worksHero") {
    return (
      <div className="admin-surface-preview" style={{ ...pageShell, ...ring }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>
          Works → featured
        </p>
        <Frame aspect="1432 / 902" label="1432 × 902">
          {children ?? <CoverImage url={imageUrl} />}
        </Frame>
        <div style={{ marginTop: 14, display: "grid", gap: 6, minWidth: 0 }}>
          <strong style={{ fontSize: 18, overflowWrap: "anywhere" }}>{title}</strong>
          <span style={{ fontSize: 13, color: "#bbb", overflowWrap: "anywhere" }}>{subtitle}</span>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {["Branding", "Logo"].map((tag) => (
              <span
                key={tag}
                style={{
                  border: "1px solid #444",
                  padding: "4px 8px",
                  fontSize: 11,
                  color: "#ccc",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (surface === "projectCard") {
    return (
      <div className="admin-surface-preview" style={{ ...pageShell, ...ring, maxWidth: 200 }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>
          Project card
        </p>
        <Frame aspect="701 / 486" label="701 × 486">
          {children ?? <CoverImage url={imageUrl} />}
        </Frame>
        <div style={{ marginTop: 12, display: "grid", gap: 6, minWidth: 0 }}>
          <strong style={{ fontSize: 16, overflowWrap: "anywhere" }}>{title}</strong>
          <span style={{ fontSize: 13, color: "#bbb", overflowWrap: "anywhere" }}>{subtitle}</span>
        </div>
      </div>
    );
  }

  if (surface === "caseFigure") {
    return (
      <div className="admin-surface-preview" style={{ ...pageShell, ...ring }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>
          Case study → gallery
        </p>
        <Frame aspect="1432 / 806" label="1432 × 806">
          {children ?? <CoverImage url={imageUrl} />}
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
              «{quote}»
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

/** Secondary card preview for cover uploads (same image, card crop feel). */
export function ProjectCardPeek({
  imageUrl,
  title,
}: {
  imageUrl: string | null;
  title?: string;
}) {
  return (
    <SurfacePreview
      surface="projectCard"
      imageUrl={imageUrl}
      title={title ?? "In the grid"}
      subtitle="How cover looks inside Project cards"
    />
  );
}

export function surfaceAspectCss(preset: ImagePreset): string | undefined {
  if (!preset.aspect) return undefined;
  // approximate CSS aspect-ratio string
  if (preset.surface === "worksHero") return "1432 / 902";
  if (preset.surface === "caseFigure") return "1432 / 806";
  if (preset.surface === "teamMember" || preset.surface === "testimonial") return "1 / 1";
  return `${Math.round(preset.aspect * 1000)} / 1000`;
}
