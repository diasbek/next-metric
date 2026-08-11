"use server";

import {
  countOwners,
  requireOwner,
  type AdminRole,
} from "@/lib/cms/auth";
import { writeAuditLog } from "@/lib/cms/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { adminFail, adminRedirect } from "@/lib/cms/admin-redirect";

function revalidateUsers() {
  revalidatePath("/admin/users/");
}

export async function inviteAdminAction(formData: FormData) {
  const actor = await requireOwner();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = (String(formData.get("role") ?? "editor") as AdminRole) || "editor";
  const password = String(formData.get("password") ?? "");

  if (!email) return adminRedirect("/admin/users/?error=email");
  if (role !== "owner" && role !== "editor") {
    return adminRedirect("/admin/users/?error=role");
  }
  if (password.length < 8) return adminRedirect("/admin/users/?error=password");

  const supabase = createSupabaseAdminClient();

  const { data: listed } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  let user = listed?.users.find((u) => u.email?.toLowerCase() === email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      return adminRedirect(`/admin/users/?error=${encodeURIComponent(error?.message ?? "create")}`);
    }
    user = data.user;
  } else {
    await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
  }

  const { error: upsertError } = await supabase.from("metric_admin_users").upsert({
    user_id: user.id,
    email,
    role,
  });
  if (upsertError) {
    return adminRedirect(`/admin/users/?error=${encodeURIComponent(upsertError.message)}`);
  }

  await writeAuditLog({
    actor,
    action: "user.invite",
    entityType: "metric_admin_users",
    entityId: user.id,
    meta: { email, role },
  });

  revalidateUsers();
  return adminRedirect("/admin/users/?ok=invited");
}

export async function changeAdminRoleAction(formData: FormData) {
  const actor = await requireOwner();
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as AdminRole;
  if (!userId || (role !== "owner" && role !== "editor")) {
    return adminRedirect("/admin/users/?error=role");
  }

  const supabase = createSupabaseAdminClient();
  const { data: target } = await supabase
    .from("metric_admin_users")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!target) return adminRedirect("/admin/users/?error=missing");

  if (target.role === "owner" && role === "editor") {
    const owners = await countOwners();
    if (owners <= 1) return adminRedirect("/admin/users/?error=last-owner");
  }

  const { error } = await supabase
    .from("metric_admin_users")
    .update({ role })
    .eq("user_id", userId);
  if (error) return adminRedirect(`/admin/users/?error=${encodeURIComponent(error.message)}`);

  await writeAuditLog({
    actor,
    action: "user.role_change",
    entityType: "metric_admin_users",
    entityId: userId,
    meta: { from: target.role, to: role },
  });

  revalidateUsers();
  return adminRedirect("/admin/users/?ok=role");
}

export async function revokeAdminAction(formData: FormData) {
  const actor = await requireOwner();
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) return adminRedirect("/admin/users/?error=missing");
  if (userId === actor.id) return adminRedirect("/admin/users/?error=self");

  const supabase = createSupabaseAdminClient();
  const { data: target } = await supabase
    .from("metric_admin_users")
    .select("user_id, role, email")
    .eq("user_id", userId)
    .maybeSingle();

  if (!target) return adminRedirect("/admin/users/?error=missing");
  if (target.role === "owner") {
    const owners = await countOwners();
    if (owners <= 1) return adminRedirect("/admin/users/?error=last-owner");
  }

  await supabase.from("metric_admin_users").delete().eq("user_id", userId);
  // Keep auth user; revoke CMS access only

  await writeAuditLog({
    actor,
    action: "user.revoke",
    entityType: "metric_admin_users",
    entityId: userId,
    meta: { email: target.email },
  });

  revalidateUsers();
  return adminRedirect("/admin/users/?ok=revoked");
}

export async function resetAdminPasswordAction(formData: FormData) {
  const actor = await requireOwner();
  const userId = String(formData.get("user_id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!userId || password.length < 8) return adminRedirect("/admin/users/?error=password");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password,
  });
  if (error) return adminRedirect(`/admin/users/?error=${encodeURIComponent(error.message)}`);

  await writeAuditLog({
    actor,
    action: "user.reset_password",
    entityType: "metric_admin_users",
    entityId: userId,
  });

  revalidateUsers();
  return adminRedirect("/admin/users/?ok=password");
}
