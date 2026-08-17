import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getCanonicalRedirectFromHeaders } from "@/utils/seo/canonical-request";

/**
 * 1. One-hop 308 to the canonical URL (https apex, trailing slash, retired pages).
 * 2. Admin edge gate: refresh session cookies and require a signed-in user.
 *    Membership is enforced in the dashboard layout via requireAdmin (cached).
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/_next")) {
    const canonical = getCanonicalRedirectFromHeaders(
      request.headers,
      request.nextUrl,
    );
    if (canonical) {
      return NextResponse.redirect(canonical, 308);
    }
  }

  if (!pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    const german =
      pathname === "/de" || pathname === "/de/" || pathname.startsWith("/de/");
    requestHeaders.set("x-html-lang", german ? "de" : "en");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!url || !publishableKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = pathname.startsWith("/admin/login");
  const isSetup = pathname.startsWith("/admin/setup");
  const isLogout = pathname.startsWith("/admin/logout");

  if (!isLogin && !isSetup && !isLogout && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login/";
    redirectUrl.search = "";
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    if (nextPath.startsWith("/admin/") && !nextPath.startsWith("/admin/login")) {
      redirectUrl.searchParams.set("next", nextPath);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/|favicon.ico).*)",
  ],
};
