import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  hasSupabaseAdminConfig,
  hasSupabaseBrowserConfig,
  requireSupabasePublishableKey,
  requireSupabaseUrl,
} from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Server-side client for public/published reads.
 * Prefers service role when configured; otherwise uses the publishable key
 * (RLS must allow published SELECT).
 */
export function createSupabasePublicClient(): SupabaseClient | null {
  if (hasSupabaseAdminConfig()) {
    return createSupabaseAdminClient();
  }
  if (!hasSupabaseBrowserConfig()) return null;
  return createClient(requireSupabaseUrl(), requireSupabasePublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function hasSupabasePublicConfig(): boolean {
  return hasSupabaseAdminConfig() || hasSupabaseBrowserConfig();
}
