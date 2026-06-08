/**
 * BAD DECISION AI — Supabase Client
 * Creates a Supabase client for both client-side and server-side usage.
 *
 * IMPORTANT: Supabase throws if the URL is empty. We use lazy initialization
 * so the module can be imported at build time without crashing. The actual
 * client is created on first use, when env vars are guaranteed to be available.
 *
 * Client-side: uses NEXT_PUBLIC_ env vars (anon key, limited RLS access)
 * Server-side (API routes): uses SUPABASE_SERVICE_ROLE_KEY (full access, bypasses RLS)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseClient: SupabaseClient | null = null
let _supabaseServerClient: SupabaseClient | null = null

function getUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

function getAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

function getServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

/**
 * Client-side Supabase instance (anon key, RLS-enforced)
 * Use this in React components.
 * Lazy-initialized on first access.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseClient) {
      const url = getUrl()
      const key = getAnonKey()
      if (!url || !key) {
        // Return a no-op function for any method call during SSR/build
        if (typeof prop === 'string') {
          return (...args: any[]) => {
            console.warn(`[SUPABASE] Client not initialized — env vars missing. Called: ${String(prop)}`)
            return { data: null, error: { message: 'Supabase not configured' } }
          }
        }
        return undefined
      }
      _supabaseClient = createClient(url, key)
    }
    const value = (_supabaseClient as any)[prop]
    return typeof value === 'function' ? value.bind(_supabaseClient) : value
  },
})

/**
 * Server-side Supabase instance (service role key, bypasses RLS)
 * Use this in Next.js API routes only — NEVER expose to the client.
 * Lazy-initialized on first call.
 */
export function createServerClient(): SupabaseClient {
  if (!_supabaseServerClient) {
    const url = getUrl()
    const key = getServiceKey() || getAnonKey()
    if (!url || !key) {
      throw new Error('[SUPABASE] Server client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
    }
    _supabaseServerClient = createClient(url, key)
  }
  return _supabaseServerClient
}
