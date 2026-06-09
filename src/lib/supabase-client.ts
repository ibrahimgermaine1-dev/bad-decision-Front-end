/**
 * Supabase client for the Next.js frontend.
 * Uses the ANON key (limited access, respects RLS).
 * The service role key is only used in API routes (server-side).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — only creates the client when first accessed
let _supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      // Return a no-op client that won't throw at build time
      // Actual API calls will fail gracefully if env vars are missing
      _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
    } else {
      _supabase = createClient(url, key)
    }
  }
  return _supabase
}

// Export as a getter so it's not instantiated at module load time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop]
  },
})

/**
 * Create a Supabase client with service role key (bypasses RLS).
 * ONLY use this in server-side API routes — never in client components.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase URL or service role key is not configured')
  }
  return createClient(url, key)
}
