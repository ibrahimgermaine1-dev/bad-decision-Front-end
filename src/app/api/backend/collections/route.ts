/**
 * Backend Proxy: GET /api/backend/collections
 * Fetches user's smart collections from the backend.
 * The backend's /api/collections/{user_id} endpoint returns each collection
 * with its real lead_count, so we pass it through instead of hardcoding 0.
 *
 * Fallback: direct Supabase REST API if the backend URL is not configured.
 * Rate limited.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Rate limit
    const rateLimitResult = checkRateLimit(req, { maxRequests: 30, windowMs: 60000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait.' },
        { status: 429 }
      )
    }

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    // Try the backend first — /api/collections/{user_id} returns each
    // collection with its real lead_count (pulled from smart_collections table).
    if (backendUrl) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiSecret) headers['X-API-Secret'] = apiSecret

      const res = await fetch(`${backendUrl}/api/collections/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        // Backend returns { collections: [...] }. Fall back to top-level array
        // just in case the shape changes.
        const raw = Array.isArray(data) ? data : (data.collections || data.tasks || [])
        const collections = raw.map((c: any) => ({
          id: c.id,
          name: c.name || c.query || 'Untitled Search',
          task_type: c.task_type || c.engine || 'ads_intent',
          lead_count: typeof c.lead_count === 'number'
            ? c.lead_count
            : (typeof c.leads_found === 'number' ? c.leads_found : 0),
          created_at: c.created_at?.split('T')[0] || '',
        }))

        return NextResponse.json(collections)
      }
    }

    // Fallback: direct Supabase REST API on the smart_collections table.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json([], { status: 200 })
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/smart_collections?select=id,name,task_type,lead_count,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=50`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    )

    if (!res.ok) {
      console.error('[PROXY /collections] Supabase error:', await res.text())
      return NextResponse.json([], { status: 200 })
    }

    const data = await res.json()

    // Map to frontend collection format
    const collections = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name || 'Untitled Search',
      task_type: c.task_type || 'ads_intent',
      lead_count: typeof c.lead_count === 'number' ? c.lead_count : 0,
      created_at: c.created_at?.split('T')[0] || '',
    }))

    return NextResponse.json(collections)
  } catch (error: any) {
    console.error('[PROXY /collections] Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}
