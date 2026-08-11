import { NextResponse } from "next/server";
import { canAccess, getAdminSession } from "@/lib/cms/auth";
import { isFileUpload, uploadMediaFile } from "@/lib/cms/storage";

export const runtime = "nodejs";

/**
 * Admin media upload proxy — browser → Next → Supabase Storage (service role).
 * No direct browser → *.supabase.co calls.
 */
export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin || !canAccess(admin.role, "media")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!isFileUpload(file)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const folderRaw = formData.get("folder");
  const hintRaw = formData.get("filenameHint");
  const folder =
    typeof folderRaw === "string" && folderRaw.trim()
      ? folderRaw.trim()
      : "uploads";
  const filenameHint =
    typeof hintRaw === "string" && hintRaw.trim() ? hintRaw.trim() : undefined;

  try {
    const uploaded = await uploadMediaFile(file, { folder, filenameHint });
    return NextResponse.json(uploaded);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
