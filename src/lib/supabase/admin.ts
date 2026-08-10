import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  requireSupabaseSecretKey,
  requireSupabaseUrl,
} from "@/lib/supabase/env";

/**
 * Privileged Supabase client (secret key).
 * Use only in Route Handlers, Server Actions, and Node scripts — never in the browser.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  return createClient(requireSupabaseUrl(), requireSupabaseSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
