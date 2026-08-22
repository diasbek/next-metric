/** Intrinsic pixel sizes for public case photos (used by Next/Image). */
export const CASE_IMAGE_META: Record<string, { width: number; height: number }> = {
  "/images/metric/case-detail/imgRectangle58.jpg": {
    "width": 2096,
    "height": 2800
  },
  "/images/metric/case-detail/imgRectangle59.jpg": {
    "width": 2100,
    "height": 2800
  },
  "/images/metric/case-detail/imgRectangle68.jpg": {
    "width": 2100,
    "height": 2800
  },
  "/images/metric/case-detail/imgRectangle69.jpg": {
    "width": 2100,
    "height": 2800
  },
  "/images/metric/case-detail/imgRectangle70.jpg": {
    "width": 2100,
    "height": 2800
  },
  "/images/metric/case-detail/imgRectangle71.jpg": {
    "width": 2100,
    "height": 2800
  },
  "/images/metric/case-detail/imgRectangle72.jpg": {
    "width": 2100,
    "height": 2800
  },
  "/images/metric/case-detail/imgRectangle73.jpg": {
    "width": 2800,
    "height": 2191
  },
  "/images/metric/case-detail/imgRectangle75.jpg": {
    "width": 2800,
    "height": 2191
  },
  "/images/metric/case-detail/imgRectangle77.jpg": {
    "width": 2800,
    "height": 2191
  },
  "/images/metric/cases/case-1.jpg": {
    "width": 2800,
    "height": 2191
  },
  "/images/metric/cases/case-2.jpg": {
    "width": 2800,
    "height": 2191
  },
  "/images/metric/cases/case-3.jpg": {
    "width": 2800,
    "height": 2191
  },
  "/images/metric/case-detail/vjm-store/1.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/2.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/3.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/4.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/5.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/6.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/7.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/8.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/9.jpg": { width: 1024, height: 963 },
  "/images/metric/case-detail/vjm-store/10.jpg": { width: 1024, height: 963 },
} as const;

export function getCaseImageMeta(src: string) {
  return CASE_IMAGE_META[src] ?? { width: 1920, height: 1502 };
}

/** Rendered width for full-bleed galleries inside `.page-container`. */
export const CASE_GALLERY_SIZES =
  "(max-width: 1512px) 100vw, (max-width: 3840px) 90vw, 3840px";

/** Smaller srcset for the progressive preview pass. */
export const CASE_GALLERY_PREVIEW_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1512px) 50vw, 960px";
