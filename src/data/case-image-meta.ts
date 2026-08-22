/** Intrinsic pixel sizes for public case photos (used by Next/Image). */
export const CASE_IMAGE_META: Record<string, { width: number; height: number }> = {
  "/images/metric/case-detail/imgRectangle58.jpg": {
    width: 2096,
    height: 2800
  },
  "/images/metric/case-detail/imgRectangle59.jpg": {
    width: 2100,
    height: 2800
  },
  "/images/metric/case-detail/imgRectangle68.jpg": {
    width: 2100,
    height: 2800
  },
  "/images/metric/case-detail/imgRectangle69.jpg": {
    width: 2100,
    height: 2800
  },
  "/images/metric/case-detail/imgRectangle70.jpg": {
    width: 2100,
    height: 2800
  },
  "/images/metric/case-detail/imgRectangle71.jpg": {
    width: 2100,
    height: 2800
  },
  "/images/metric/case-detail/imgRectangle72.jpg": {
    width: 2100,
    height: 2800
  },
  "/images/metric/case-detail/imgRectangle73.jpg": {
    width: 2800,
    height: 2191
  },
  "/images/metric/case-detail/imgRectangle75.jpg": {
    width: 2800,
    height: 2191
  },
  "/images/metric/case-detail/imgRectangle77.jpg": {
    width: 2800,
    height: 2191
  },
  "/images/metric/cases/case-1.jpg": {
    width: 2800,
    height: 2191
  },
  "/images/metric/cases/case-2.jpg": {
    width: 2800,
    height: 2191
  },
  "/images/metric/cases/case-3.jpg": {
    width: 2800,
    height: 2191
  },
  "/images/metric/case-detail/vjm-store/01-phone-listing.jpg": {
    width: 1024,
    height: 963
  },
  "/images/metric/case-detail/vjm-store/02-project-intro.jpg": {
    width: 1024,
    height: 963
  },
  "/images/metric/case-detail/vjm-store/03-workshop-hero.jpg": {
    width: 1024,
    height: 520
  },
  "/images/metric/case-detail/vjm-store/04-complete-set.jpg": {
    width: 1024,
    height: 1004
  },
  "/images/metric/case-detail/vjm-store/05-bristle-recovery.jpg": {
    width: 1024,
    height: 926
  },
  "/images/metric/case-detail/vjm-store/06-multi-surface.jpg": {
    width: 1024,
    height: 1042
  },
  "/images/metric/case-detail/vjm-store/07-extended-reach.jpg": {
    width: 1024,
    height: 863
  },
  "/images/metric/case-detail/vjm-store/08-performance.jpg": {
    width: 1024,
    height: 1022
  },
  "/images/metric/case-detail/vjm-store/09-lifestyle-trust.jpg": {
    width: 1024,
    height: 1024
  },
  "/images/metric/case-detail/vjm-store/10-ebc-hero.jpg": {
    width: 1024,
    height: 520
  },
  "/images/metric/case-detail/vjm-store/11-aplus-modules.jpg": {
    width: 1024,
    height: 963
  },
  "/images/metric/case-detail/vjm-store/12-store-mockup.jpg": {
    width: 1024,
    height: 963
  }
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
