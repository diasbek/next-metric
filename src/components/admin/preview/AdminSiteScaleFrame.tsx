"use client";

import type { CSSProperties, ReactNode } from "react";

type Props = {
  designWidth: number;
  /** Visible width of the scaled frame (px). */
  viewportWidth: number;
  label?: string;
  className?: string;
  children: ReactNode;
};

/** Renders public site chrome at designWidth, scaled into a narrow admin slot. */
export function AdminSiteScaleFrame({
  designWidth,
  viewportWidth,
  label,
  className,
  children,
}: Props) {
  const scale = viewportWidth / designWidth;
  const shellStyle: CSSProperties = {
    width: viewportWidth,
    maxWidth: "100%",
    margin: "0 auto",
  };
  const scalerStyle: CSSProperties = {
    width: designWidth,
    zoom: scale,
  };

  return (
    <div className={["admin-site-preview", className].filter(Boolean).join(" ")}>
      {label ? <p className="admin-site-preview__label">{label}</p> : null}
      <div className="admin-site-preview__frame" style={shellStyle}>
        <div className="admin-site-preview__scaler" style={scalerStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}
