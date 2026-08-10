export const sphereFilters = [
  "All",
  "Agriculture",
  "Home",
  "Beauty",
  "Electronics",
] as const;

export const directionFilters = [
  "All",
  "Listing",
  "Premium A+",
  "Brand Store",
] as const;

export type SphereFilter = (typeof sphereFilters)[number];
export type DirectionFilter = (typeof directionFilters)[number];
