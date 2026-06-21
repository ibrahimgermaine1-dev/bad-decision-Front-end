/**
 * Backend Proxy: GET /api/backend/tasks/status?taskId=xxx
 * Polls task status from the FastAPI backend.
 *
 * Backend has GET /api/tasks/{user_id} which returns ALL tasks for a user.
 * We fetch all user tasks and find the specific one by taskId.
 * Falls back to direct Supabase REST API if backend is down.
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

    const taskId = req.nextUrl.searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    }

    // Validate taskId format strictly
    if (!/^[a-zA-Z0-9_-]+$/.test(taskId) || taskId.length > 256) {
      return NextResponse.json({ error: 'Invalid taskId format' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (backendUrl) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (apiSecret) headers['X-API-Secret'] = apiSecret

      // Try the dedicated single-task endpoint first.
      // This is the canonical source — it returns only the requested task,
      // not all the user's tasks. Avoids the O(n) scan of fetching every
      // past task just to find one.
      const singleTaskRes = await fetch(`${backendUrl}/api/task/${encodeURIComponent(taskId)}`, {
        method: 'GET',
        headers,
      })

      if (singleTaskRes.ok) {
        const data = await singleTaskRes.json()
        return NextResponse.json({
          task_id: data.task_id,
          status: data.status,
          engine: data.engine || data.task_type || '',
          query: data.query || '',
          progress: data.progress || 0,
          current_step: data.current_step || '',
          leads: data.leads || [],
          lead_count: data.lead_count || (data.leads || []).length,
          credits_reserved: data.credits_reserved || 0,
          credits_spent: data.credits_spent || 0,
          error_message: data.error_message || '',
        })
      }

      // If the single-task endpoint returned 404, the task genuinely doesn't
      // exist (or was deleted). Don't fall back to fetching ALL user tasks —
      // that would be O(n) for every poll and would still return 404.
      if (singleTaskRes.status === 404) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }

      // For 5xx errors (backend cold start, transient failure), fall back to
      // Supabase direct read. We deliberately do NOT fall back to the
      // /api/tasks/{user_id} "fetch all tasks" endpoint — that was O(n) on
      // every poll and burned Supabase quota for power users.
      // (Supabase fallback below.)
    }

    // Fallback: direct Supabase REST API
    return await supabaseFallback(taskId, userId)
  } catch (error: any) {
    console.error('[PROXY /tasks/status] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Fallback: Query Supabase directly for task status.
 * Uses "tasks" table (matching the backend schema).
 */
async function supabaseFallback(taskId: string, userId: string): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
    return NextResponse.json({ error: 'No data source available' }, { status: 503 })
  }

  const sbHeaders = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
  }

  // Query the "tasks" table (includes progress fields)
  const taskRes = await fetch(
    `${supabaseUrl}/rest/v1/tasks?select=id,task_type,query,status,progress,current_step,credits_reserved,credits_spent,error_message,created_at&user_id=eq.${encodeURIComponent(userId)}&id=eq.${encodeURIComponent(taskId)}&limit=1`,
    { headers: sbHeaders }
  )

  if (!taskRes.ok) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const tasks = await taskRes.json()
  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const task = tasks[0]
  let leads: any[] = []

  if (task.status === 'completed') {
    const leadsRes = await fetch(
      `${supabaseUrl}/rest/v1/workspace_leads?select=*&task_id=eq.${encodeURIComponent(taskId)}`,
      { headers: sbHeaders }
    )
    if (leadsRes.ok) leads = await leadsRes.json() || []
  }

  return NextResponse.json({
    task_id: task.id,
    status: task.status,
    engine: task.task_type || task.engine || '',
    query: task.query,
    progress: task.progress || 0,
    current_step: task.current_step || '',
    leads,
    lead_count: leads.length,
    credits_reserved: task.credits_reserved || 0,
    credits_spent: task.credits_spent || 0,
    error_message: task.error_message || '',
  })
}
