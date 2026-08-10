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

export async function saveTeamMemberAction(formData: FormData) {
  return runAdminAction(async () => {
    await requirePermission("content");
    const supabase = createSupabaseAdminClient();
    const id = String(formData.get("id") ?? "").trim();
    if (!id) return adminFail("Не указан id участника");

    // Ensure member still exists (draft may have been deleted in another tab)
    const { data: existing, error: existingError } = await supabase
      .from("team_members")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (existingError) return adminFail(existingError.message);
    if (!existing) {
      return adminFail(
        "Участник не найден (возможно, уже удалён). Закройте панель и создайте заново.",
      );
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
          err instanceof Error ? err.message : "Не удалось загрузить фото",
        );
      }
    }

    const status = String(formData.get("status") ?? "draft");
    if (status !== "draft" && status !== "published") {
      return adminFail("Некорректный статус");
    }

    const sortOrder = Number(formData.get("sort_order") ?? 0);
    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      return adminFail("Некорректный порядок");
    }

    const { error: updateError } = await supabase
      .from("team_members")
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
      const { error } = await supabase.from("team_member_translations").upsert({
        member_id: id,
        locale,
        name: String(formData.get(`${locale}_name`) ?? ""),
        role: String(formData.get(`${locale}_role`) ?? ""),
      });
      if (error) return adminFail(`${locale}: ${error.message}`);
    }

    if (status === "published") {
      const ruName = String(formData.get("en_name") ?? "").trim();
      const ruRole = String(formData.get("en_role") ?? "").trim();
      if (!ruName || !ruRole) {
        return adminFail("need name and role in EN");
      }
    }

    revalidateCms(["cms", "team"]);
    return adminRedirect(
      `/admin/agency/?section=team&edit=${id}`,
      "Участник команды сохранён",
    );
  });
}

export async function createTeamMemberAction() {
  return runAdminAction(async () => {
    await requirePermission("content");
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("team_members")
      .insert({ sort_order: 99, status: "draft" })
      .select("id")
      .single();
    if (error || !data) {
      return adminFail(error?.message ?? "Не удалось создать участника");
    }

    const { error: trError } = await supabase
      .from("team_member_translations")
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
      "Черновик участника создан",
    );
  });
}

export async function deleteTeamMemberAction(formData: FormData) {
  return runAdminAction(async () => {
    await requirePermission("content");
    const id = String(formData.get("id") ?? "").trim();
    if (!id) return adminFail("Не указан id");

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) return adminFail(error.message);

    revalidateCms(["cms", "team"]);
    return adminRedirect("/admin/agency/?section=team", "Участник удалён");
  });
}

export async function reorderTeamMembersAction(orderedIds: string[]) {
  const { reorderCmsRows } = await import("@/lib/cms/reorder");
  return reorderCmsRows({
    table: "team_members",
    orderedIds,
    tags: ["cms", "team"],
    successMessage: "Порядок команды сохранён",
  });
}
