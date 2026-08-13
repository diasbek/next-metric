"use client";

import {
  useEffect,
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

export function LiquidGlassPlaque({
  children,
  className,
  background = "linear-gradient(145deg, #f3dde8, #ffffff)",
  style,
}: LiquidGlassPlaqueProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [radiusPx, setRadiusPx] = useState(10);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const sync = () => {
      const px = parseFloat(getComputedStyle(el).borderRadius);
      if (Number.isFinite(px) && px > 0) setRadiusPx(px);
    };

    sync();
    setMounted(true);

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

  return (
    <div ref={wrapRef} className={className} style={{ ...FILL, ...style }}>
      {mounted ? (
        <LiquidGlass
          mode="preset"
          style={{ ...FILL, borderRadius: radiusPx, boxShadow: "none" }}
          radius={radiusPx}
          frost={0.16}
          blur={12}
          glassColor="rgba(255, 255, 255, 0.38)"
          background={background}
          border={0.08}
          borderColor="rgba(255, 255, 255, 0.55)"
          quality="standard"
          lens="rim"
          effectMode="auto"
          mobileFallback="svg"
        >
          {children}
        </LiquidGlass>
      ) : (
        <div
          style={{
            ...FILL,
            borderRadius: "inherit",
            background,
            backdropFilter: "blur(12px) saturate(160%)",
            WebkitBackdropFilter: "blur(12px) saturate(160%)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
