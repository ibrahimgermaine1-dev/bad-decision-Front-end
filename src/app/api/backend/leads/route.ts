/**
 * Backend Proxy: GET /api/backend/leads?task_id=xxx
 * Fetches all leads for a specific search task (collection) from the backend
 * `/api/leads/{task_id}` endpoint. Verifies ownership via X-User-Id header.
 * Falls back to direct Supabase REST API if the backend is unreachable.
 * Rate limited. Input validated.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Rate limit
    const rateLimitResult = checkRateLimit(req, { maxRequests: 60, windowMs: 60000 })
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

    const taskId = req.nextUrl.searchParams.get('task_id')

    if (!taskId) {
      return NextResponse.json({ error: 'task_id required' }, { status: 400 })
    }

    // Validate taskId format strictly (UUIDs, alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(taskId) || taskId.length > 256) {
      return NextResponse.json({ error: 'Invalid task_id format' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    // 1. Try the FastAPI backend first
    if (backendUrl) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiSecret) headers['X-API-Secret'] = apiSecret
      headers['X-User-Id'] = userId

      const res = await fetch(`${backendUrl}/api/leads/${encodeURIComponent(taskId)}`, {
        method: 'GET',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        const leads = data.leads || data || []
        return NextResponse.json({ leads, task_id: taskId })
      }
    }

    // 2. Fallback: direct Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const sbHeaders = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    }

    // Verify task belongs to the requesting user before returning any leads.
    const taskRes = await fetch(
      `${supabaseUrl}/rest/v1/tasks?select=id,user_id,task_type,query&id=eq.${encodeURIComponent(taskId)}&limit=1`,
      { headers: sbHeaders }
    )

    if (!taskRes.ok) {
      console.error('[PROXY /leads] Task lookup failed:', await taskRes.text())
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const taskRows = await taskRes.json()
    if (!taskRows || taskRows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = taskRows[0]
    if (task.user_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch leads for this task
    const leadsRes = await fetch(
      `${supabaseUrl}/rest/v1/workspace_leads?select=*&task_id=eq.${encodeURIComponent(taskId)}`,
      { headers: sbHeaders }
    )

    if (!leadsRes.ok) {
      console.error('[PROXY /leads] Leads fetch failed:', await leadsRes.text())
      return NextResponse.json({ leads: [], task_id: taskId, task_type: task.task_type })
    }

    const leads = await leadsRes.json()
    return NextResponse.json({
      leads: leads || [],
      task_id: taskId,
      task_type: task.task_type,
      query: task.query,
    })
  } catch (error: any) {
    console.error('[PROXY /leads] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
