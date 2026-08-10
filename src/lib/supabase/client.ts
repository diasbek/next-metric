import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  requireSupabasePublishableKey,
  requireSupabaseUrl,
} from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

type BrowserClientOptions = {
  url?: string;
  publishableKey?: string;
};

/**
 * Browser / Client Component Supabase client (publishable key).
 * Prefer passing url/key from a Server Component so Hostinger runtime env works
 * even when NEXT_PUBLIC_* were missing at build time.
 */
export function createSupabaseBrowserClient(
  options?: BrowserClientOptions,
): SupabaseClient {
  if (browserClient) return browserClient;

  const url = options?.url?.trim() || getSupabaseUrl() || requireSupabaseUrl();
  const key =
    options?.publishableKey?.trim() ||
    getSupabasePublishableKey() ||
    requireSupabasePublishableKey();

  browserClient = createBrowserClient(url, key);
  return browserClient;
}
