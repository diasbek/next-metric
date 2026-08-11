"use client";

export type MediaUploadOptions = {
  folder?: string;
  filenameHint?: string;
};

/**
 * Upload media via Next.js `/api/admin/media` (same-origin).
 * Session cookies authenticate; Supabase is only contacted from the server.
 */
export async function uploadMediaViaApi(
  file: File,
  options: MediaUploadOptions = {},
): Promise<{ path: string; publicUrl: string }> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Empty file");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("File too large (max 12 MB)");
  }

  const body = new FormData();
  body.set("file", file);
  if (options.folder) body.set("folder", options.folder);
  if (options.filenameHint) body.set("filenameHint", options.filenameHint);

  let res: Response;
  try {
    res = await fetch("/api/admin/media", {
      method: "POST",
      body,
      credentials: "same-origin",
    });
  } catch {
    throw new Error(
      formatUploadError("", "Could not upload the file (network). Check your internet and try again."),
    );
  }

  const payload = (await res.json().catch(() => null)) as
    | { path?: string; publicUrl?: string; error?: string }
    | null;

  if (!res.ok || !payload?.path || !payload?.publicUrl) {
    throw new Error(
      formatUploadError(
        payload?.error ?? `Upload failed (${res.status})`,
        "Could not upload the file (network). Check your internet and try again.",
      ),
    );
  }

  return { path: payload.path, publicUrl: payload.publicUrl };
}

/** @deprecated Use uploadMediaViaApi — kept for import path compatibility during migration. */
export const uploadMediaInBrowser = uploadMediaViaApi;

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
