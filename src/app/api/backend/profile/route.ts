/**
 * Backend Proxy: GET /api/backend/profile
 * Fetches the authenticated user's profile (tier, email, full_name, country)
 * from the backend `/api/profile/{user_id}` endpoint.
 * Falls back to direct Supabase REST API if the backend is unreachable.
 * Rate limited. Uses service role key server-side only.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
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

    // 1. Try the FastAPI backend first
    if (backendUrl) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiSecret) headers['X-API-Secret'] = apiSecret
      headers['X-User-Id'] = userId

      const res = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        const profile = data.profile || data
        return NextResponse.json({
          profile: {
            id: profile.id || userId,
            email: profile.email || '',
            full_name: profile.full_name || '',
            tier: profile.tier || 'free',
            country: profile.country || 'US',
            created_at: profile.created_at || '',
          },
        })
      }
    }

    // 2. Fallback: direct Supabase REST API on `profiles` table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      // No backend, no Supabase — derive a sensible default from Clerk.
      const user = await currentUser()
      return NextResponse.json({
        profile: {
          id: userId,
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          full_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          tier: 'free',
          country: 'US',
          created_at: '',
        },
      })
    }

    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=id,email,full_name,tier,country,created_at&id=eq.${encodeURIComponent(userId)}&limit=1`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    )

    if (!sbRes.ok) {
      console.error('[PROXY /profile] Supabase error:', await sbRes.text())
      // Last-ditch default — never block the dashboard
      const user = await currentUser()
      return NextResponse.json({
        profile: {
          id: userId,
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          full_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          tier: 'free',
          country: 'US',
          created_at: '',
        },
      })
    }

    const rows = await sbRes.json()

    if (rows && rows.length > 0) {
      const profile = rows[0]
      return NextResponse.json({
        profile: {
          id: profile.id || userId,
          email: profile.email || '',
          full_name: profile.full_name || '',
          tier: profile.tier || 'free',
          country: profile.country || 'US',
          created_at: profile.created_at || '',
        },
      })
    }

    // No profile row yet — return a free-tier default so the dashboard can render.
    const user = await currentUser()
    return NextResponse.json({
      profile: {
        id: userId,
        email: user?.emailAddresses?.[0]?.emailAddress || '',
        full_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        tier: 'free',
        country: 'US',
        created_at: '',
      },
    })
  } catch (error: any) {
    console.error('[PROXY /profile] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
