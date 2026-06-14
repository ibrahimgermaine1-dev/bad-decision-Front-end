/**
 * Backend Proxy: GET /api/backend/collections
 * Fetches user's search task history from the backend or Supabase.
 * Uses service role key server-side (no client-side anon key exposure).
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

    // Try the backend first
    if (backendUrl) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiSecret) headers['X-API-Secret'] = apiSecret

      const res = await fetch(`${backendUrl}/api/tasks/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        const tasks = data.tasks || data || []

        // Map backend task fields to frontend collection format
        const collections = (Array.isArray(tasks) ? tasks : []).map((task: any) => ({
          id: task.id,
          name: task.query || 'Untitled Search',
          task_type: (task.task_type || task.engine || 'ads_intent'),
          lead_count: 0,
          created_at: task.created_at?.split('T')[0] || '',
        }))

        return NextResponse.json(collections)
      }
    }

    // Fallback: direct Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json([], { status: 200 })
    }

    // Query the "tasks" table (backend uses "tasks", not "search_tasks")
    const res = await fetch(
      `${supabaseUrl}/rest/v1/tasks?select=id,query,task_type,status,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=20`,
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
    const collections = (data || []).map((task: any) => ({
      id: task.id,
      name: task.query || 'Untitled Search',
      task_type: (task.task_type || 'ads_intent'),
      lead_count: 0,
      created_at: task.created_at?.split('T')[0] || '',
    }))

    return NextResponse.json(collections)
  } catch (error: any) {
    console.error('[PROXY /collections] Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}
