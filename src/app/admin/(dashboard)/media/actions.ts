"use server";

import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { MEDIA_BUCKET, isFileUpload, uploadMediaFile } from "@/lib/cms/storage";
import { revalidateCms } from "@/lib/cms/revalidate";
import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";

export async function uploadMediaAction(formData: FormData) {
  await requirePermission("media");
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const t = getAdminMessages(await getAdminUiLocale());

  const file = formData.get("file");
  if (!isFileUpload(file)) {
    return adminFail(t.flash.errorMissing);
  }

  try {
    const folder = String(formData.get("folder") ?? "uploads").trim() || "uploads";
    const uploaded = await uploadMediaFile(file, { folder });
    revalidateCms(["cms"]);
    return adminRedirect(
      `/admin/media/?uploaded=${encodeURIComponent(uploaded.publicUrl)}`,
      t.flash.uploaded,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : t.common.actionFailed;
    return adminFail(message);
  }
}

export async function deleteMediaAction(formData: FormData) {
  await requirePermission("media");
  const { getAdminMessages } = await import("@/i18n/admin/get-admin-messages");
  const { getAdminUiLocale } = await import("@/i18n/admin/get-admin-locale");
  const t = getAdminMessages(await getAdminUiLocale());

  const path = String(formData.get("path") ?? "").replace(/^\/+/, "");
  if (!path) return adminFail(t.flash.errorMissing);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) {
    return adminFail(error.message);
  }

  revalidateCms(["cms"]);
  return adminRedirect("/admin/media/", t.common.ready);
}
