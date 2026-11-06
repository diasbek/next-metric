/** Category → accent colour map (concept site). */
const ACCENTS: Record<string, string> = {
  "bike accessories": "#A7D82B",
  automotive: "#E5262D",
  "automotive & garage": "#E5262D",
  garage: "#E5262D",
  beauty: "#F0461F",
  "beauty & personal care": "#F0461F",
  apparel: "#6DBB3C",
  "apparel & accessories": "#6DBB3C",
  home: "#A7D82B",
  agriculture: "#8FD10F",
  sport: "#6DBB3C",
  sports: "#6DBB3C",
};

/** Per-slug accents from the concept site (two bike cases differ). */
const SLUG_ACCENTS: Record<string, string> = {
  "impact-pro-mount-360": "#A7D82B",
  "impact-flexlock": "#8FD10F",
  "nurada-garage-protection": "#E5262D",
  "klipp-nagelknipser": "#F0461F",
  "qorux-bamboo-socks": "#6DBB3C",
};

const FALLBACK = ["#A7D82B", "#E5262D", "#F0461F", "#6DBB3C", "#8FD10F"];

export function caseAccent(
  categoryOrSphere?: string | null,
  seed = 0,
  slug?: string | null,
  explicit?: string | null,
): string {
  const fromCms = (explicit || "").trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(fromCms)) return fromCms;

  const fromSlug = slug ? SLUG_ACCENTS[slug.trim().toLowerCase()] : undefined;
  if (fromSlug) return fromSlug;

  const key = (categoryOrSphere || "").trim().toLowerCase();
  if (key && ACCENTS[key]) return ACCENTS[key];
  for (const [k, color] of Object.entries(ACCENTS)) {
    if (key.includes(k) || k.includes(key)) return color;
  }
  return FALLBACK[Math.abs(seed) % FALLBACK.length];
}
