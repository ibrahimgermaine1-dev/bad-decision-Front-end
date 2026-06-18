/**
 * Backend Proxy: POST /api/backend/search
 * Forwards search requests to the FastAPI backend with auth.
 * Uses correct endpoint /api/tasks/create with proper field mapping.
 * Rate limited. Input validated.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkStrictRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Strict rate limit for search (expensive operation)
    const rateLimitResult = checkStrictRateLimit(req, 10, 60000)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many search requests. Please wait a moment.', detail: 'Rate limited' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // VULN 6 FIX: Validate inputs strictly
    const validEngines = ['ads_intent', 'smb_maps', 'web_absent', 'social_intent']
    if (!body.engine || !validEngines.includes(body.engine)) {
      return NextResponse.json({ error: 'Invalid engine type', detail: 'Invalid engine' }, { status: 400 })
    }
    if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required', detail: 'Missing query' }, { status: 400 })
    }
    if (body.query.length > 1000) {
      return NextResponse.json({ error: 'Query too long (max 1000 characters)', detail: 'Query too long' }, { status: 400 })
    }
    if (body.country && (typeof body.country !== 'string' || body.country.length > 10)) {
      return NextResponse.json({ error: 'Invalid country code', detail: 'Invalid country' }, { status: 400 })
    }
    if (body.state_region && (typeof body.state_region !== 'string' || body.state_region.length > 100)) {
      return NextResponse.json({ error: 'Invalid state/region', detail: 'Invalid state_region' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (!backendUrl) {
      return NextResponse.json({ error: 'BACKEND_URL not configured' }, { status: 500 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    // Use correct backend endpoint /api/tasks/create
    // Map frontend "engine" field to backend "task_type" field
    const res = await fetch(`${backendUrl}/api/tasks/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        task_type: body.engine,      // frontend "engine" -> backend "task_type"
        query: body.query.trim(),
        credits_reserved: body.credits_reserved || 2,
        country: body.country || '',
        state_region: body.state_region || '',
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[PROXY /search] Backend returned error:', data)
      return NextResponse.json(data, { status: res.status })
    }

    // Transform backend response to match what the frontend expects
    // Backend returns: { success: true, task: [{ id, user_id, task_type, query, status, ... }] }
    // Frontend expects: { task_id: string, status: string }
    const task = Array.isArray(data.task) ? data.task[0] : data.task
    return NextResponse.json({
      task_id: task?.id || null,
      status: task?.status || 'pending',
      message: data.success ? 'Task created successfully' : 'Task creation failed',
    }, { status: 200 })
  } catch (error: any) {
    console.error('[PROXY /search] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
