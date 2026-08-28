/** Site-aligned image presets + surface chrome for the interactive editor. */

/** Max source file size for case gallery / before-after frames. */
export const PROJECT_CASE_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Public `/works/` + home MetricCaseCard media frame (case-*.jpg masters).
 * Keep cover crop + admin list thumbs on this ratio.
 */
export const CASE_CARD_MEDIA_ASPECT = 3000 / 2347;
export const CASE_CARD_MEDIA_ASPECT_CSS = "3000 / 2347";

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
    maxWidth: 2400,
    maxHeight: 1878,
    quality: 0.9,
    preferWebp: true,
    hint: "As on /works/ case cards (3000×2347).",
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
    hint: "Full gallery frame (up to ~2800px long edge, max 5 MB, no forced crop).",
  },
  ogSocial: {
    key: "ogSocial",
    label: "OG / social",
    surface: "free",
    surfaceLabel: "Link preview",
    aspect: 1200 / 630,
    maxWidth: 1200,
    maxHeight: 630,
    quality: 0.85,
    preferWebp: true,
    hint: "Open Graph share image (~1200×630).",
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
