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
  const scalerRef = useRef<HTMLDivElement>(null);
  const [fitWidth, setFitWidth] = useState(viewportWidth);
  const [naturalHeight, setNaturalHeight] = useState(0);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const scaler = scalerRef.current;
    if (!canvas || !scaler) return;

    const measure = () => {
      const available = canvas.clientWidth || viewportWidth;
      setFitWidth(Math.max(1, Math.min(viewportWidth, available)));
      // scrollHeight before transform — transform does not affect layout size.
      setNaturalHeight(scaler.scrollHeight);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    ro.observe(scaler);
    return () => ro.disconnect();
  }, [viewportWidth, designWidth]);

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
    height: naturalHeight > 0 ? naturalHeight * scale : undefined,
    overflow: "hidden",
  };
  const scalerStyle: CSSProperties = {
    width: designWidth,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
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
          <div
            ref={scalerRef}
            className="admin-site-preview__scaler"
            style={scalerStyle}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
