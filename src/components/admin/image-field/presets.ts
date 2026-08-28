/** Site-aligned image presets + surface chrome for the interactive editor. */

import {
  CASE_MEDIA_MAX_UPLOAD_BYTES,
  MEDIA_MAX_UPLOAD_BYTES,
} from "@/lib/cms/storage-shared";

/** Max source file size for case gallery / before-after frames. */
export const PROJECT_CASE_MAX_UPLOAD_BYTES = CASE_MEDIA_MAX_UPLOAD_BYTES;
/** Default max for non-case ImageField uploads (aligned with API / storage). */
export const MEDIA_DEFAULT_MAX_UPLOAD_BYTES = MEDIA_MAX_UPLOAD_BYTES;

/**
 * Public `/works/` + home MetricCaseCard media frame.
 * Matches optimized `public/images/metric/cases/case-*.jpg` (2800×2191;
 * was 3000×2347 before optimize-metric-images). Cover crop must export
 * this exact size so new CMS covers fill the card like the old masters.
 */
export const CASE_COVER_WIDTH = 2800;
export const CASE_COVER_HEIGHT = 2191;
export const CASE_CARD_MEDIA_ASPECT = CASE_COVER_WIDTH / CASE_COVER_HEIGHT;
export const CASE_CARD_MEDIA_ASPECT_CSS = `${CASE_COVER_WIDTH} / ${CASE_COVER_HEIGHT}`;

/** Open Graph / Twitter share card (Facebook recommended). */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ASPECT = OG_IMAGE_WIDTH / OG_IMAGE_HEIGHT;
export const OG_IMAGE_ASPECT_CSS = `${OG_IMAGE_WIDTH} / ${OG_IMAGE_HEIGHT}`;

export type ImagePresetKey =
  | "projectCover"
  | "projectCase"
  | "ogSocial"
  | "team"
  | "avatar"
  | "logo"
  | "free";

export type SurfaceKind =
  | "worksHero"
  | "projectCard"
  | "caseFigure"
  | "teamMember"
  | "testimonial"
  | "logoBadge"
  | "ogShare"
  | "free";

export type ImagePreset = {
  key: ImagePresetKey;
  label: string;
  surface: SurfaceKind;
  surfaceLabel: string;
  /** Crop aspect ratio (width/height). Omit for free crop. */
  aspect?: number;
  maxWidth: number;
  maxHeight: number;
  /** 0–1 JPEG/WebP quality */
  quality: number;
  preferWebp: boolean;
  hint: string;
};

export const IMAGE_PRESETS: Record<ImagePresetKey, ImagePreset> = {
  projectCover: {
    key: "projectCover",
    label: "Project cover",
    surface: "worksHero",
    surfaceLabel: "Works / case card",
    aspect: CASE_CARD_MEDIA_ASPECT,
    maxWidth: CASE_COVER_WIDTH,
    maxHeight: CASE_COVER_HEIGHT,
    quality: 0.92,
    preferWebp: true,
    hint: "Crop to the case-card master (exact 2800×2191), same as the old static covers.",
  },
  projectCase: {
    key: "projectCase",
    label: "Case / gallery",
    surface: "caseFigure",
    surfaceLabel: "Case study figure",
    // Free aspect — case frames are often portrait / square, not 16:9.
    aspect: undefined,
    maxWidth: 2800,
    maxHeight: 2800,
    quality: 0.9,
    preferWebp: true,
    hint: "Full gallery frame as-is (up to ~2800px long edge, max 5 MB). No crop UI.",
  },
  ogSocial: {
    key: "ogSocial",
    label: "OG / social",
    surface: "ogShare",
    surfaceLabel: "Link preview",
    aspect: OG_IMAGE_ASPECT,
    maxWidth: OG_IMAGE_WIDTH,
    maxHeight: OG_IMAGE_HEIGHT,
    quality: 0.85,
    preferWebp: true,
    hint: "Open Graph share image (exact 1200×630).",
  },
  team: {
    key: "team",
    label: "Team photo",
    surface: "teamMember",
    surfaceLabel: "Agency → Team",
    aspect: 1,
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    preferWebp: true,
    hint: "Square team portrait as on Agency page.",
  },
  avatar: {
    key: "avatar",
    label: "Avatar",
    surface: "testimonial",
    surfaceLabel: "Testimonials card",
    aspect: 1,
    maxWidth: 480,
    maxHeight: 480,
    quality: 0.85,
    preferWebp: true,
    hint: "Avatar inside testimonials card.",
  },
  logo: {
    key: "logo",
    label: "Logo",
    surface: "logoBadge",
    surfaceLabel: "Testimonials logo",
    aspect: undefined,
    maxWidth: 800,
    maxHeight: 400,
    quality: 0.9,
    preferWebp: true,
    hint: "Client logo next to the quote author.",
  },
  free: {
    key: "free",
    label: "Image",
    surface: "free",
    surfaceLabel: "Media library",
    aspect: undefined,
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.82,
    preferWebp: true,
    hint: "Free crop for the media library.",
  },
};
