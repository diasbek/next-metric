import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseUrl } from "@/lib/supabase/env";
import sharp from "sharp";
import {
  MEDIA_BUCKET,
  MEDIA_MAX_UPLOAD_BYTES,
  getPublicMediaUrl,
} from "@/lib/cms/storage-shared";

export {
  CASE_MEDIA_MAX_UPLOAD_BYTES,
  MEDIA_BUCKET,
  MEDIA_MAX_UPLOAD_BYTES,
  getPublicMediaUrl,
} from "@/lib/cms/storage-shared";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const MAX_UPLOAD_BYTES = MEDIA_MAX_UPLOAD_BYTES;
/** Default long-edge for general media (covers, avatars, library). */
const MAX_EDGE_PX = 1920;
/** Case gallery / hero masters — match static optimize-metric-images. */
export const CASE_MEDIA_MAX_EDGE_PX = 2800;
export const CASE_MEDIA_WEBP_QUALITY = 90;
const DEFAULT_WEBP_QUALITY = 82;

function sanitizeFilename(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 80);
}

/** Extract storage object path from a public media URL, if it belongs to our bucket. */
export function getStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0] ?? "");
}

export type UploadMediaOptions = {
  /** Folder inside the media bucket, e.g. projects/<id>/cover */
  folder?: string;
  /** Prefer a stable name prefix */
  filenameHint?: string;
  /** Long-edge limit after sharp (default 1920) */
  maxEdge?: number;
  /** WebP quality 1–100 (default 82; case galleries use 90) */
  quality?: number;
  /** Override default 20 MB source-file cap (case gallery uses 5 MB). */
  maxUploadBytes?: number;
};

export type UploadMediaResult = {
  path: string;
  publicUrl: string;
  width: number | null;
  height: number | null;
};

/** Read intrinsic pixel size from a Storage public URL (or any fetchable image). */
export async function probeImageDimensions(
  url: string,
): Promise<{ width: number | null; height: number | null }> {
  try {
    const path = getStoragePathFromPublicUrl(url);
    let buffer: Buffer;
    if (path) {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .download(path);
      if (error || !data) return { width: null, height: null };
      buffer = Buffer.from(await data.arrayBuffer());
    } else {
      const res = await fetch(url);
      if (!res.ok) return { width: null, height: null };
      buffer = Buffer.from(await res.arrayBuffer());
    }
    const meta = await sharp(buffer, { failOn: "none" }).metadata();
    return { width: meta.width ?? null, height: meta.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

/**
 * Normalize uploads for the web: strip metadata, cap dimensions, prefer WebP.
 * SVG/GIF pass through unchanged (animation / vectors).
 */
async function optimizeForWeb(
  buffer: Buffer,
  mime: string,
  maxEdge = MAX_EDGE_PX,
  quality = DEFAULT_WEBP_QUALITY,
): Promise<{
  buffer: Buffer;
  contentType: string;
  ext: string;
  width: number | null;
  height: number | null;
}> {
  if (mime === "image/svg+xml" || mime === "image/gif") {
    const ext = mime === "image/svg+xml" ? "svg" : "gif";
    return { buffer, contentType: mime, ext, width: null, height: null };
  }

  const image = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? maxEdge;
  const height = meta.height ?? maxEdge;
  const needsResize = width > maxEdge || height > maxEdge;

  let pipeline = image;
  if (needsResize) {
    pipeline = pipeline.resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const webp = await pipeline
    .webp({ quality: Math.min(100, Math.max(1, quality)), effort: 4 })
    .toBuffer();
  const outMeta = await sharp(webp).metadata();
  return {
    buffer: webp,
    contentType: "image/webp",
    ext: "webp",
    width: outMeta.width ?? (needsResize ? Math.min(width, maxEdge) : width),
    height: outMeta.height ?? (needsResize ? Math.min(height, maxEdge) : height),
  };
}

export async function uploadMediaFile(
  file: File,
  options: UploadMediaOptions = {},
): Promise<UploadMediaResult> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Empty file");
  }
  const maxBytes = options.maxUploadBytes ?? MAX_UPLOAD_BYTES;
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File too large (max ${mb} MB)`);
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(mime) && !mime.startsWith("image/")) {
    throw new Error(`Unsupported file type: ${mime}`);
  }

  const folder = (options.folder ?? "uploads").replace(/^\/+|\/+$/g, "");
  const original = sanitizeFilename(file.name) || "image";
  const base = options.filenameHint
    ? sanitizeFilename(options.filenameHint)
    : original.replace(/\.[^.]+$/, "");

  const raw = Buffer.from(await file.arrayBuffer());
  let optimized: {
    buffer: Buffer;
    contentType: string;
    ext: string;
    width: number | null;
    height: number | null;
  };
  try {
    optimized = await optimizeForWeb(
      raw,
      mime,
      options.maxEdge ?? MAX_EDGE_PX,
      options.quality ?? DEFAULT_WEBP_QUALITY,
    );
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? `Image processing failed: ${err.message}`
        : "Image processing failed",
    );
  }
  const path = `${folder}/${Date.now()}-${base}.${optimized.ext}`;

  const supabase = createSupabaseAdminClient();
  // Uint8Array avoids undici "fetch failed" quirks with Node Buffer bodies
  const body = new Uint8Array(optimized.buffer);
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: optimized.contentType,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) throw new Error(describeStorageError(error.message));

  return {
    path,
    publicUrl: getPublicMediaUrl(path),
    width: optimized.width,
    height: optimized.height,
  };
}

/**
 * Upload a pre-rendered OG PNG as-is (no WebP resize) so share cards stay 1200×630.
 * Uses a stable path + upsert; public URL gets `?v=` cache bust.
 */
export async function uploadOgPngBuffer(
  buffer: Buffer,
  options: { folder: string; filename?: string },
): Promise<UploadMediaResult> {
  if (!buffer.length) throw new Error("Empty OG buffer");

  const folder = (options.folder ?? "og").replace(/^\/+|\/+$/g, "");
  const filename = sanitizeFilename(options.filename ?? "og-generated.png") || "og-generated.png";
  const path = `${folder}/${filename}`;
  const body = new Uint8Array(buffer);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: "image/png",
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) throw new Error(describeStorageError(error.message));

  const bust = Date.now();
  return {
    path,
    publicUrl: `${getPublicMediaUrl(path)}?v=${bust}`,
    width: 1200,
    height: 630,
  };
}

function describeStorageError(message: string): string {
  const trimmed = message.trim() || "Storage upload failed";
  if (/fetch failed/i.test(trimmed)) {
    return "Could not upload to Supabase Storage (fetch failed). Usually a network issue between the server and Supabase — prefer uploading from the browser.";
  }
  return trimmed;
}

export async function deleteMediaByPublicUrl(url: string) {
  const path = getStoragePathFromPublicUrl(url);
  if (!path) return;
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(MEDIA_BUCKET).remove([path]);
}

export function isFileUpload(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

/** Private bucket — never expose a public URL for these; use createSignedUrl(). */
export const LEAD_ATTACHMENTS_BUCKET = "metric-lead-attachments";
const MAX_LEAD_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const LEAD_ATTACHMENT_SIGNED_URL_TTL_SEC = 300;

const LEAD_ATTACHMENT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/rtf",
  "text/plain",
  "text/rtf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const LEAD_ATTACHMENT_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "odt",
  "rtf",
  "txt",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
]);

function fileExt(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1] ?? "";
}

export async function uploadLeadAttachment(
  file: File,
): Promise<{ path: string }> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Empty file");
  }
  if (file.size > MAX_LEAD_ATTACHMENT_BYTES) {
    throw new Error("File too large (max 10 MB)");
  }

  const mime = file.type || "application/octet-stream";
  const ext = fileExt(file.name);
  const mimeOk = LEAD_ATTACHMENT_MIME.has(mime);
  const extOk = LEAD_ATTACHMENT_EXT.has(ext);
  if (!mimeOk && !extOk) {
    throw new Error("Unsupported file type");
  }

  const safeName = sanitizeFilename(file.name) || `file.${ext || "bin"}`;
  const path = `leads/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = mimeOk ? mime : "application/octet-stream";

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(LEAD_ATTACHMENTS_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (error) throw new Error(error.message);

  return { path };
}

/** Admin-only: mint a short-lived URL to view/download a private lead attachment. */
export async function getLeadAttachmentSignedUrl(path: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(LEAD_ATTACHMENTS_BUCKET)
    .createSignedUrl(path, LEAD_ATTACHMENT_SIGNED_URL_TTL_SEC);
  if (error || !data) {
    throw new Error(error?.message ?? "Could not sign attachment URL");
  }
  return data.signedUrl;
}

export const SITE_FILES_BUCKET = "metric-site-files";
const MAX_SITE_FILE_BYTES = 50 * 1024 * 1024;

const SITE_FILE_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/rtf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const SITE_FILE_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "odt",
  "rtf",
  "ppt",
  "pptx",
  "txt",
  "jpg",
  "jpeg",
  "png",
  "webp",
]);

/** Upload public site docs (presentation / brief) — no image pipeline. */
export async function uploadSiteDocument(
  file: File,
  options: { folder?: string; filenameHint?: string } = {},
): Promise<{ path: string; publicUrl: string }> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Empty file");
  }
  if (file.size > MAX_SITE_FILE_BYTES) {
    throw new Error("File too large (max 50 MB)");
  }

  const mime = file.type || "application/octet-stream";
  const ext = fileExt(file.name);
  if (!SITE_FILE_MIME.has(mime) && !SITE_FILE_EXT.has(ext)) {
    throw new Error("Unsupported file type");
  }

  const folder = (options.folder ?? "docs").replace(/^\/+|\/+$/g, "");
  const base = options.filenameHint
    ? sanitizeFilename(options.filenameHint)
    : sanitizeFilename(file.name).replace(/\.[^.]+$/, "") || "document";
  const finalExt = ext || "pdf";
  const path = `${folder}/${Date.now()}-${base}.${finalExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = SITE_FILE_MIME.has(mime) ? mime : "application/octet-stream";

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(SITE_FILES_BUCKET)
    .upload(path, new Uint8Array(buffer), {
      contentType,
      upsert: false,
      cacheControl: "31536000",
    });
  if (error) throw new Error(error.message);

  const publicUrl = `${getSupabaseUrl()}/storage/v1/object/public/${SITE_FILES_BUCKET}/${path}`;
  return { path, publicUrl };
}

/** Recursively list object paths in the public media bucket (early-exit aware). */
export async function listMediaFiles(
  prefixOrOptions: string | { prefix?: string; maxFiles?: number } = "",
): Promise<string[]> {
  const options =
    typeof prefixOrOptions === "string"
      ? { prefix: prefixOrOptions, maxFiles: 500 }
      : {
          prefix: prefixOrOptions.prefix ?? "",
          maxFiles: prefixOrOptions.maxFiles ?? 500,
        };

  return walkMediaFiles(options.prefix, 0, options.maxFiles);
}

async function walkMediaFiles(
  prefix: string,
  depth: number,
  maxFiles: number,
  acc: string[] = [],
): Promise<string[]> {
  if (depth > 4 || acc.length >= maxFiles) return acc;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(prefix, {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error || !data) return acc;

  const folders: string[] = [];
  for (const entry of data) {
    if (!entry.name || entry.name === ".emptyFolderPlaceholder") continue;
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    const isFile =
      Boolean(entry.metadata) ||
      /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(entry.name);

    if (isFile) {
      acc.push(path);
      if (acc.length >= maxFiles) return acc;
    } else {
      folders.push(path);
    }
  }

  for (const folder of folders) {
    if (acc.length >= maxFiles) break;
    await walkMediaFiles(folder, depth + 1, maxFiles, acc);
  }
  return acc;
}

/** Recent media for pickers — stops once enough files are collected. */
export async function listRecentMediaFiles(limit = 48): Promise<string[]> {
  return listMediaFiles({ maxFiles: limit });
}
