import { Archivo } from "next/font/google";
import localFont from "next/font/local";

/** Body / UI — Degular Text (licensed files in repo). */
export const degular = localFont({
  src: [
    {
      path: "./degular/DegularTextDemo-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./degular/DegularTextDemo-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./degular/DegularTextDemo-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./degular/DegularTextDemo-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-degular",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  preload: true,
});

/** Headlines — Degular Display. */
export const degularDisplay = localFont({
  src: [
    {
      path: "./degular/DegularDisplayDemo-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./degular/DegularDisplayDemo-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./degular/DegularDisplayDemo-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./degular/DegularDisplayDemo-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-degular-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
  preload: true,
});

/**
 * Scotch Text Comp Medium Italic — from metric-site concept handoff.
 * Subset demo glyph coverage; DE umlauts may fall back to Archivo/Georgia
 * until a full licensed cut is installed.
 */
export const scotch = localFont({
  src: [
    {
      path: "./scotch-text-comp-mdit.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-scotch",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  preload: true,
});

/** UI / captions — Archivo variable (matches concept site). */
export const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
});
