/**
 * Backend Proxy: GET /api/backend/tasks/[taskId]
 * Polls task status from the FastAPI backend.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { userId, getToken } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await getToken()
    const { taskId } = await params

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (!backendUrl) {
      return NextResponse.json({ error: 'BACKEND_URL not configured' }, { status: 500 })
    }

    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    const res = await fetch(`${backendUrl}/api/tasks/${taskId}`, {
      method: 'GET',
      headers,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('[PROXY /tasks] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
