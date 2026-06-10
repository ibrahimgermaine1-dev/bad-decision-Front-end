/**
 * Supabase client for the Next.js frontend.
 * Uses the ANON key (limited access, respects RLS).
 * The service role key is only used in API routes (server-side).
 *
 * IMPORTANT: All exports are lazy — Supabase is only initialized when
 * actually accessed, not at module import time. This prevents build errors
 * when environment variables are not available.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Check if Supabase is properly configured with real credentials.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('placeholder'))
}

/**
 * Get the Supabase client (lazy singleton).
 * Returns null if env vars are not configured.
 */
let _supabaseInstance: SupabaseClient | null | undefined = undefined

export function getSupabase(): SupabaseClient | null {
  if (_supabaseInstance === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url.includes('placeholder')) {
      _supabaseInstance = null
    } else {
      _supabaseInstance = createClient(url, key)
    }
  }
  return _supabaseInstance
}

/**
 * Create a Supabase client with service role key (bypasses RLS).
 * ONLY use this in server-side API routes — never in client components.
 * Throws if env vars are not configured.
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes('placeholder')) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }
  return createClient(url, key)
}
