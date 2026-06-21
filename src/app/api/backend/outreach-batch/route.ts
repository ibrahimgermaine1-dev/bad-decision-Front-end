/**
 * Backend Proxy: POST /api/backend/outreach-batch
 * Generate personalized outreach messages for ALL leads in a task at once.
 *
 * Body: { task_id: string, force_regenerate?: boolean }
 * Forwards to backend: POST /api/outreach/generate-batch with same body.
 *
 * force_regenerate:
 *   - false (default): only generate for leads with no existing messages
 *   - true: override existing messages, regenerate for ALL leads
 *
 * Authenticates via Clerk — only the signed-in user can request batch
 * generation. The backend then looks up the leads + the user's saved
 * service offering and copywriting style, generates messages for each
 * lead, and returns a summary count.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

// Batch generation can take a while (one AI call per lead).
// Allow up to 5 minutes.
export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reqBody = await req.json().catch(() => ({}))
    const taskId = reqBody?.task_id
    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400 })
    }

    const forceRegenerate = Boolean(reqBody?.force_regenerate)

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (!backendUrl) {
      return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    const body = JSON.stringify({ task_id: taskId, force_regenerate: forceRegenerate })

    // Try the primary batch endpoint. If it returns 404, try the alternative path.
    // This works around a routing issue on Render where /api/outreach/generate-batch
    // returns 404 even though the route is defined.
    let res = await fetch(`${backendUrl}/api/outreach/generate-batch`, {
      method: 'POST',
      headers,
      body,
    })

    // If 404, try the alternative path without the hyphen
    if (res.status === 404) {
      console.warn('[PROXY /outreach-batch] Primary path 404, trying alternative /api/outreach/batch')
      res = await fetch(`${backendUrl}/api/outreach/batch`, {
        method: 'POST',
        headers,
        body,
      })
    }

    // Get the response as text first, then try to parse as JSON.
    const responseText = await res.text()
    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { error: responseText.slice(0, 500) || `Backend error (${res.status})` }
    }

    if (!res.ok) {
      return NextResponse.json(
        data || { error: `Batch generation failed (${res.status})` },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[PROXY /outreach-batch] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
