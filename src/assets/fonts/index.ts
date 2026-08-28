import localFont from "next/font/local";

/** Body / UI — Degular Text. */
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
  // Only Regular is needed before first paint; other weights swap in.
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
  // Metric-matched fallback + faux-bold of Regular were colliding
  // with Display’s tight sidebearings on large headlines.
  adjustFontFallback: false,
  // Avoid preloading 4 Display files on every route (mobile LCP).
  preload: false,
});
