"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, getPublicMediaUrl } from "@/lib/cms/storage-shared";

export type BrowserUploadOptions = {
  folder?: string;
  filenameHint?: string;
  /** Hostinger: pass runtime env from the server layout (may be missing at build). */
  url?: string;
  publishableKey?: string;
};

function sanitizeFilename(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 80);
}

function fileExt(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1] ?? "";
}

/**
 * Upload media from the browser (admin session + storage RLS `is_admin()`).
 * Avoids routing large binaries through the Next.js Server Action → Supabase hop,
 * which often fails on VPS with opaque "fetch failed".
 */
export async function uploadMediaInBrowser(
  file: File,
  options: BrowserUploadOptions = {},
): Promise<{ path: string; publicUrl: string }> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Empty file");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("File too large (max 12 MB)");
  }

  const folder = (options.folder ?? "uploads").replace(/^\/+|\/+$/g, "");
  const original = sanitizeFilename(file.name) || "image";
  const base = options.filenameHint
    ? sanitizeFilename(options.filenameHint)
    : original.replace(/\.[^.]+$/, "");
  const ext = fileExt(file.name) || (file.type === "image/webp" ? "webp" : "jpg");
  const path = `${folder}/${Date.now()}-${base}.${ext}`;

  const supabase = createSupabaseBrowserClient({
    url: options.url,
    publishableKey: options.publishableKey,
  });

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(formatUploadError(error.message));
  }

  return { path, publicUrl: getPublicMediaUrl(path, options.url) };
}

export function formatUploadError(
  message: string,
  networkError = "Could not upload the file (network). Check your internet and try again.",
): string {
  const trimmed = message.trim() || networkError;
  if (/fetch failed/i.test(trimmed) || /Failed to fetch/i.test(trimmed)) {
    return networkError;
  }
  return trimmed;
}
