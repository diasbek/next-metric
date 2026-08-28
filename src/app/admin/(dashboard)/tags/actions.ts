"use server";

import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";
import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { T } from "@/lib/cms/tables";
import { slugifyTagLabel } from "@/lib/cms/tags";
import type { TagKind } from "@/lib/cms/types";

function parseKind(raw: string): TagKind | null {
  return raw === "category" || raw === "type" ? raw : null;
}

export async function createTagAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const kind = parseKind(String(formData.get("kind") ?? ""));
  if (!kind) return adminFail("Unknown tag kind");

  const enLabel = String(formData.get("en_label") ?? "").trim() || "New tag";
  const deLabel = String(formData.get("de_label") ?? "").trim() || enLabel;
  const baseSlug =
    slugifyTagLabel(String(formData.get("slug") ?? "")) ||
    slugifyTagLabel(enLabel);
  if (!baseSlug) return adminFail("Slug is required");

  const { data: maxRow } = await supabase
    .from(T.tags)
    .select("sort_order")
    .eq("kind", kind)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let slug = baseSlug;
  const { data: existing } = await supabase
    .from(T.tags)
    .select("id")
    .eq("kind", kind)
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    slug = `${baseSlug} ${Date.now().toString(36)}`;
  }

  const { data, error } = await supabase
    .from(T.tags)
    .insert({
      kind,
      slug,
      sort_order: (maxRow?.sort_order ?? -1) + 10,
      is_active: true,
    })
    .select("id")
    .single();
  if (error || !data) return adminFail(error?.message ?? "Create failed");

  await supabase.from(T.tagTranslations).insert([
    { tag_id: data.id, locale: "en", label: enLabel },
    { tag_id: data.id, locale: "de", label: deLabel },
  ]);

  revalidateCms(["cms", "tags", "projects"]);
  return adminRedirect(`/admin/tags/?edit=${data.id}`);
}

export async function saveTagAction(formData: FormData) {
  const actor = await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return adminFail("Missing tag id");

  const kind = parseKind(String(formData.get("kind") ?? ""));
  if (!kind) return adminFail("Unknown tag kind");

  const enLabel = String(formData.get("en_label") ?? "").trim();
  const deLabel = String(formData.get("de_label") ?? "").trim() || enLabel;
  const slug =
    slugifyTagLabel(String(formData.get("slug") ?? "")) ||
    slugifyTagLabel(enLabel);
  if (!slug || !enLabel) return adminFail("Slug and English label are required");

  const isActive = formData.get("is_active") !== "off";
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  const { error } = await supabase
    .from(T.tags)
    .update({
      kind,
      slug,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return adminFail(error.message);

  for (const [locale, label] of [
    ["en", enLabel],
    ["de", deLabel],
  ] as const) {
    const { error: trError } = await supabase.from(T.tagTranslations).upsert({
      tag_id: id,
      locale,
      label,
    });
    if (trError) return adminFail(`${locale}: ${trError.message}`);
  }

  await writeAuditLog({
    actor,
    action: "content.update",
    entityType: "tag",
    entityId: id,
    meta: { kind, slug },
  });

  revalidateCms(["cms", "tags", "projects"]);
  return adminRedirect(`/admin/tags/?edit=${id}`);
}

export async function deactivateTagAction(formData: FormData) {
  await requirePermission("content");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return adminFail("Missing tag id");

  const { error } = await supabase
    .from(T.tags)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return adminFail(error.message);

  revalidateCms(["cms", "tags", "projects"]);
  return adminRedirect("/admin/tags/");
}

export async function reorderTagsAction(orderedIds: string[]) {
  const { reorderCmsRows } = await import("@/lib/cms/reorder");
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const t = getAdminMessages(await getAdminUiLocale());
  return reorderCmsRows({
    table: T.tags,
    orderedIds,
    tags: ["cms", "tags", "projects"],
    successMessage: t.common.orderSaved,
  });
}
