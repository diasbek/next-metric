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

function readBorderRadiusPx(el: HTMLElement): number {
  const style = getComputedStyle(el);
  for (const key of [
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomRightRadius",
    "borderBottomLeftRadius",
    "borderRadius",
  ] as const) {
    const px = parseFloat(style[key]);
    if (Number.isFinite(px) && px > 0) return px;
  }
  return 0;
}

export function LiquidGlassPlaque({
  children,
  className,
  background = DEFAULT_BG,
  style,
}: LiquidGlassPlaqueProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [radiusPx, setRadiusPx] = useState(10);
  const [fxMounted, setFxMounted] = useState(false);
  const [fxVisible, setFxVisible] = useState(false);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const sync = () => {
      const px = readBorderRadiusPx(el);
      if (px > 0) setRadiusPx(px);
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

  // Radius comes from CSS classes on this node — never set borderRadius: inherit
  // (that inherits the parent and zeros out plaque/trust-card rounding).
  // No CSS border/fill on the shell: LiquidGlass draws the glass edge itself.
  // A pre-FX frosted fill avoids a hole while the library mounts.
  const showCssFallback = !fxVisible;

  return (
    <div
      ref={wrapRef}
      className={`liquid-glass-plaque${fxVisible ? " is-ready" : ""} ${className ?? ""}`.trim()}
      style={{ ...FILL, ...style }}
    >
      {showCssFallback ? (
        <div
          className="liquid-glass-plaque__fallback"
          style={{
            ...FILL,
            borderRadius: radiusPx,
            background,
            backdropFilter: "blur(12px) saturate(160%)",
            WebkitBackdropFilter: "blur(12px) saturate(160%)",
          }}
          aria-hidden
        />
      ) : null}

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
