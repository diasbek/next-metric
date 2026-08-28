"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Props = {
  designWidth: number;
  /** Visible width of the scaled content (px), not including frame chrome padding. */
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [fitWidth, setFitWidth] = useState(viewportWidth);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const measure = () => {
      const available = el.clientWidth || viewportWidth;
      setFitWidth(Math.max(1, Math.min(viewportWidth, available)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewportWidth]);

  const scale = fitWidth / designWidth;
  // Padding lives on the outer chrome so it does not steal width from the
  // scaled canvas (border-box + padding was clipping ~20px and looking crooked).
  const shellStyle: CSSProperties = {
    width: "fit-content",
    maxWidth: "100%",
    margin: "0 auto",
  };
  const canvasStyle: CSSProperties = {
    width: viewportWidth,
    maxWidth: "100%",
    overflow: "hidden",
  };
  const scalerStyle: CSSProperties = {
    width: designWidth,
    zoom: scale,
  };

  return (
    <div className={["admin-site-preview", className].filter(Boolean).join(" ")}>
      {label ? <p className="admin-site-preview__label">{label}</p> : null}
      <div className="admin-site-preview__frame" style={shellStyle}>
        <div
          ref={canvasRef}
          className="admin-site-preview__canvas"
          style={canvasStyle}
        >
          <div className="admin-site-preview__scaler" style={scalerStyle}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
