import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { touchAdminLastLogin } from "@/lib/cms/auth";
import {
  requireSupabasePublishableKey,
  requireSupabaseUrl,
} from "@/lib/supabase/env";

export const runtime = "nodejs";

type LoginBody = {
  email?: string;
  password?: string;
};

type JsonResult = { ok: true } | { ok: false; error: string };

function jsonWithCookies(
  payload: JsonResult,
  status: number,
  cookies: { name: string; value: string; options?: Record<string, unknown> }[],
) {
  const response = NextResponse.json(payload, { status });
  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options as never);
  }
  return response;
}

/**
 * Admin login JSON API — browser → Next → Supabase Auth.
 * Returns application/json (not RSC Server Action flight protocol).
 */
export async function POST(request: NextRequest) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required" },
      { status: 400 },
    );
  }

  const pendingCookies: {
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }[] = [];

  const supabase = createServerClient(
    requireSupabaseUrl(),
    requireSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          pendingCookies.length = 0;
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options: options as never });
          });
        },
      },
    },
  );

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !data.user) {
    return jsonWithCookies(
      {
        ok: false,
        error: authError?.message ?? "Invalid login credentials",
      },
      401,
      pendingCookies,
    );
  }

  // Membership via service role — reliable in Route Handlers (session cookies
  // are not yet visible to cookies() from next/headers in the same request).
  const adminClient = createSupabaseAdminClient();
  const { data: adminRow, error: adminError } = await adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    await supabase.auth.signOut();
    return jsonWithCookies(
      { ok: false, error: "Not an admin" },
      403,
      pendingCookies,
    );
  }

  await touchAdminLastLogin(data.user.id);
  return jsonWithCookies({ ok: true }, 200, pendingCookies);
}
