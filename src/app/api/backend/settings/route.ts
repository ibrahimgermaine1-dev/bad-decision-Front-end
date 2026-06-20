/**
 * Backend Proxy: /api/backend/settings
 *   GET  /api/backend/settings          → fetch the user's outreach settings
 *   PUT  /api/backend/settings          → update the user's outreach settings
 *
 * Backend endpoints (FastAPI):
 *   GET  /api/settings/{user_id}
 *   PUT  /api/settings/{user_id}
 *
 * Falls back to direct Supabase REST API on the `profiles` table if the
 * backend is unreachable. Rate limited. Uses service role key server-side only.
 *
 * Settings fields:
 *   - user_service        (free text — what the user sells)
 *   - target_audience     (free text — who the user is reaching out to)
 *   - copywriting_style   (enum: dan_kennedy | donald_miller | ray_edwards |
 *                          david_ogilvy | jay_abraham | gary_halbert)
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const ALLOWED_STYLES = [
  'dan_kennedy',
  'donald_miller',
  'ray_edwards',
  'david_ogilvy',
  'jay_abraham',
  'gary_halbert',
] as const

type CopywritingStyle = (typeof ALLOWED_STYLES)[number]

interface UserSettings {
  user_service: string
  target_audience: string
  copywriting_style: CopywritingStyle
}

const DEFAULT_SETTINGS: UserSettings = {
  user_service: '',
  target_audience: '',
  copywriting_style: 'david_ogilvy',
}

function normalizeStyle(value: unknown): CopywritingStyle {
  if (typeof value === 'string' && (ALLOWED_STYLES as readonly string[]).includes(value)) {
    return value as CopywritingStyle
  }
  return 'david_ogilvy'
}

// ============================================================
// GET — fetch the user's current settings
// ============================================================
export async function GET(req: NextRequest) {
  try {
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

    // 1. Try the FastAPI backend
    if (backendUrl) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiSecret) headers['X-API-Secret'] = apiSecret

      const res = await fetch(`${backendUrl}/api/settings/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        const s = data.settings || data
        return NextResponse.json({
          settings: {
            user_service: s.user_service || '',
            target_audience: s.target_audience || '',
            copywriting_style: normalizeStyle(s.copywriting_style),
          },
        })
      }
    }

    // 2. Fallback: direct Supabase REST API on `profiles` table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=user_service,target_audience,copywriting_style&id=eq.${encodeURIComponent(userId)}&limit=1`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    )

    if (!sbRes.ok) {
      console.error('[PROXY /settings GET] Supabase error:', await sbRes.text())
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

    const rows = await sbRes.json()
    if (!rows || rows.length === 0) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

    const r = rows[0]
    return NextResponse.json({
      settings: {
        user_service: r.user_service || '',
        target_audience: r.target_audience || '',
        copywriting_style: normalizeStyle(r.copywriting_style),
      },
    })
  } catch (error: any) {
    console.error('[PROXY /settings GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ============================================================
// PUT — update the user's settings
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const rateLimitResult = checkRateLimit(req, { maxRequests: 20, windowMs: 60000 })
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

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const userService = typeof body?.user_service === 'string' ? body.user_service.slice(0, 500) : ''
    const targetAudience = typeof body?.target_audience === 'string' ? body.target_audience.slice(0, 500) : ''
    const copywritingStyle = normalizeStyle(body?.copywriting_style)

    const payload: UserSettings = {
      user_service: userService,
      target_audience: targetAudience,
      copywriting_style: copywritingStyle,
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    // 1. Try the FastAPI backend
    if (backendUrl) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiSecret) headers['X-API-Secret'] = apiSecret

      const res = await fetch(`${backendUrl}/api/settings/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          user_id: userId,
          user_service: payload.user_service,
          target_audience: payload.target_audience,
          copywriting_style: payload.copywriting_style,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const s = data.settings || data
        return NextResponse.json({
          success: true,
          settings: {
            user_service: s?.user_service ?? payload.user_service,
            target_audience: s?.target_audience ?? payload.target_audience,
            copywriting_style: normalizeStyle(s?.copywriting_style ?? payload.copywriting_style),
          },
        })
      }
    }

    // 2. Fallback: direct Supabase REST API on `profiles` table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Settings cannot be saved right now. Please try again later.' },
        { status: 503 }
      )
    }

    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_service: payload.user_service,
          target_audience: payload.target_audience,
          copywriting_style: payload.copywriting_style,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!sbRes.ok) {
      console.error('[PROXY /settings PUT] Supabase error:', await sbRes.text())
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 502 }
      )
    }

    const rows = await sbRes.json()
    const r = Array.isArray(rows) && rows.length > 0 ? rows[0] : {}
    return NextResponse.json({
      success: true,
      settings: {
        user_service: r.user_service ?? payload.user_service,
        target_audience: r.target_audience ?? payload.target_audience,
        copywriting_style: normalizeStyle(r.copywriting_style ?? payload.copywriting_style),
      },
    })
  } catch (error: any) {
    console.error('[PROXY /settings PUT] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
