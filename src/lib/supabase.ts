import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// SUPABASE CLIENT — Frontend (anon key, RLS-protected)
// Returns null if env vars are not configured (graceful degradation).
// Uses the UNIFIED SCHEMA: profiles, usage_ledger, tasks, etc.
// ============================================================

let _client: SupabaseClient | null | undefined = undefined;

export function getSupabase(): SupabaseClient | null {
  if (_client === undefined) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      _client = null;
    } else {
      _client = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return _client;
}
