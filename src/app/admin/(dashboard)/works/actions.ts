"use server";

import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  deleteMediaByPublicUrl,
  isFileUpload,
  uploadMediaFile,
} from "@/lib/cms/storage";
import { adminFail, adminOk, adminRedirect } from "@/lib/cms/admin-redirect";

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
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id"));

  const status = String(formData.get("status") ?? "draft");
  const fromLibrary = String(formData.get("cover_from_library") ?? "").trim();
  let coverImage = fromLibrary || String(formData.get("cover_image") ?? "");

  const coverFile = formData.get("cover_file");
  if (isFileUpload(coverFile)) {
    const uploaded = await uploadMediaFile(coverFile, {
      folder: `projects/${id}/cover`,
      filenameHint: "cover",
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
    });
    ogImage = uploaded.publicUrl;
  }

  const { error } = await supabase
    .from("metric_projects")
    .update({
      slug: String(formData.get("slug") ?? ""),
      status,
      sphere: String(formData.get("sphere") ?? ""),
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
    await supabase.from("metric_project_translations").upsert({
      project_id: id,
      locale,
      title: String(formData.get(`${locale}_title`) ?? ""),
      description: String(formData.get(`${locale}_description`) ?? ""),
      tags: String(formData.get(`${locale}_tags`) ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
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
  }

  revalidateCms(["cms", "projects"]);
  return adminRedirect(`/admin/works/${id}/`);
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
  return adminRedirect(`/admin/works/${projectId}/`);
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
  return adminRedirect(`/admin/works/${projectId}/`);
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
  return adminRedirect(`/admin/works/${projectId}/`);
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

  if (isFileUpload(file)) {
    const uploaded = await uploadMediaFile(file, {
      folder: `projects/${projectId}/${kind}`,
      filenameHint: kind,
    });
    url = uploaded.publicUrl;
  }

  if (!url) {
    return adminRedirect(`/admin/works/${projectId}/?error=media`);
  }

  const alt = String(formData.get("alt") ?? "");
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const isComparePair = kind === "before" || kind === "after";

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
        .update({ url, alt, sort_order: sortOrder, block_id: blockId })
        .eq("id", existing.id);
    } else {
      await supabase.from("metric_project_media").insert({
        project_id: projectId,
        block_id: blockId,
        kind,
        url,
        sort_order: sortOrder,
        alt,
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
        .update({ url, alt, sort_order: sortOrder })
        .eq("id", existing.id);
    } else {
      await supabase.from("metric_project_media").insert({
        project_id: projectId,
        block_id: null,
        kind,
        url,
        sort_order: sortOrder,
        alt,
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
    });
  }

  if (kind === "cover") {
    await supabase.from("metric_projects").update({ cover_image: url }).eq("id", projectId);
  }

  revalidateCms(["cms", "projects"]);
  return adminRedirect(`/admin/works/${projectId}/`);
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
  return adminRedirect(`/admin/works/${projectId}/`);
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
