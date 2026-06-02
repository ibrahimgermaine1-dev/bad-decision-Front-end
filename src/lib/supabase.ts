/**
 * Supabase client for the Next.js frontend.
 * LAZY INITIALIZATION — avoids crash during build when env vars are empty.
 * Uses function getters instead of top-level instantiation.
 */
import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null

/**
 * Get the Supabase client with ANON key (limited access, respects RLS).
 * Safe for client-side and server-side use.
 */
export function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    supabaseInstance = createClient(url, key)
  }
  return supabaseInstance
}

/**
 * Create a Supabase client with service role key (bypasses RLS).
 * ONLY use this in server-side API routes — never in client components.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  return createClient(url, serviceKey)
}
