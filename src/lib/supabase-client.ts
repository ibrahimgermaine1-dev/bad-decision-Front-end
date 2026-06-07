/**
 * BAD DECISION AI — Supabase Client
 * Creates a Supabase client for both client-side and server-side usage.
 *
 * Client-side: uses NEXT_PUBLIC_ env vars (anon key, limited RLS access)
 * Server-side (API routes): uses SUPABASE_SERVICE_ROLE_KEY (full access, bypasses RLS)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Client-side Supabase instance (anon key, RLS-enforced)
 * Use this in React components.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Server-side Supabase instance (service role key, bypasses RLS)
 * Use this in Next.js API routes only — NEVER expose to the client.
 */
export function createServerClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey)
}
