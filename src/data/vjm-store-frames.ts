/** Native pixel width of VJM-STORE source frames — caps the case gallery shell. */
export const VJM_STORE_NATIVE_WIDTH = 1024;

/** Ordered VJM-STORE case gallery (source sheets 1–10). */
export const VJM_STORE_FRAME_PATHS = Array.from(
  { length: 10 },
  (_, i) => `/images/metric/case-detail/vjm-store/${i + 1}.jpg`,
) as readonly string[];

export const VJM_STORE_FRAMES = [
  {
    src: VJM_STORE_FRAME_PATHS[0],
    alt: "VJM-STORE Amazon listing on iPhone displayed on a drill brush attachment",
  },
  {
    src: VJM_STORE_FRAME_PATHS[1],
    alt: "VJM-STORE case study — project overview and conversion metrics",
  },
  {
    src: VJM_STORE_FRAME_PATHS[2],
    alt: "VJM-STORE hero product visual — drill brush set in a workshop",
  },
  {
    src: VJM_STORE_FRAME_PATHS[3],
    alt: "VJM-STORE complete set overview and hero product visual",
  },
  {
    src: VJM_STORE_FRAME_PATHS[4],
    alt: "VJM-STORE bristle recovery and multi-surface cleaning visuals",
  },
  {
    src: VJM_STORE_FRAME_PATHS[5],
    alt: "VJM-STORE extended cleaning reach and performance benefits",
  },
  {
    src: VJM_STORE_FRAME_PATHS[6],
    alt: "VJM-STORE lifestyle and brand trust Amazon listing visual",
  },
  {
    src: VJM_STORE_FRAME_PATHS[7],
    alt: "VJM-STORE EBC and A+ Content design in use",
  },
  {
    src: VJM_STORE_FRAME_PATHS[8],
    alt: "VJM-STORE A+ Content mobile modules on brand background",
  },
  {
    src: VJM_STORE_FRAME_PATHS[9],
    alt: "VJM-STORE landing page mockup on laptop",
  },
] as const;
