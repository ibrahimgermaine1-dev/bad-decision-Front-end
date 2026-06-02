import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// SUPABASE ADMIN CLIENT — Backend only (service role, bypasses RLS)
// Use ONLY in server-side API routes. Never expose to the client.
// Returns null if env vars are not set (graceful degradation).
// Uses UNIFIED SCHEMA: profiles, usage_ledger, tasks, etc.
// ============================================================

let _adminClient: SupabaseClient | null | undefined = undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (_adminClient === undefined) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      _adminClient = null;
    } else {
      _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }
  return _adminClient;
}
