/**
 * Backend Proxy: GET /api/backend/tasks/status?taskId=xxx
 * Polls task status from the FastAPI backend.
 * Falls back to direct Supabase REST API if backend is down.
 *
 * Uses query param instead of path param to avoid bracket folder names
 * that break GitHub's web upload interface.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = req.nextUrl.searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 })
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

    const res = await fetch(`${backendUrl}/api/tasks/${taskId}`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      // Fallback: direct Supabase REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
        const errData = await res.json().catch(() => ({ error: 'Task fetch failed' }))
        return NextResponse.json(errData, { status: res.status })
      }

      const sbHeaders = {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      }

      const taskRes = await fetch(
        `${supabaseUrl}/rest/v1/search_tasks?select=id,engine,query,status,created_at&id=eq.${encodeURIComponent(taskId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
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
        engine: task.engine,
        query: task.query,
        leads,
        lead_count: leads.length,
      })
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('[PROXY /tasks/status] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
