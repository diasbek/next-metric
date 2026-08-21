import type { CSSProperties, ReactNode } from "react";

type LiquidGlassPlaqueProps = {
  children?: ReactNode;
  className?: string;
  /** Optional fill override (gradient or color). Applied as --liquid-glass-bg. */
  background?: string;
  style?: CSSProperties;
};

type LiquidGlassStyle = CSSProperties & {
  ["--liquid-glass-bg"]?: string;
};

/**
 * Frosted glass plaque — pure CSS (`src/styles/liquid-glass.css`).
 * SSR-safe, no client mount, no library fallbacks.
 */
export function LiquidGlassPlaque({
  children,
  className,
  background,
  style,
}: LiquidGlassPlaqueProps) {
  const mergedStyle: LiquidGlassStyle | undefined =
    background || style
      ? {
          ...style,
          ...(background ? { ["--liquid-glass-bg"]: background } : null),
        }
      : style;

  return (
    <div
      className={["liquid-glass-plaque", className].filter(Boolean).join(" ")}
      style={mergedStyle}
    >
      {children != null ? (
        <div className="liquid-glass-plaque__content">{children}</div>
      ) : null}
    </div>
  );
}
