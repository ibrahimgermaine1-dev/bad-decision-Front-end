/**
 * Bad Decision AI — Backend API Client
 * All calls go through Next.js API proxy routes (same origin, no CORS issues).
 * BACKEND_URL and BACKEND_API_SECRET stay server-side only.
 */
import type { CoinBalance, Lead, SmartCollection, EngineType } from '@/stores/app-store'

// ============================================================
// TYPES
// ============================================================
export interface SearchResponse {
  task_id: string
  status: string
  message?: string
  detail?: string
}

export interface TaskStatusResponse {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'exhausted' | 'failed'
  engine?: string
  query?: string
  progress?: number
  leads?: Lead[]
  lead_count?: number
  error?: string
  detail?: string
}

export interface CoinBalanceResponse {
  coins_balance: number
  coins_reserved: number
  coins_lifetime: number
}

// ============================================================
// API CALLS
// ============================================================

/**
 * Start a search task on the backend.
 * The proxy route adds user_id and auth headers automatically.
 */
export async function startSearch(engine: EngineType, query: string): Promise<SearchResponse> {
  const res = await fetch('/api/backend/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine, query }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || data.error || `Search failed (${res.status})`)
  }

  return data
}

/**
 * Poll task status from the backend.
 * Returns current status + leads if completed.
 */
export async function pollTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`/api/backend/tasks/${taskId}`, {
    method: 'GET',
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || data.error || `Task check failed (${res.status})`)
  }

  return data
}

/**
 * Get user's coin balance from the backend.
 */
export async function fetchCoinBalance(): Promise<CoinBalanceResponse> {
  const res = await fetch('/api/backend/coins', {
    method: 'GET',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Failed to fetch coins' }))
    throw new Error(data.detail || data.error || `Coin balance fetch failed (${res.status})`)
  }

  const data = await res.json()
  // Backend may return { balance: { coins_balance, ... } } or flat object
  return data.balance || data
}

/**
 * Fetch user's search collections from Supabase directly.
 * Uses the anon key (respects RLS).
 */
export async function fetchCollections(userId: string): Promise<SmartCollection[]> {
  try {
    // Use Supabase REST API directly via fetch (no SDK needed)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey || supabaseUrl.includes('placeholder')) {
      console.warn('[API] Supabase not configured — skipping collections fetch')
      return []
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/search_tasks?select=id,query,engine,status,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=20`,
      {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      }
    )

    if (!res.ok) {
      console.error('[API] Collections fetch error:', await res.text())
      return []
    }

    const data = await res.json()

    return (data || []).map((task: any) => ({
      id: task.id,
      name: task.query || 'Untitled Search',
      task_type: (task.engine || 'ads_intent') as EngineType,
      lead_count: 0,
      created_at: task.created_at?.split('T')[0] || '',
    }))
  } catch (err) {
    console.error('[API] Collections fetch failed:', err)
    return []
  }
}

/**
 * Poll a search task until it completes or fails.
 * Polls every 3 seconds, up to maxAttempts.
 */
export async function pollUntilComplete(
  taskId: string,
  onProgress?: (status: TaskStatusResponse) => void,
  maxAttempts = 60,
  intervalMs = 3000,
): Promise<TaskStatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await pollTaskStatus(taskId)
    onProgress?.(status)

    if (status.status === 'completed' || status.status === 'failed' || status.status === 'exhausted') {
      return status
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('Search timed out. Please try again.')
}
