/**
 * BAD DECISION AI — Supabase Client Helper
 * Uses direct REST API via fetch instead of @supabase/supabase-js SDK.
 * This avoids the SDK's build-time crash when env vars are missing.
 *
 * Client-side: uses NEXT_PUBLIC_ env vars (anon key, limited RLS access)
 * Server-side (API routes): uses SUPABASE_SERVICE_ROLE_KEY (full access, bypasses RLS)
 */

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
 * Get headers for client-side Supabase REST API calls (anon key, RLS-enforced)
 */
export function getClientHeaders(): Record<string, string> | null {
  const url = getUrl()
  const key = getAnonKey()
  if (!url || !key) return null
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Get headers for server-side Supabase REST API calls (service role key, bypasses RLS)
 * Use this in Next.js API routes only — NEVER expose to the client.
 */
export function getServerHeaders(): Record<string, string> | null {
  const url = getUrl()
  const key = getServiceKey() || getAnonKey()
  if (!url || !key) return null
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  }
}

/**
 * Get the Supabase URL.
 */
export function getSupabaseUrl(): string {
  return getUrl()
}

/**
 * Check if Supabase is configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = getUrl()
  const key = getAnonKey()
  return !!(url && key && !url.includes('placeholder'))
}
