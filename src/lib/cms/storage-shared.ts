/**
 * Shared media bucket constants — safe for client and server.
 * Keep upload logic (sharp) in `storage.ts` (server-only).
 */

export const MEDIA_BUCKET = "metric-media";

/** Default max source file size for general media uploads (library, cover, avatars). */
export const MEDIA_MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
/** Case gallery / before-after / hero source file cap (per frame). */
export const CASE_MEDIA_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Build a public object URL. Prefer passing the project URL at runtime. */
export function getPublicMediaUrl(path: string, projectUrl?: string): string {
  const clean = path.replace(/^\/+/, "");
  const base =
    (projectUrl || "").replace(/\/$/, "") ||
    (typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(
          /\/$/,
          "",
        )
      : "");
  if (!base) {
    throw new Error("Supabase URL is not configured");
  }
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${clean}`;
}
