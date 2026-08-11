import { getEnv, requireEnv } from "@/utils/env";

/**
 * Project URL.
 * Prefer non-NEXT_PUBLIC keys first so Hostinger/runtime env wins over
 * values inlined into the Next bundle at build time.
 */
export function getSupabaseUrl(): string {
  return getEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
}

/**
 * Anon / publishable key for Auth + RLS clients.
 * Prefer server runtime aliases, then legacy anon JWT, then publishable.
 */
export function getSupabasePublishableKey(): string {
  return getEnv(
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

/**
 * Secret / service key — server and build scripts only.
 * Never import this into Client Components.
 */
export function getSupabaseSecretKey(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY) {
    throw new Error(
      "Invalid env: NEXT_PUBLIC_SUPABASE_SECRET_KEY must not be set. Use SUPABASE_SECRET_KEY.",
    );
  }

  const secret = getEnv(
    "SUPABASE_SECRET_KEY",
    "SUPABASE_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  );
  const publishable = getSupabasePublishableKey();
  if (secret && publishable && secret === publishable) {
    throw new Error(
      "Invalid env: secret key must not match the publishable/anon key.",
    );
  }
  return secret;
}

export function requireSupabaseUrl(): string {
  return requireEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
}

export function requireSupabasePublishableKey(): string {
  return requireEnv(
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export function requireSupabaseSecretKey(): string {
  return requireEnv(
    "SUPABASE_SECRET_KEY",
    "SUPABASE_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  );
}

export function hasSupabaseBrowserConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseSecretKey());
}

/** Hostname only — safe to return in API errors for Hostinger diagnosis. */
export function getSupabaseHost(): string {
  try {
    return new URL(getSupabaseUrl()).host;
  } catch {
    return "";
  }
}
