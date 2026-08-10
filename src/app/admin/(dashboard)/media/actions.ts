"use server";

import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { MEDIA_BUCKET, isFileUpload, uploadMediaFile } from "@/lib/cms/storage";
import { revalidateCms } from "@/lib/cms/revalidate";
import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";

export async function uploadMediaAction(formData: FormData) {
  await requirePermission("media");
  const file = formData.get("file");
  if (!isFileUpload(file)) {
    return adminRedirect("/admin/media/?error=missing");
  }

  try {
    const folder = String(formData.get("folder") ?? "uploads").trim() || "uploads";
    const uploaded = await uploadMediaFile(file, { folder });
    revalidateCms(["cms"]);
    return adminRedirect(`/admin/media/?uploaded=${encodeURIComponent(uploaded.publicUrl)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return adminRedirect(`/admin/media/?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteMediaAction(formData: FormData) {
  await requirePermission("media");
  const path = String(formData.get("path") ?? "").replace(/^\/+/, "");
  if (!path) return adminRedirect("/admin/media/?error=missing");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) {
    return adminRedirect(`/admin/media/?error=${encodeURIComponent(error.message)}`);
  }

  revalidateCms(["cms"]);
  return adminRedirect("/admin/media/");
}
