export const PROJECT_BRIEF_SERVICE_IDS = [
  "listingImages",
  "standardAplus",
  "premiumAplus",
  "brandStore",
  "viz3d",
  "redesign",
  "completeBrand",
  "ongoingSupport",
  "other",
] as const;

export type ProjectBriefServiceId = (typeof PROJECT_BRIEF_SERVICE_IDS)[number];

export const PROJECT_BRIEF_PHONE_PLACEHOLDER = "email";

/** Canonical labels stored on the lead (admin / Telegram). */
export const PROJECT_BRIEF_SERVICE_LABELS: Record<
  ProjectBriefServiceId,
  string
> = {
  listingImages: "Amazon Listing Images",
  standardAplus: "Standard A+ Content",
  premiumAplus: "Premium A+ Content",
  brandStore: "Amazon Brand Store",
  viz3d: "3D Product Visualization",
  redesign: "Existing Listing Redesign",
  completeBrand: "Complete Amazon Brand Design",
  ongoingSupport: "Ongoing Design Support",
  other: "Other",
};
