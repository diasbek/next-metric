"use server";

import {
  getAdminByUserId,
  touchAdminLastLogin,
} from "@/lib/cms/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function verifyAdminMembershipAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not signed in" };
  }

  const admin = await getAdminByUserId(user.id);
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, error: "Not an admin" };
  }

  await touchAdminLastLogin(user.id);
  return { ok: true };
}
