"use server";

import {
  adminFail,
  adminRedirect,
  runAdminAction,
} from "@/lib/cms/admin-redirect";
import { revalidateCms } from "@/lib/cms/revalidate";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isFileUpload, uploadMediaFile } from "@/lib/cms/storage";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

export async function saveTeamMemberAction(formData: FormData) {
  return runAdminAction(async () => {
    await requirePermission("content");
    const t = getAdminMessages(await getAdminUiLocale());
    const supabase = createSupabaseAdminClient();
    const id = String(formData.get("id") ?? "").trim();
    if (!id) return adminFail(t.common.actionFailed);

    const { data: existing, error: existingError } = await supabase
      .from("metric_team_members")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (existingError) return adminFail(existingError.message);
    if (!existing) {
      return adminFail(t.pages.team.missing);
    }

    let image = String(formData.get("image") ?? "");
    const imageFile = formData.get("image_file");
    if (isFileUpload(imageFile)) {
      try {
        const uploaded = await uploadMediaFile(imageFile, {
          folder: `team/${id}`,
          filenameHint: "photo",
          maxEdge: 1200,
        });
        image = uploaded.publicUrl;
      } catch (err) {
        return adminFail(
          err instanceof Error ? err.message : t.common.uploadNetworkError,
        );
      }
    }

    const status = String(formData.get("status") ?? "draft");
    if (status !== "draft" && status !== "published") {
      return adminFail(t.common.actionFailed);
    }

    const sortOrder = Number(formData.get("sort_order") ?? 0);
    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      return adminFail(t.common.actionFailed);
    }

    const { error: updateError } = await supabase
      .from("metric_team_members")
      .update({
        sort_order: sortOrder,
        image,
        image_object_position:
          String(formData.get("image_object_position") ?? "") || null,
        is_director: formData.get("is_director") === "on",
        status,
      })
      .eq("id", id);
    if (updateError) return adminFail(updateError.message);

    for (const locale of ["en", "de"] as const) {
      const { error } = await supabase.from("metric_team_member_translations").upsert({
        member_id: id,
        locale,
        name: String(formData.get(`${locale}_name`) ?? ""),
        role: String(formData.get(`${locale}_role`) ?? ""),
      });
      if (error) return adminFail(`${locale}: ${error.message}`);
    }

    if (status === "published") {
      const enName = String(formData.get("en_name") ?? "").trim();
      const enRole = String(formData.get("en_role") ?? "").trim();
      if (!enName || !enRole) {
        return adminFail(t.common.fillEnFirst);
      }
    }

    revalidateCms(["cms", "team"]);
    return adminRedirect(
      `/admin/agency/?section=team&edit=${id}`,
      t.common.saved,
    );
  });
}

export async function createTeamMemberAction() {
  return runAdminAction(async () => {
    await requirePermission("content");
    const t = getAdminMessages(await getAdminUiLocale());
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("metric_team_members")
      .insert({ sort_order: 99, status: "draft" })
      .select("id")
      .single();
    if (error || !data) {
      return adminFail(error?.message ?? t.common.actionFailed);
    }

    const { error: trError } = await supabase
      .from("metric_team_member_translations")
      .insert(
        (["en", "de"] as const).map((locale) => ({
          member_id: data.id,
          locale,
          name: "New member",
          role: "",
        })),
      );
    if (trError) return adminFail(trError.message);

    revalidateCms(["cms", "team"]);
    return adminRedirect(
      `/admin/agency/?section=team&edit=${data.id}`,
      t.pages.team.created,
    );
  });
}

export async function deleteTeamMemberAction(formData: FormData) {
  return runAdminAction(async () => {
    await requirePermission("content");
    const t = getAdminMessages(await getAdminUiLocale());
    const id = String(formData.get("id") ?? "").trim();
    if (!id) return adminFail(t.common.actionFailed);

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("metric_team_members").delete().eq("id", id);
    if (error) return adminFail(error.message);

    revalidateCms(["cms", "team"]);
    return adminRedirect("/admin/agency/?section=team", t.pages.team.deleted);
  });
}

export async function reorderTeamMembersAction(orderedIds: string[]) {
  const { reorderCmsRows } = await import("@/lib/cms/reorder");
  const { T } = await import("@/lib/cms/tables");
  const t = getAdminMessages(await getAdminUiLocale());
  return reorderCmsRows({
    table: T.teamMembers,
    orderedIds,
    tags: ["cms", "team"],
    successMessage: t.common.orderSaved,
  });
}
