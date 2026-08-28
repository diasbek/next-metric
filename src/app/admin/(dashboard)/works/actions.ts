"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  CASE_MEDIA_MAX_EDGE_PX,
  CASE_MEDIA_MAX_UPLOAD_BYTES,
  CASE_MEDIA_WEBP_QUALITY,
  deleteMediaByPublicUrl,
  getStoragePathFromPublicUrl,
  isFileUpload,
  probeImageDimensions,
  uploadMediaFile,
  uploadMediaFromUrl,
  uploadOgPngBuffer,
} from "@/lib/cms/storage";
import { adminFail, adminOk, adminRedirect } from "@/lib/cms/admin-redirect";
import { replaceProjectTags } from "@/lib/cms/tags";
import {
  CASE_COVER_HEIGHT,
  CASE_COVER_WIDTH,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "@/components/admin/image-field/presets";
import { SITE_CONFIG } from "@/utils/consts";
import { buildCaseOgProps } from "@/utils/og/build";
import { OG_GENERATED_FILENAME } from "@/utils/og/paths";
import { ogPngBufferToDataUrl, renderOgPngBuffer } from "@/utils/og/render";

function projectEditPath(projectId: string, formData?: FormData, extraQs?: Record<string, string>) {
  const locale = String(formData?.get("return_locale") ?? "").trim();
  const focus = String(formData?.get("return_focus") ?? "").trim();
  const params = new URLSearchParams();
  if (locale === "en" || locale === "de") params.set("locale", locale);
  if (extraQs) {
    for (const [k, v] of Object.entries(extraQs)) params.set(k, v);
  }
  const qs = params.toString();
  const hash = focus ? `#${focus}` : "";
  return `/admin/works/${projectId}/${qs ? `?${qs}` : ""}${hash}`;
}

export async function createProjectAction() {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const slug = `project-${Date.now()}`;
  const { data, error } = await supabase
    .from("metric_projects")
    .insert({
      slug,
      status: "draft",
      cover_image: "",
      sphere: "",
      seo_indexable: true,
      og_image: "",
    })
    .select("id")
    .single();

  if (error || !data) return adminFail(error?.message ?? "Create failed");

  await supabase.from("metric_project_translations").insert(
    (["en", "de"] as const).map((locale) => ({
      project_id: data.id,
      locale,
      title: "",
      description: "",
      tags: [],
      author: "",
      role: "",
      quote: "",
    })),
  );

  // Start with one gallery block so editors can upload frames immediately.
  await supabase.from("metric_project_blocks").insert({
    project_id: data.id,
    type: "gallery",
    sort_order: 0,
  });

  revalidateCms(["cms", "projects"]);
  return adminRedirect(`/admin/works/${data.id}/`);
}

export async function saveProjectAction(formData: FormData) {
  const actor = await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id"));

  const status = String(formData.get("status") ?? "draft");
  const slug = String(formData.get("slug") ?? "").trim();
  const enTitle = String(formData.get("en_title") ?? "").trim();

  if (status === "published") {
    if (!slug) return adminFail("Slug is required to publish");
    if (!enTitle) return adminFail("English title is required to publish");
  }

  const fromLibrary = String(formData.get("cover_from_library") ?? "").trim();
  let coverImage = String(formData.get("cover_image") ?? "").trim();

  const coverFile = formData.get("cover_file");
  if (isFileUpload(coverFile)) {
    // Exact master size — same frame as public/images/metric/cases/case-*.jpg.
    const uploaded = await uploadMediaFile(coverFile, {
      folder: `projects/${id}/cover`,
      filenameHint: "cover",
      exactSize: { width: CASE_COVER_WIDTH, height: CASE_COVER_HEIGHT },
      quality: CASE_MEDIA_WEBP_QUALITY,
    });
    coverImage = uploaded.publicUrl;
  } else if (fromLibrary) {
    // Library assets are arbitrary aspect — normalize into the case-card frame.
    const uploaded = await uploadMediaFromUrl(fromLibrary, {
      folder: `projects/${id}/cover`,
      filenameHint: "cover",
      exactSize: { width: CASE_COVER_WIDTH, height: CASE_COVER_HEIGHT },
      quality: CASE_MEDIA_WEBP_QUALITY,
    });
    coverImage = uploaded.publicUrl;
  }

  let ogImage = String(formData.get("og_image") ?? "").trim();
  const ogFromLibrary = String(formData.get("og_from_library") ?? "").trim();
  if (ogFromLibrary) ogImage = ogFromLibrary;
  const ogFile = formData.get("og_file");
  if (isFileUpload(ogFile)) {
    const uploaded = await uploadMediaFile(ogFile, {
      folder: `projects/${id}/og`,
      filenameHint: "og",
      exactSize: { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT },
      quality: 85,
    });
    ogImage = uploaded.publicUrl;
  }

  const categoryTagId = String(formData.get("category_tag_id") ?? "").trim();
  const typeTagIds = formData
    .getAll("type_tag_ids")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const tagSync = await replaceProjectTags(id, [
    ...(categoryTagId ? [categoryTagId] : []),
    ...typeTagIds,
  ]);
  if ("error" in tagSync) return adminFail(tagSync.error);

  const { error } = await supabase
    .from("metric_projects")
    .update({
      slug,
      status,
      sphere: tagSync.sphere,
      featured: formData.get("featured") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0),
      cover_image: coverImage,
      og_image: ogImage,
      seo_indexable: formData.get("seo_indexable") !== "off",
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return adminFail(error.message);

  for (const locale of ["en", "de"] as const) {
    const { error: trError } = await supabase.from("metric_project_translations").upsert({
      project_id: id,
      locale,
      title: String(formData.get(`${locale}_title`) ?? ""),
      description: String(formData.get(`${locale}_description`) ?? ""),
      tags: tagSync.tags,
      case_year: String(formData.get(`${locale}_case_year`) ?? "") || null,
      case_task: String(formData.get(`${locale}_case_task`) ?? "") || null,
      case_solution: String(formData.get(`${locale}_case_solution`) ?? "") || null,
      author: String(formData.get(`${locale}_author`) ?? ""),
      role: String(formData.get(`${locale}_role`) ?? ""),
      quote: String(formData.get(`${locale}_quote`) ?? ""),
      meta_title: String(formData.get(`${locale}_meta_title`) ?? ""),
      meta_description: String(formData.get(`${locale}_meta_description`) ?? ""),
      keywords: String(formData.get(`${locale}_keywords`) ?? ""),
    });
    if (trError) return adminFail(`${locale}: ${trError.message}`);
  }

  await writeAuditLog({
    actor,
    action: "content.update",
    entityType: "project",
    entityId: id,
    meta: { status, slug },
  });

  revalidateCms(["cms", "projects", "tags"]);
  return adminRedirect(projectEditPath(id, formData));
}

export type OgActionOk = { ok: true; dataUrl?: string; ogImageUrl?: string; message?: string };
export type OgActionFail = { ok: false; error: string };
export type OgActionResult = OgActionOk | OgActionFail;

export async function previewProjectOgAction(input: {
  title: string;
  description: string;
  coverUrl: string;
  locale: "en" | "de";
}): Promise<OgActionResult> {
  await requirePermission("content");
  try {
    const props = await buildCaseOgProps({
      title: input.title,
      description: input.description,
      coverUrl: input.coverUrl || null,
      locale: input.locale,
      siteUrl: SITE_CONFIG.url,
    });
    const buffer = await renderOgPngBuffer(props);
    return { ok: true, dataUrl: ogPngBufferToDataUrl(buffer) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "OG preview failed",
    };
  }
}

export async function generateProjectOgAction(input: {
  projectId: string;
  title: string;
  description: string;
  coverUrl: string;
  locale: "en" | "de";
}): Promise<OgActionResult> {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(input.projectId ?? "").trim();
  if (!id) return { ok: false, error: "Missing project id" };

  try {
    const props = await buildCaseOgProps({
      title: input.title,
      description: input.description,
      coverUrl: input.coverUrl || null,
      locale: input.locale,
      siteUrl: SITE_CONFIG.url,
    });
    const buffer = await renderOgPngBuffer(props);
    const uploaded = await uploadOgPngBuffer(buffer, {
      folder: `projects/${id}/og`,
      filename: OG_GENERATED_FILENAME,
    });

    const { error } = await supabase
      .from("metric_projects")
      .update({ og_image: uploaded.publicUrl })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidateCms(["cms", "projects"]);
    return { ok: true, ogImageUrl: uploaded.publicUrl, message: "OG image generated" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "OG generate failed",
    };
  }
}

export async function clearProjectOgAction(input: {
  projectId: string;
}): Promise<OgActionResult> {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(input.projectId ?? "").trim();
  if (!id) return { ok: false, error: "Missing project id" };

  const { error } = await supabase
    .from("metric_projects")
    .update({ og_image: "" })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidateCms(["cms", "projects"]);
  return { ok: true, ogImageUrl: "", message: "Using auto OG" };
}

export async function deleteProjectAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id"));

  const { data: project } = await supabase
    .from("metric_projects")
    .select("cover_image, og_image, project_media(url)")
    .eq("id", id)
    .maybeSingle();

  if (project?.cover_image) {
    await deleteMediaByPublicUrl(project.cover_image);
  }
  if (project?.og_image) {
    await deleteMediaByPublicUrl(project.og_image);
  }
  const mediaRows = (project?.project_media ?? []) as Array<{ url: string }>;
  for (const media of mediaRows) {
    if (media.url) await deleteMediaByPublicUrl(media.url);
  }

  await supabase.from("metric_projects").delete().eq("id", id);
  revalidateCms(["cms", "projects"]);
  return adminRedirect("/admin/works/");
}

export async function addProjectBlockAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const projectId = String(formData.get("project_id"));
  const type = String(formData.get("type") ?? "gallery");
  if (!["gallery", "before_after", "youtube"].includes(type)) {
    return adminFail("Unknown block type");
  }

  const { data: existing } = await supabase
    .from("metric_project_blocks")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (existing?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("metric_project_blocks").insert({
    project_id: projectId,
    type,
    sort_order: sortOrder,
    youtube_url: type === "youtube" ? "" : null,
  });
  if (error) return adminFail(error.message);

  revalidateCms(["cms", "projects"]);
  return adminRedirect(projectEditPath(projectId, formData));
}

export async function deleteProjectBlockAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const projectId = String(formData.get("project_id"));
  const blockId = String(formData.get("block_id"));

  const { data: mediaRows } = await supabase
    .from("metric_project_media")
    .select("url")
    .eq("block_id", blockId);
  for (const row of mediaRows ?? []) {
    if (row.url) await deleteMediaByPublicUrl(row.url);
  }

  await supabase.from("metric_project_blocks").delete().eq("id", blockId);
  revalidateCms(["cms", "projects"]);
  return adminRedirect(projectEditPath(projectId, formData));
}

export async function reorderProjectBlocksAction(orderedIds: string[]) {
  await requirePermission("content");
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const t = getAdminMessages(await getAdminUiLocale());
  const supabase = createSupabaseAdminClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("metric_project_blocks").update({ sort_order: index }).eq("id", id),
    ),
  );
  revalidateCms(["cms", "projects"]);
  return adminOk(t.common.orderSaved);
}

export async function reorderProjectMediaAction(orderedIds: string[]) {
  await requirePermission("content");
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const t = getAdminMessages(await getAdminUiLocale());
  const supabase = createSupabaseAdminClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("metric_project_media").update({ sort_order: index }).eq("id", id),
    ),
  );
  revalidateCms(["cms", "projects"]);
  return adminOk(t.common.orderSaved);
}

export async function updateProjectBlockYoutubeAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const projectId = String(formData.get("project_id"));
  const blockId = String(formData.get("block_id"));
  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();

  const { error } = await supabase
    .from("metric_project_blocks")
    .update({ youtube_url: youtubeUrl })
    .eq("id", blockId);
  if (error) return adminFail(error.message);

  revalidateCms(["cms", "projects"]);
  return adminRedirect(projectEditPath(projectId, formData));
}

export async function addProjectMediaAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const projectId = String(formData.get("project_id"));
  const blockId = String(formData.get("block_id") ?? "").trim() || null;
  const kind = String(formData.get("kind") ?? "gallery");
  const file = formData.get("file");
  let url =
    String(formData.get("library_url") ?? "").trim() ||
    String(formData.get("url") ?? "").trim();

  const isCaseQuality =
    kind === "gallery" ||
    kind === "before" ||
    kind === "after" ||
    kind === "hero";

  let width: number | null = null;
  let height: number | null = null;

  if (isFileUpload(file)) {
    const uploaded = await uploadMediaFile(file, {
      folder: `projects/${projectId}/${kind}`,
      filenameHint: kind,
      ...(isCaseQuality
        ? {
            maxEdge: CASE_MEDIA_MAX_EDGE_PX,
            quality: CASE_MEDIA_WEBP_QUALITY,
            maxUploadBytes: CASE_MEDIA_MAX_UPLOAD_BYTES,
          }
        : {}),
    });
    url = uploaded.publicUrl;
    width = uploaded.width;
    height = uploaded.height;
  }

  if (!url) {
    const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
    const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
    const t = getAdminMessages(await getAdminUiLocale());
    return adminFail(t.flash.errorMedia);
  }

  if (width == null || height == null) {
    const probed = await probeImageDimensions(url);
    width = probed.width;
    height = probed.height;
  }

  const alt = String(formData.get("alt") ?? "");
  let sortOrder = Number(formData.get("sort_order") ?? NaN);
  if (kind === "gallery" || !Number.isFinite(sortOrder)) {
    let maxQuery = supabase
      .from("metric_project_media")
      .select("sort_order")
      .eq("project_id", projectId)
      .eq("kind", kind)
      .order("sort_order", { ascending: false })
      .limit(1);
    maxQuery = blockId
      ? maxQuery.eq("block_id", blockId)
      : maxQuery.is("block_id", null);
    const { data: maxRow } = await maxQuery.maybeSingle();
    sortOrder = (maxRow?.sort_order ?? -1) + 1;
  }

  const isComparePair = kind === "before" || kind === "after";
  const dimensions =
    width != null && height != null ? { width, height } : {};

  if (isComparePair) {
    let query = supabase
      .from("metric_project_media")
      .select("id, url")
      .eq("project_id", projectId)
      .eq("kind", kind);
    query = blockId ? query.eq("block_id", blockId) : query.is("block_id", null);
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      if (existing.url && existing.url !== url) {
        await deleteMediaByPublicUrl(existing.url);
      }
      await supabase
        .from("metric_project_media")
        .update({
          url,
          alt,
          sort_order: sortOrder,
          block_id: blockId,
          ...dimensions,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("metric_project_media").insert({
        project_id: projectId,
        block_id: blockId,
        kind,
        url,
        sort_order: sortOrder,
        alt,
        ...dimensions,
      });
    }
  } else if (kind === "hero") {
    const { data: existing } = await supabase
      .from("metric_project_media")
      .select("id, url")
      .eq("project_id", projectId)
      .eq("kind", "hero")
      .maybeSingle();

    if (existing) {
      if (existing.url && existing.url !== url) {
        await deleteMediaByPublicUrl(existing.url);
      }
      await supabase
        .from("metric_project_media")
        .update({ url, alt, sort_order: sortOrder, ...dimensions })
        .eq("id", existing.id);
    } else {
      await supabase.from("metric_project_media").insert({
        project_id: projectId,
        block_id: null,
        kind,
        url,
        sort_order: sortOrder,
        alt,
        ...dimensions,
      });
    }
  } else {
    await supabase.from("metric_project_media").insert({
      project_id: projectId,
      block_id: blockId,
      kind,
      url,
      sort_order: sortOrder,
      alt,
      ...dimensions,
    });
  }

  if (kind === "cover") {
    await supabase.from("metric_projects").update({ cover_image: url }).eq("id", projectId);
  }

  revalidateCms(["cms", "projects"]);
  return adminRedirect(projectEditPath(projectId, formData));
}

/** One gallery frame (file upload or library URL). No redirect — client finishes the batch. */
export async function addProjectGalleryFrameAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const projectId = String(formData.get("project_id"));
  const blockId = String(formData.get("block_id") ?? "").trim() || null;
  const file = formData.get("file");
  const libraryUrl = String(formData.get("library_url") ?? "").trim();

  let url = "";
  let width: number | null = null;
  let height: number | null = null;

  if (isFileUpload(file)) {
    const uploaded = await uploadMediaFile(file, {
      folder: `projects/${projectId}/gallery`,
      filenameHint: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      maxEdge: CASE_MEDIA_MAX_EDGE_PX,
      quality: CASE_MEDIA_WEBP_QUALITY,
      maxUploadBytes: CASE_MEDIA_MAX_UPLOAD_BYTES,
    });
    url = uploaded.publicUrl;
    width = uploaded.width;
    height = uploaded.height;
  } else if (libraryUrl) {
    if (!getStoragePathFromPublicUrl(libraryUrl)) {
      const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
      const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
      const t = getAdminMessages(await getAdminUiLocale());
      return adminFail(t.flash.errorMedia);
    }
    url = libraryUrl;
    const probed = await probeImageDimensions(url);
    width = probed.width;
    height = probed.height;
  } else {
    const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
    const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
    const t = getAdminMessages(await getAdminUiLocale());
    return adminFail(t.flash.errorMedia);
  }

  // Skip exact duplicates already in this gallery block.
  let dupQuery = supabase
    .from("metric_project_media")
    .select("id")
    .eq("project_id", projectId)
    .eq("kind", "gallery")
    .eq("url", url)
    .limit(1);
  dupQuery = blockId
    ? dupQuery.eq("block_id", blockId)
    : dupQuery.is("block_id", null);
  const { data: existing } = await dupQuery.maybeSingle();
  if (existing) return adminOk("skipped");

  let maxQuery = supabase
    .from("metric_project_media")
    .select("sort_order")
    .eq("project_id", projectId)
    .eq("kind", "gallery")
    .order("sort_order", { ascending: false })
    .limit(1);
  maxQuery = blockId
    ? maxQuery.eq("block_id", blockId)
    : maxQuery.is("block_id", null);
  const { data: maxRow } = await maxQuery.maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const dimensions =
    width != null && height != null ? { width, height } : {};

  const { error } = await supabase.from("metric_project_media").insert({
    project_id: projectId,
    block_id: blockId,
    kind: "gallery",
    url,
    sort_order: sortOrder,
    alt: "",
    ...dimensions,
  });
  if (error) return adminFail(error.message);
  return adminOk();
}

export async function finishProjectGalleryBatchAction(formData: FormData) {
  await requirePermission("content");
  const projectId = String(formData.get("project_id"));
  const count = Number(formData.get("added_count") ?? 0);
  revalidateCms(["cms", "projects"]);
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const { formatAdminMessage } = await import("@/i18n/admin/format");
  const t = getAdminMessages(await getAdminUiLocale());
  const message =
    Number.isFinite(count) && count > 0
      ? formatAdminMessage(t.pages.project.galleryAdded, { count })
      : t.common.saved;
  return adminRedirect(projectEditPath(projectId, formData), message);
}

export async function deleteProjectMediaAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const projectId = String(formData.get("project_id"));
  const mediaId = String(formData.get("media_id"));

  const { data: media } = await supabase
    .from("metric_project_media")
    .select("url")
    .eq("id", mediaId)
    .maybeSingle();

  if (media?.url) {
    await deleteMediaByPublicUrl(media.url);
  }

  await supabase.from("metric_project_media").delete().eq("id", mediaId);
  revalidateCms(["cms", "projects"]);
  return adminRedirect(projectEditPath(projectId, formData));
}

export async function reorderProjectsAction(orderedIds: string[]) {
  const { reorderCmsRows } = await import("@/lib/cms/reorder");
  const { T } = await import("@/lib/cms/tables");
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const t = getAdminMessages(await getAdminUiLocale());
  return reorderCmsRows({
    table: T.projects,
    orderedIds,
    tags: ["cms", "projects"],
    successMessage: t.common.orderSaved,
  });
}
