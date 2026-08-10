import { getEnv, requireEnv } from "@/utils/env";

/** Public project URL (browser + server). */
export function getSupabaseUrl(): string {
  return getEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
}

/** Publishable / anon key for browser clients. */
export function getSupabasePublishableKey(): string {
  return getEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

/**
 * Secret / service key — server and build scripts only.
 * Never import this into Client Components.
 */
export function getSupabaseSecretKey(): string {
  // Hard guard: never read a NEXT_PUBLIC_ secret key alias
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
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
}

export function requireSupabasePublishableKey(): string {
  return requireEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
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
