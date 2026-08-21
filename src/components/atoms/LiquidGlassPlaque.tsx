"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type TransitionEvent,
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

type FallbackPhase = "solid" | "fading" | "gone";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
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
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => true,
  );
  const fxMounted = !reducedMotion;
  const [fxOn, setFxOn] = useState(false);
  const [fallbackPhase, setFallbackPhase] = useState<FallbackPhase>("solid");

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const sync = () => {
      const px = readBorderRadiusPx(el);
      if (px > 0) setRadiusPx(px);
    };

    sync();

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
    if (!fxMounted) {
      setFxOn(false);
      setFallbackPhase("solid");
      return;
    }
    let outer = 0;
    let inner = 0;
    outer = requestAnimationFrame(() => {
      // Paint FX at opacity 0 under the solid fallback, then fade FX in.
      inner = requestAnimationFrame(() => setFxOn(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [fxMounted]);

  // If transitionend never fires (tab background, reduced transitions), still peel fallback.
  useEffect(() => {
    if (!fxOn || fallbackPhase !== "solid") return;
    const timer = window.setTimeout(() => setFallbackPhase("fading"), 420);
    return () => window.clearTimeout(timer);
  }, [fxOn, fallbackPhase]);

  useEffect(() => {
    if (fallbackPhase !== "fading") return;
    const timer = window.setTimeout(() => setFallbackPhase("gone"), 280);
    return () => window.clearTimeout(timer);
  }, [fallbackPhase]);

  const onFxTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity") return;
    if (event.target !== event.currentTarget) return;
    if (!fxOn) return;
    // Glass is fully on — only then peel the CSS fallback away.
    setFallbackPhase((phase) => (phase === "solid" ? "fading" : phase));
  };

  const onFallbackTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity") return;
    if (event.target !== event.currentTarget) return;
    if (fallbackPhase !== "fading") return;
    setFallbackPhase("gone");
  };

  const showCssFallback = !fxMounted || fallbackPhase !== "gone";
  const ready = fxOn && fallbackPhase === "gone";

  return (
    <div
      ref={wrapRef}
      className={`liquid-glass-plaque${ready ? " is-ready" : ""} ${className ?? ""}`.trim()}
      style={{ ...FILL, ...style }}
    >
      {showCssFallback ? (
        <div
          className={`liquid-glass-plaque__fallback${fallbackPhase === "fading" ? " is-fading" : ""}`}
          style={{
            ...FILL,
            borderRadius: radiusPx,
            background,
            backdropFilter: "blur(12px) saturate(160%)",
            WebkitBackdropFilter: "blur(12px) saturate(160%)",
          }}
          aria-hidden
          onTransitionEnd={onFallbackTransitionEnd}
        />
      ) : null}

      {fxMounted ? (
        <div
          className={`liquid-glass-plaque__fx${fxOn ? " is-on" : ""}`}
          aria-hidden
          onTransitionEnd={onFxTransitionEnd}
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
