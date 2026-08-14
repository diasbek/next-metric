"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { LiquidGlass } from "simple-liquid-glass";

type LiquidGlassPlaqueProps = {
  children?: ReactNode;
  className?: string;
  background?: string;
  style?: CSSProperties;
};

const FILL: CSSProperties = {
  width: "100%",
  height: "100%",
  boxShadow: "none",
};

const GLASS_TINT = "rgba(255, 255, 255, 0.38)";
const GLASS_BORDER = "rgba(255, 255, 255, 0.55)";
const DEFAULT_BG =
  "linear-gradient(145deg, rgba(243, 221, 232, 0.55), rgba(255, 255, 255, 0.72))";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LiquidGlassPlaque({
  children,
  className,
  background = DEFAULT_BG,
  style,
}: LiquidGlassPlaqueProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [radiusPx, setRadiusPx] = useState(10);
  /** Mount the WebGL/SVG layer (after paint-safe layout). */
  const [fxMounted, setFxMounted] = useState(false);
  /** Fade the FX layer in once it's in the DOM. */
  const [fxVisible, setFxVisible] = useState(false);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const sync = () => {
      const px = parseFloat(getComputedStyle(el).borderRadius);
      if (Number.isFinite(px) && px > 0) setRadiusPx(px);
    };

    sync();

    if (!prefersReducedMotion()) {
      setFxMounted(true);
    }

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    const cluster = el.closest(".metric-hero__cluster");
    if (cluster) ro.observe(cluster);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    if (!fxMounted) return;
    // Double rAF: wait until LiquidGlass has committed paint before fading in.
    let outer = 0;
    let inner = 0;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setFxVisible(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [fxMounted]);

  const shellStyle: CSSProperties = {
    ...FILL,
    ...style,
    borderRadius: "inherit",
    boxSizing: "border-box",
    background,
    border: `1px solid ${GLASS_BORDER}`,
    // Keep CSS blur until the FX layer is fully visible — avoids a gray hole.
    backdropFilter: fxVisible ? "none" : "blur(12px) saturate(160%)",
    WebkitBackdropFilter: fxVisible ? "none" : "blur(12px) saturate(160%)",
    transition: "backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease",
  };

  return (
    <div
      ref={wrapRef}
      className={`liquid-glass-plaque${fxVisible ? " is-ready" : ""} ${className ?? ""}`.trim()}
      style={shellStyle}
    >
      {fxMounted ? (
        <div
          className={`liquid-glass-plaque__fx${fxVisible ? " is-on" : ""}`}
          aria-hidden
        >
          <LiquidGlass
            mode="preset"
            style={{ ...FILL, borderRadius: radiusPx, boxShadow: "none" }}
            radius={radiusPx}
            frost={0.16}
            blur={12}
            glassColor={GLASS_TINT}
            background={background}
            border={0.08}
            borderColor={GLASS_BORDER}
            quality="standard"
            lens="rim"
            effectMode="auto"
            mobileFallback="svg"
          />
        </div>
      ) : null}

      <div className="liquid-glass-plaque__content">{children}</div>
    </div>
  );
}
