"use server";

import {
  adminFail,
  adminRedirect,
  runAdminAction,
} from "@/lib/cms/admin-redirect";
import { requireAdmin } from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isFileUpload, uploadMediaFile } from "@/lib/cms/storage";

export async function saveProfileAction(formData: FormData) {
  return runAdminAction(async () => {
    const actor = await requireAdmin();
    const locale = await getAdminUiLocale();
    const t = getAdminMessages(locale);
    const supabase = createSupabaseAdminClient();

    let avatarUrl = String(formData.get("avatar_url") ?? "").trim();
    const avatarFile = formData.get("avatar_file");
    if (isFileUpload(avatarFile)) {
      try {
        const uploaded = await uploadMediaFile(avatarFile, {
          folder: `admins/${actor.id}`,
          filenameHint: "avatar",
          maxEdge: 640,
        });
        avatarUrl = uploaded.publicUrl;
      } catch (err) {
        return adminFail(
          err instanceof Error ? err.message : t.common.actionFailed,
        );
      }
    }

    const displayName = String(formData.get("display_name") ?? "").trim();
    const jobTitle = String(formData.get("job_title") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();

    const { error } = await supabase
      .from("metric_admin_users")
      .update({
        display_name: displayName,
        job_title: jobTitle,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", actor.id);

    if (error) return adminFail(error.message);

    await writeAuditLog({
      actor,
      action: "content.update",
      entityType: "metric_admin_users",
      entityId: actor.id,
      meta: { kind: "profile" },
    });

    return adminRedirect("/admin/profile/?saved=1", t.common.saved);
  });
}

export async function changePasswordAction(formData: FormData) {
  return runAdminAction(async () => {
    const actor = await requireAdmin();
    const locale = await getAdminUiLocale();
    const t = getAdminMessages(locale);

    const currentPassword = String(formData.get("current_password") ?? "");
    const newPassword = String(formData.get("new_password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (newPassword.length < 8) {
      return adminFail(t.profile.passwordTooShort);
    }
    if (newPassword !== confirmPassword) {
      return adminFail(t.profile.passwordMismatch);
    }
    if (!currentPassword) {
      return adminFail(t.profile.wrongCurrentPassword);
    }

    const supabase = await createSupabaseServerClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: actor.email,
      password: currentPassword,
    });
    if (verifyError) {
      return adminFail(t.profile.wrongCurrentPassword);
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return adminFail(error.message);

    await writeAuditLog({
      actor,
      action: "user.reset_password",
      entityType: "metric_admin_users",
      entityId: actor.id,
      meta: { kind: "self" },
    });

    return adminRedirect(
      "/admin/profile/?password=1",
      t.profile.passwordChanged,
    );
  });
}
