import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";

export type AdminRole = "owner" | "editor";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  displayName: string;
  jobTitle: string;
  avatarUrl: string;
};

type AdminRow = {
  user_id: string;
  email: string;
  role: string;
  display_name?: string | null;
  job_title?: string | null;
  avatar_url?: string | null;
};

function mapAdminRow(data: AdminRow): AdminUser {
  return {
    id: data.user_id,
    email: data.email,
    role: data.role as AdminRole,
    displayName: data.display_name ?? "",
    jobTitle: data.job_title ?? "",
    avatarUrl: data.avatar_url ?? "",
  };
}

const ADMIN_SELECT =
  "user_id, email, role, display_name, job_title, avatar_url";

/** Permission areas in the CMS. */
export type AdminPermissionArea =
  | "content"
  | "leads"
  | "media"
  | "settings"
  | "users"
  | "audit"
  | "profile";

const OWNER_ONLY: AdminPermissionArea[] = ["settings", "users", "audit"];

export function canAccess(
  role: AdminRole,
  area: AdminPermissionArea,
): boolean {
  if (area === "profile") return true;
  if (OWNER_ONLY.includes(area)) return role === "owner";
  return role === "owner" || role === "editor";
}

export const getAdminSession = cache(async (): Promise<AdminUser | null> => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;

    // Prefer the signed-in session (RLS allows own row) so a bad/missing
    // service role key does not block login after password sign-in.
    const { data: own } = await supabase
      .from("admin_users")
      .select(ADMIN_SELECT)
      .eq("user_id", user.id)
      .maybeSingle();
    if (own) return mapAdminRow(own as AdminRow);

    return getAdminByUserId(user.id);
  } catch {
    return null;
  }
});

/** Look up admin membership by auth user id. */
export async function getAdminByUserId(
  userId: string,
): Promise<AdminUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id === userId) {
      const { data: own } = await supabase
        .from("admin_users")
        .select(ADMIN_SELECT)
        .eq("user_id", userId)
        .maybeSingle();
      if (own) return mapAdminRow(own as AdminRow);
    }
  } catch {
    // fall through to service role
  }

  if (!hasSupabaseAdminConfig()) return null;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("admin_users")
      .select(ADMIN_SELECT)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return mapAdminRow(data as AdminRow);
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login/");
  return admin;
}

export async function requireOwner(): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/admin/?error=forbidden");
  return admin;
}

export async function requirePermission(
  area: AdminPermissionArea,
): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (!canAccess(admin.role, area)) redirect("/admin/?error=forbidden");
  return admin;
}

export async function countOwners(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("admin_users")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "owner");
  return count ?? 0;
}

/** Touch last_login_at after successful login (best-effort). */
export async function touchAdminLastLogin(userId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", userId);
  } catch {
    // column may not exist until migration applied
  }
}
