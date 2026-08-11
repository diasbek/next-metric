"use server";

import {
  getAdminByUserId,
  touchAdminLastLogin,
} from "@/lib/cms/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginAdminResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Password login via Next backend only — sets session cookies through @supabase/ssr.
 * Browser never talks to Supabase Auth directly.
 */
export async function loginAdminAction(input: {
  email: string;
  password: string;
}): Promise<LoginAdminResult> {
  const email = input.email.trim();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, error: "Email and password are required" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !data.user) {
    return {
      ok: false,
      error: authError?.message ?? "Invalid login credentials",
    };
  }

  const admin = await getAdminByUserId(data.user.id);
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, error: "Not an admin" };
  }

  await touchAdminLastLogin(data.user.id);
  return { ok: true };
}

/** @deprecated Prefer loginAdminAction — kept for any residual callers. */
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
